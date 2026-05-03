import { Octokit } from '@octokit/rest';
import { config } from '../config/index.js';
import type { RepoConfig, ScanOptions } from '../types/index.js';

export class GitHubScanner {
  private octokit: Octokit;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token || config.github.token,
    });
  }

  async cloneAndScanRepo(repoConfig: RepoConfig, options: ScanOptions = {}) {
    const { owner, repo, branch = 'main' } = repoConfig;
    const { maxFiles = 100, excludePaths = [] } = options;

    console.log(`Scanning repository: ${owner}/${repo} (branch: ${branch})`);

    try {
      // Get repository tree
      const { data: repoData } = await this.octokit.repos.get({
        owner,
        repo,
      });

      const { data: tree } = await this.octokit.git.getTree({
        owner,
        repo,
        tree_sha: branch,
        recursive: 'true',
      });

      // Filter files
      const files = tree.tree
        .filter((item) => item.type === 'blob')
        .filter((item) => !this.shouldExclude(item.path || '', excludePaths))
        .slice(0, maxFiles);

      console.log(`Found ${files.length} files to analyze`);

      // Fetch file contents
      const fileContents = await Promise.all(
        files.map(async (file) => {
          try {
            const { data } = await this.octokit.repos.getContent({
              owner,
              repo,
              path: file.path || '',
              ref: branch,
            });

            if ('content' in data && data.content) {
              return {
                path: file.path || '',
                content: Buffer.from(data.content, 'base64').toString('utf-8'),
                size: file.size || 0,
              };
            }
            return null;
          } catch (error) {
            console.warn(`Failed to fetch ${file.path}:`, error);
            return null;
          }
        })
      );

      return {
        repository: `${owner}/${repo}`,
        branch,
        files: fileContents.filter((f) => f !== null),
        metadata: {
          stars: repoData.stargazers_count,
          language: repoData.language,
          size: repoData.size,
        },
      };
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(`Repository not found. Please check the URL and ensure it is public or your token has access.`);
      }
      throw new Error(`Failed to scan repository: ${error.message || error}`);
    }

  }

  private shouldExclude(path: string, excludePaths: string[]): boolean {
    const defaultExcludes = [
      'node_modules/',
      '.git/',
      'dist/',
      'build/',
      'coverage/',
      '.next/',
      'vendor/',
      '__pycache__/',
      '.pytest_cache/',
      '.venv/',
      'venv/',
    ];

    const allExcludes = [...defaultExcludes, ...excludePaths];
    return allExcludes.some((exclude) => path.includes(exclude));
  }

  async getRepositoryInfo(owner: string, repo: string) {
    const { data } = await this.octokit.repos.get({ owner, repo });
    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      language: data.language,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      defaultBranch: data.default_branch,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async listBranches(owner: string, repo: string) {
    const { data } = await this.octokit.repos.listBranches({ owner, repo });
    return data.map((branch) => ({
      name: branch.name,
      protected: branch.protected,
      commit: branch.commit.sha,
    }));
  }
}

// Made with Bob
