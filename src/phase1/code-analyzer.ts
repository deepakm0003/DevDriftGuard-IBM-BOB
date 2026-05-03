import OpenAI from 'openai';
import { config } from '../config/index.js';
import type { TechnicalDebtIssue, IssueCategory, IssueSeverity, DebtAnalysisResult } from '../types/index.js';

export class CodeAnalyzer {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || config.openai.apiKey,
      baseURL: config.openai.baseURL,
    });
  }

  async analyzeCodebase(files: Array<{ path: string; content: string }>, repository: string): Promise<DebtAnalysisResult> {
    console.log(`Analyzing ${files.length} files with AI...`);

    const analysisPrompt = this.buildAnalysisPrompt(files);

    try {
      const response = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: `You are a senior software architect performing a technical debt audit.
Analyze the provided code files (as a representative subset of a larger repo).
Identify recurring patterns of technical debt and security vulnerabilities.

For each issue, provide:
1. A concise 'problem' title.
2. A detailed 'impact' analysis (3-5 sentences) explaining the technical risk, business cost, and why it should be fixed. This will be shown as "Problem Analysis" in the UI.

Return ONLY valid JSON in this format:
{
  "issues": [
    {
      "id": "unique_id",
      "category": "dead_code | outdated_dependency | security | anti_pattern | missing_tests | tight_coupling",
      "file": "file_name",
      "problem": "Concise issue title",
      "impact": "Detailed problem analysis and business impact",
      "estimated_fix_hours": number,
      "severity": "critical | high | medium | low",
      "auto_fixable": true/false,
      "lines": "line range",
      "snippet": "the relevant code snippet"
    }
  ],
  "summary": {
    "total_issues": number,
    "most_common_issue": "category",
    "highest_risk_area": "short description"
  }
}

Keep output concise. No explanations outside JSON.`,
          },
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 3000, // Reduced from 4000 to leave more room for input
      });

      const content = response.choices[0]?.message?.content || '{}';
      const parsed = this.parseAnalysisResponse(content, files);

      return {
        issues: parsed.issues,
        summary: {
          ...parsed.summary,
          total_estimated_hours: parsed.issues.reduce((sum, issue) => sum + issue.estimated_fix_hours, 0),
          auto_fixable_count: parsed.issues.filter((issue) => issue.auto_fixable).length,
        },
        timestamp: new Date().toISOString(),
        repository,
      };
    } catch (error) {
      throw new Error(`AI analysis failed: ${error}`);
    }
  }

  private buildAnalysisPrompt(files: Array<{ path: string; content: string }>): string {
    // Prioritize meaningful source files (js, ts, py, go, etc.) and exclude lock files/assets
    const priorityExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.java', '.c', '.cpp', '.rb'];
    const excludedFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.svg', '.png', '.jpg'];

    const sortedFiles = [...files].sort((a, b) => {
      const aExt = a.path.substring(a.path.lastIndexOf('.'));
      const bExt = b.path.substring(b.path.lastIndexOf('.'));
      const aPriority = priorityExtensions.includes(aExt) ? 0 : 1;
      const bPriority = priorityExtensions.includes(bExt) ? 0 : 1;
      return aPriority - bPriority;
    }).filter(f => !excludedFiles.some(ext => f.path.endsWith(ext)));

    // Increase sample size to 50 files for broader context
    const filesSample = sortedFiles.slice(0, 50);
    
    let prompt = `Repository contains ${files.length} total files. Analyzing a comprehensive sample of ${filesSample.length} key source files:\n\n`;
    let totalLines = 0;
    const maxTotalLines = 2000; // Increased line budget for "Full Repo" feel

    for (const file of filesSample) {
      const lines = file.content.split('\n');
      const remainingLines = maxTotalLines - totalLines;
      
      if (remainingLines <= 0) break;
      
      // Take up to 100 lines per file
      const linesToTake = Math.min(100, remainingLines);
      const preview = lines
        .slice(0, linesToTake)
        .map((line, i) => `${i + 1}: ${line.slice(0, 150)}`)
        .join('\n');
      
      prompt += `--- FILE: ${file.path} ---\n${preview}\n\n`;
      totalLines += linesToTake;
    }

    prompt += '\nIdentify technical debt issues across the entire repository structure based on this analysis. Provide specific line numbers and code snippets.';
    return prompt;
  }

  private parseAnalysisResponse(content: string, files: Array<{ path: string; content: string }>): { issues: TechnicalDebtIssue[]; summary: any } {
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      
      const parsed = JSON.parse(jsonStr);

      // Validate and enhance issues
      const issues: TechnicalDebtIssue[] = (parsed.issues || []).map((issue: any, index: number) => {
        let snippet = issue.snippet || '';
        let lines = issue.lines || '1';
        
        // ENHANCED Snippet Recovery: Always try to extract snippet from files
        if (issue.file && files) {
          const file = files.find(f => f.path === issue.file || f.path.endsWith(issue.file) || issue.file.endsWith(f.path));
          if (file) {
            // Parse line range
            const lineRange = String(lines).split(/[:-]/);
            const startLine = Math.max(1, parseInt(lineRange[0]) || 1);
            const endLine = parseInt(lineRange[1]) || startLine + 10; // Default to 10 lines if no end
            
            const fileLines = file.content.split('\n');
            const start = Math.max(0, startLine - 1);
            const end = Math.min(fileLines.length, endLine);
            
            // Extract snippet with context (5 lines before and after if possible)
            const contextStart = Math.max(0, start - 2);
            const contextEnd = Math.min(fileLines.length, end + 2);
            const extractedSnippet = fileLines.slice(contextStart, contextEnd).join('\n');
            
            // Use extracted snippet if we got something meaningful
            if (extractedSnippet && extractedSnippet.trim().length > 0) {
              snippet = extractedSnippet;
              // Update lines to reflect actual extracted range
              lines = `${contextStart + 1}-${contextEnd}`;
            }
          }
        }
        
        // If still no snippet, use the problem description as fallback
        if (!snippet || snippet.trim().length === 0) {
          snippet = `// Issue: ${issue.problem}\n// File: ${issue.file}\n// No code snippet available - full file loaded in context`;
        }

        return {
          id: issue.id || `issue-${index + 1}`,
          category: this.validateCategory(issue.category),
          file: issue.file || 'unknown',
          problem: issue.problem || 'No description',
          impact: issue.impact || 'Unknown impact',
          estimated_fix_hours: Number(issue.estimated_fix_hours) || 1,
          severity: this.validateSeverity(issue.severity),
          auto_fixable: Boolean(issue.auto_fixable),
          lines: lines,
          snippet: snippet,
        };
      });



      return {
        issues,
        summary: parsed.summary || {
          total_issues: issues.length,
          most_common_issue: 'anti_pattern',
          highest_risk_area: 'Unknown',
        },
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return {
        issues: [],
        summary: {
          total_issues: 0,
          most_common_issue: 'anti_pattern',
          highest_risk_area: 'Parse error',
        },
      };
    }
  }

  private validateCategory(category: string): IssueCategory {
    const validCategories: IssueCategory[] = [
      'dead_code',
      'outdated_dependency',
      'security',
      'anti_pattern',
      'missing_tests',
      'tight_coupling',
    ];
    return validCategories.includes(category as IssueCategory) 
      ? (category as IssueCategory) 
      : 'anti_pattern';
  }

  private validateSeverity(severity: string): IssueSeverity {
    const validSeverities: IssueSeverity[] = ['critical', 'high', 'medium', 'low'];
    return validSeverities.includes(severity as IssueSeverity) 
      ? (severity as IssueSeverity) 
      : 'medium';
  }

  async analyzeSpecificIssue(
    file: string,
    content: string,
    issueType: IssueCategory
  ): Promise<TechnicalDebtIssue | null> {
    const prompt = `Analyze this file for ${issueType} issues:\n\n${content.slice(0, 2000)}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a code quality expert. Identify specific technical debt issues and return JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 500,
      });

      const content_response = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(content_response);

      if (parsed.issue_found) {
        return {
          id: `${issueType}-${Date.now()}`,
          category: issueType,
          file,
          problem: parsed.problem || 'Issue detected',
          impact: parsed.impact || 'Unknown',
          estimated_fix_hours: parsed.estimated_fix_hours || 1,
          severity: this.validateSeverity(parsed.severity || 'medium'),
          auto_fixable: parsed.auto_fixable || false,
        };
      }

      return null;
    } catch (error) {
      console.error(`Failed to analyze ${file}:`, error);
      return null;
    }
  }
}

// Made with Bob
