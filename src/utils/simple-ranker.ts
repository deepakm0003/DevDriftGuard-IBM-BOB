import type { TechnicalDebtIssue, IssueSeverity } from '../types/index.js';

interface SimplifiedIssue {
  id: string;
  title: string;
  score: number;
  roi_statement: string;
  priority: 'Fix now' | 'This sprint' | 'Later';
}

interface SimpleRankingResult {
  prioritized: SimplifiedIssue[];
  total_estimated_hours: number;
  monthly_time_loss: string;
}

/**
 * Simple ranking utility using formula: Score = (estimated_fix_hours × 1.5) + severity_weight
 * Where severity_weight: critical=10, high=7, medium=4, low=1
 */
export class SimpleRanker {
  private getSeverityWeight(severity: IssueSeverity): number {
    const weights: Record<IssueSeverity, number> = {
      critical: 10,
      high: 7,
      medium: 4,
      low: 1,
    };
    return weights[severity];
  }

  private calculateScore(issue: TechnicalDebtIssue): number {
    const severityWeight = this.getSeverityWeight(issue.severity);
    return issue.estimated_fix_hours * 1.5 + severityWeight;
  }

  private determinePriority(score: number, severity: IssueSeverity): 'Fix now' | 'This sprint' | 'Later' {
    if (severity === 'critical' || score >= 15) {
      return 'Fix now';
    }
    if (score >= 8) {
      return 'This sprint';
    }
    return 'Later';
  }

  private generateROIStatement(issue: TechnicalDebtIssue): string {
    // Estimate monthly time loss based on category and severity
    let monthlyHours = 0;

    switch (issue.category) {
      case 'security':
        monthlyHours = issue.severity === 'critical' ? 20 : 10;
        break;
      case 'tight_coupling':
        monthlyHours = issue.estimated_fix_hours * 2;
        break;
      case 'anti_pattern':
        monthlyHours = issue.estimated_fix_hours * 1.5;
        break;
      case 'missing_tests':
        monthlyHours = issue.estimated_fix_hours * 1.2;
        break;
      case 'dead_code':
        monthlyHours = issue.estimated_fix_hours * 0.5;
        break;
      case 'outdated_dependency':
        monthlyHours = issue.estimated_fix_hours * 0.8;
        break;
    }

    return `Fixing this saves ~${Math.round(monthlyHours)} hours/month`;
  }

  /**
   * Rank issues using the simple formula
   */
  rankIssues(issues: TechnicalDebtIssue[]): SimpleRankingResult {
    const prioritized: SimplifiedIssue[] = issues
      .map((issue) => {
        const score = this.calculateScore(issue);
        return {
          id: issue.id,
          title: issue.problem,
          score: Math.round(score * 100) / 100,
          roi_statement: this.generateROIStatement(issue),
          priority: this.determinePriority(score, issue.severity),
        };
      })
      .sort((a, b) => b.score - a.score);

    const totalEstimatedHours = issues.reduce(
      (sum, issue) => sum + issue.estimated_fix_hours,
      0
    );

    const monthlyTimeLoss = issues.reduce((sum, issue) => {
      const roiMatch = this.generateROIStatement(issue).match(/~(\d+)/);
      return sum + (roiMatch ? parseInt(roiMatch[1]) : 0);
    }, 0);

    return {
      prioritized,
      total_estimated_hours: totalEstimatedHours,
      monthly_time_loss: `${monthlyTimeLoss} hours`,
    };
  }

  /**
   * Rank issues from raw JSON input
   */
  rankFromJSON(issuesJSON: string): string {
    try {
      const parsed = JSON.parse(issuesJSON);
      const issues: TechnicalDebtIssue[] = parsed.issues || parsed;
      
      const result = this.rankIssues(issues);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      throw new Error(`Failed to parse issues JSON: ${error}`);
    }
  }
}

/**
 * Standalone function for quick ranking
 */
export function rankIssuesSimple(issues: TechnicalDebtIssue[]): SimpleRankingResult {
  const ranker = new SimpleRanker();
  return ranker.rankIssues(issues);
}

/**
 * CLI-friendly function that accepts and returns JSON strings
 */
export function rankIssuesFromJSON(issuesJSON: string): string {
  const ranker = new SimpleRanker();
  return ranker.rankFromJSON(issuesJSON);
}

// Made with Bob
