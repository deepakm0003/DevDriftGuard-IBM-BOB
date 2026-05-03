import OpenAI from 'openai';
import { Octokit } from '@octokit/rest';
import { config } from '../config/index.js';
import type { TechnicalDebtIssue, RemediationPlan, CodeChange } from '../types/index.js';

export class AutoRemediation {
  private openai: OpenAI;
  private octokit: Octokit;

  constructor(apiKey?: string, githubToken?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || config.openai.apiKey,
      baseURL: config.openai.baseURL,
    });
    this.octokit = new Octokit({
      auth: githubToken || config.github.token,
    });
  }

  /**
   * Generate a fix for a technical debt issue
   */
  async generateFix(
    issue: TechnicalDebtIssue,
    fileContent: string
  ): Promise<RemediationPlan> {
    console.log(`Generating fix for issue: ${issue.id}`);

    const prompt = this.buildFixPrompt(issue, fileContent);

    try {
      const response = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert software engineer. Generate a complete fix for the technical debt issue.
Return ONLY valid JSON with this structure:
{
  "fix_description": "Brief description of the fix",
  "code_changes": [
    {
      "file": "filename",
      "action": "modify",
      "content": "complete new file content"
    }
  ],
  "test_changes": [
    {
      "file": "test filename",
      "action": "create",
      "content": "complete test file content"
    }
  ],
  "pr_title": "Short PR title",
  "pr_description": "Detailed PR description with changes and rationale"
}`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 3000,
      });

      const content = response.choices[0]?.message?.content || '{}';
      const parsed = this.parseFixResponse(content, issue);

      return {
        issue_id: issue.id,
        fix_description: parsed.fix_description,
        code_changes: parsed.code_changes,
        test_changes: parsed.test_changes,
        pr_title: parsed.pr_title,
        pr_description: parsed.pr_description,
        estimated_time: issue.estimated_fix_hours,
      };
    } catch (error) {
      throw new Error(`Failed to generate fix: ${error}`);
    }
  }

  /**
   * Create a pull request with the fix
   */
  async createPullRequest(
    owner: string,
    repo: string,
    plan: RemediationPlan,
    baseBranch: string = 'main'
  ): Promise<{ pr_number: number; pr_url: string }> {
    const branchName = `fix/${plan.issue_id}-${Date.now()}`;

    try {
      console.log(`Creating PR for ${owner}/${repo} on branch ${baseBranch}`);
      
      // Get authenticated user
      let currentUser = '';
      try {
        const { data: user } = await this.octokit.users.getAuthenticated();
        currentUser = user.login;
        console.log(`Authenticated as: ${currentUser}`);
      } catch (authError: any) {
        console.error('GitHub Auth Error:', authError.message);
        throw new Error(`GitHub Authentication Failed: ${authError.message}. Please check if your GITHUB_TOKEN is valid and has 'repo' and 'user' scopes.`);
      }
      
      // Check if we own the repository or need to fork
      let targetOwner = owner;
      let needsFork = currentUser.toLowerCase() !== owner.toLowerCase();
      
      if (needsFork) {
        console.log(`Repository is owned by ${owner}, forking to ${currentUser}...`);
        try {
          // Check if fork already exists
          try {
            await this.octokit.repos.get({
              owner: currentUser,
              repo,
            });
            console.log(`Fork already exists: ${currentUser}/${repo}`);
          } catch {
            // Fork doesn't exist, create it
            console.log(`Creating fork for ${owner}/${repo}...`);
            await this.octokit.repos.createFork({
              owner,
              repo,
            });
            console.log(`Fork creation initiated...`);
            // Wait longer for fork to be ready in production
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
          targetOwner = currentUser;
        } catch (forkError: any) {
          console.error(`Failed to fork repository:`, forkError.message);
          throw new Error(`GitHub Fork Failed: ${forkError.message}. Ensure your GITHUB_TOKEN has 'repo' scope and you haven't hit fork limits.`);
        }
      }
      
      // Get repository info and default branch
      const { data: repoData } = await this.octokit.repos.get({
        owner: targetOwner,
        repo,
      });
      const actualBaseBranch = repoData.default_branch;
      console.log(`Using branch: ${actualBaseBranch}`);

      // Get base branch reference
      const { data: baseRef } = await this.octokit.git.getRef({
        owner: targetOwner,
        repo,
        ref: `heads/${actualBaseBranch}`,
      });
      console.log(`Base ref SHA: ${baseRef.object.sha}`);

      // Create new branch
      await this.octokit.git.createRef({
        owner: targetOwner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: baseRef.object.sha,
      });
      console.log(`Created branch: ${branchName}`);

      // Apply code changes
      for (const change of [...plan.code_changes, ...plan.test_changes]) {
        if (change.action === 'create' || change.action === 'modify') {
          await this.updateFile(targetOwner, repo, branchName, change);
        } else if (change.action === 'delete') {
          await this.deleteFile(targetOwner, repo, branchName, change.file);
        }
      }

      // Create pull request (from fork to original if forked)
      const { data: pr } = await this.octokit.pulls.create({
        owner, // Original owner
        repo,
        title: plan.pr_title,
        body: this.formatPRDescription(plan),
        head: needsFork ? `${targetOwner}:${branchName}` : branchName,
        base: actualBaseBranch,
      });

      console.log(`✅ Created PR #${pr.number}: ${pr.html_url}`);

      return {
        pr_number: pr.number,
        pr_url: pr.html_url,
      };
    } catch (error: any) {
      console.error('PR creation failed:', error.message);
      throw new Error(`Failed to create PR: ${error.message}`);
    }
  }

  private async updateFile(
    owner: string,
    repo: string,
    branch: string,
    change: CodeChange
  ): Promise<void> {
    try {
      // Try to get existing file
      let sha: string | undefined;
      try {
        const { data } = await this.octokit.repos.getContent({
          owner,
          repo,
          path: change.file,
          ref: branch,
        });
        if ('sha' in data) {
          sha = data.sha;
        }
      } catch {
        // File doesn't exist, will create new
      }

      await this.octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: change.file,
        message: `Fix: Update ${change.file}`,
        content: Buffer.from(change.content || '').toString('base64'),
        branch,
        sha,
      });
    } catch (error) {
      console.error(`Failed to update ${change.file}:`, error);
      throw error;
    }
  }

  private async deleteFile(
    owner: string,
    repo: string,
    branch: string,
    filePath: string
  ): Promise<void> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branch,
      });

      if ('sha' in data) {
        await this.octokit.repos.deleteFile({
          owner,
          repo,
          path: filePath,
          message: `Fix: Remove ${filePath}`,
          sha: data.sha,
          branch,
        });
      }
    } catch (error) {
      console.error(`Failed to delete ${filePath}:`, error);
    }
  }

  private buildFixPrompt(issue: TechnicalDebtIssue, fileContent: string): string {
    return `
Technical Debt Issue:
- Category: ${issue.category}
- File: ${issue.file}
- Problem: ${issue.problem}
- Impact: ${issue.impact}
- Severity: ${issue.severity}

Current File Content:
\`\`\`
${fileContent.slice(0, 3000)}
\`\`\`

Generate a complete fix including:
1. Modified code that resolves the issue
2. Unit tests to verify the fix
3. Clear PR description

Ensure the fix is production-ready and follows best practices.
`;
  }

  private parseFixResponse(content: string, issue: TechnicalDebtIssue): any {
    try {
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      const parsed = JSON.parse(jsonStr);

      return {
        fix_description: parsed.fix_description || 'Fix applied',
        code_changes: parsed.code_changes || [],
        test_changes: parsed.test_changes || [],
        pr_title: parsed.pr_title || `Fix: ${issue.problem}`,
        pr_description: parsed.pr_description || issue.impact,
      };
    } catch (error) {
      console.error('Failed to parse fix response:', error);
      return {
        fix_description: 'Manual fix required',
        code_changes: [],
        test_changes: [],
        pr_title: `Fix: ${issue.problem}`,
        pr_description: issue.impact,
      };
    }
  }

  private formatPRDescription(plan: RemediationPlan): string {
    return `
## 🔧 Technical Debt Fix

**Issue ID:** ${plan.issue_id}

### Description
${plan.fix_description}

### Changes Made
${plan.code_changes.map((c) => `- ${c.action} \`${c.file}\``).join('\n')}

