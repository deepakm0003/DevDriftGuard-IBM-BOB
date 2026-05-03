import type { DebtAnalysisResult, DashboardMetrics, IssueCategory, IssueSeverity } from '../types/index.js';

export class DashboardAPI {
  /**
   * Generate dashboard metrics from analysis results
   */
  generateMetrics(analysisResults: DebtAnalysisResult[]): DashboardMetrics {
    const latestResult = analysisResults[analysisResults.length - 1];

    if (!latestResult) {
      return this.getEmptyMetrics();
    }

    const issuesByCategory = this.groupByCategory(latestResult);
    const issuesBySeverity = this.groupBySeverity(latestResult);
    const topFiles = this.getTopFiles(latestResult);
    const trendData = this.getTrendData(analysisResults);

    return {
      total_debt_hours: latestResult.summary.total_estimated_hours,
      issues_by_category: issuesByCategory,
      issues_by_severity: issuesBySeverity,
      top_files: topFiles,
      trend_data: trendData,
    };
  }

  /**
   * Generate heatmap data for visualization
   */
  generateHeatmap(analysisResult: DebtAnalysisResult): Array<{
    file: string;
    category: IssueCategory;
    severity: IssueSeverity;
    impact_score: number;
  }> {
    return analysisResult.issues.map((issue) => ({
      file: issue.file,
      category: issue.category,
      severity: issue.severity,
      impact_score: issue.business_impact_score || 0,
    }));
  }

  /**
   * Calculate savings over time
   */
  calculateSavingsTimeline(
    analysisResults: DebtAnalysisResult[],
    hourlyRate: number = 100
  ): Array<{
    date: string;
    total_debt_cost: number;
    issues_fixed: number;
    savings: number;
  }> {
    const timeline: Array<{
      date: string;
      total_debt_cost: number;
      issues_fixed: number;
      savings: number;
    }> = [];

    let previousIssueCount = 0;

    for (const result of analysisResults) {
      const totalCost = result.summary.total_estimated_hours * hourlyRate;
      const issuesFixed = Math.max(0, previousIssueCount - result.summary.total_issues);
      const savings = issuesFixed * hourlyRate;

      timeline.push({
        date: result.timestamp,
        total_debt_cost: totalCost,
        issues_fixed: issuesFixed,
        savings,
      });

      previousIssueCount = result.summary.total_issues;
    }

    return timeline;
  }

  /**
   * Get module-level debt breakdown
   */
  getModuleBreakdown(analysisResult: DebtAnalysisResult): Array<{
    module: string;
    issue_count: number;
    total_hours: number;
    avg_severity: number;
  }> {
    const moduleMap = new Map<string, {
      issues: number;
      hours: number;
      severities: number[];
    }>();

    for (const issue of analysisResult.issues) {
      const module = this.extractModule(issue.file);
      const existing = moduleMap.get(module) || { issues: 0, hours: 0, severities: [] };

      existing.issues++;
      existing.hours += issue.estimated_fix_hours;
      existing.severities.push(this.severityToNumber(issue.severity));

      moduleMap.set(module, existing);
    }

    return Array.from(moduleMap.entries()).map(([module, data]) => ({
      module,
      issue_count: data.issues,
      total_hours: data.hours,
      avg_severity: data.severities.reduce((a, b) => a + b, 0) / data.severities.length,
    })).sort((a, b) => b.total_hours - a.total_hours);
  }

  /**
   * Generate fix recommendations
   */
  getFixRecommendations(analysisResult: DebtAnalysisResult, limit: number = 10): Array<{
    issue_id: string;
    file: string;
    problem: string;
    priority: number;
    reason: string;
  }> {
    const recommendations = analysisResult.issues
      .filter((issue) => issue.auto_fixable)
      .sort((a, b) => (b.business_impact_score || 0) - (a.business_impact_score || 0))
      .slice(0, limit)
      .map((issue, index) => ({
        issue_id: issue.id,
        file: issue.file,
        problem: issue.problem,
        priority: index + 1,
        reason: this.getRecommendationReason(issue),
      }));

    return recommendations;
  }

  private groupByCategory(result: DebtAnalysisResult): Record<IssueCategory, number> {
    const categories: Record<IssueCategory, number> = {
      dead_code: 0,
      outdated_dependency: 0,
      security: 0,
      anti_pattern: 0,
      missing_tests: 0,
      tight_coupling: 0,
    };

    for (const issue of result.issues) {
      categories[issue.category]++;
    }

    return categories;
  }

  private groupBySeverity(result: DebtAnalysisResult): Record<IssueSeverity, number> {
    const severities: Record<IssueSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const issue of result.issues) {
      severities[issue.severity]++;
    }

    return severities;
  }

  private getTopFiles(result: DebtAnalysisResult): Array<{ file: string; issue_count: number }> {
    const fileMap = new Map<string, number>();

    for (const issue of result.issues) {
      fileMap.set(issue.file, (fileMap.get(issue.file) || 0) + 1);
    }

    return Array.from(fileMap.entries())
      .map(([file, issue_count]) => ({ file, issue_count }))
      .sort((a, b) => b.issue_count - a.issue_count)
      .slice(0, 10);
  }

  private getTrendData(results: DebtAnalysisResult[]): Array<{ date: string; issues: number }> {
    return results.map((result) => ({
      date: result.timestamp,
      issues: result.summary.total_issues,
    }));
  }

  private extractModule(filePath: string): string {
    const parts = filePath.split('/');
    if (parts.length > 1) {
      return parts[0] + '/' + (parts[1] || '');
    }
    return parts[0] || 'root';
  }

  private severityToNumber(severity: IssueSeverity): number {
    const map: Record<IssueSeverity, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    return map[severity];
  }

  private getRecommendationReason(issue: any): string {
    if (issue.severity === 'critical') {
      return 'Critical severity - immediate attention required';
    }
    if (issue.category === 'security') {
      return 'Security risk - high priority fix';
    }
    if (issue.estimated_fix_hours <= 1) {
      return 'Quick win - low effort, high impact';
    }
    if (issue.business_impact_score && issue.business_impact_score > 8) {
      return 'High business impact - affects productivity';
    }
    return 'Auto-fixable - ready for automated remediation';
  }

  private getEmptyMetrics(): DashboardMetrics {
    return {
      total_debt_hours: 0,
      issues_by_category: {
        dead_code: 0,
        outdated_dependency: 0,
        security: 0,
        anti_pattern: 0,
        missing_tests: 0,
        tight_coupling: 0,
      },
      issues_by_severity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      top_files: [],
      trend_data: [],
    };
  }
}

// Made with Bob