### Tests Added
${plan.test_changes.length > 0 
  ? plan.test_changes.map((c) => `- ${c.action} \`${c.file}\``).join('\n')
  : '- No new tests (existing tests cover changes)'}

### Details
${plan.pr_description}

### Estimated Time Saved
⏱️ ${plan.estimated_time} hours

---
*Generated by DevDriftGuard - AI-powered technical debt remediation*
`;
  }

  /**
   * Batch process multiple issues
   */
  async batchFix(
    owner: string,
    repo: string,
    issues: TechnicalDebtIssue[],
    fileContents: Map<string, string>,
    maxPRs: number = 5
  ): Promise<Array<{ issue_id: string; pr_url: string }>> {
    const results: Array<{ issue_id: string; pr_url: string }> = [];
    const autoFixableIssues = issues.filter((issue) => issue.auto_fixable).slice(0, maxPRs);

    for (const issue of autoFixableIssues) {
      try {
        const fileContent = fileContents.get(issue.file) || '';
        const plan = await this.generateFix(issue, fileContent);
        const pr = await this.createPullRequest(owner, repo, plan);
        
        results.push({
          issue_id: issue.id,
          pr_url: pr.pr_url,
        });

        // Rate limiting: wait between PRs
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to fix issue ${issue.id}:`, error);
      }
    }

    return results;
  }
}

// Made with Bob
