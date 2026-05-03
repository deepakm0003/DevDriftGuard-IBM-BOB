import type { TechnicalDebtIssue, DebtAnalysisResult } from '../types/index.js';

export class TriageEngine {
  /**
   * Calculate business impact score for each issue based on multiple factors
   */
  calculateBusinessImpact(issue: TechnicalDebtIssue, allIssues: TechnicalDebtIssue[]): number {
    const severityWeight = this.getSeverityWeight(issue.severity);
    const blastRadius = this.calculateBlastRadius(issue, allIssues);
    const securityRisk = this.calculateSecurityRisk(issue);
    const velocityDrag = this.calculateVelocityDrag(issue);

    // Weighted formula: business impact = (severity * 0.3) + (blast_radius * 0.25) + (security * 0.25) + (velocity * 0.2)
    const businessImpact = 
      severityWeight * 0.3 +
      blastRadius * 0.25 +
      securityRisk * 0.25 +
      velocityDrag * 0.2;

    return Math.round(businessImpact * 100) / 100;
  }

  /**
   * Rank issues by business impact cost
   */
  rankIssues(analysisResult: DebtAnalysisResult): DebtAnalysisResult {
    const rankedIssues = analysisResult.issues.map((issue) => {
      const businessImpactScore = this.calculateBusinessImpact(issue, analysisResult.issues);
      const blastRadius = this.calculateBlastRadius(issue, analysisResult.issues);
      const securityRiskScore = this.calculateSecurityRisk(issue);
      const velocityDragScore = this.calculateVelocityDrag(issue);

      return {
        ...issue,
        business_impact_score: businessImpactScore,
        blast_radius: blastRadius,
        security_risk_score: securityRiskScore,
        velocity_drag_score: velocityDragScore,
      };
    });

    // Sort by business impact (highest first)
    rankedIssues.sort((a, b) => (b.business_impact_score || 0) - (a.business_impact_score || 0));

    return {
      ...analysisResult,
      issues: rankedIssues,
    };
  }

  /**
   * Generate prioritized remediation roadmap
   */
  generateRemediationRoadmap(analysisResult: DebtAnalysisResult) {
    const rankedResult = this.rankIssues(analysisResult);
    
    const roadmap = {
      critical_path: rankedResult.issues.slice(0, 5).map((issue, index) => ({
        priority: index + 1,
        issue_id: issue.id,
        file: issue.file,
        category: issue.category,
        problem: issue.problem,
        business_impact_score: issue.business_impact_score,
        estimated_fix_hours: issue.estimated_fix_hours,
        auto_fixable: issue.auto_fixable,
        recommended_action: this.getRecommendedAction(issue),
      })),
      quick_wins: rankedResult.issues
        .filter((issue) => issue.estimated_fix_hours <= 1 && issue.auto_fixable)
        .slice(0, 10)
        .map((issue) => ({
          issue_id: issue.id,
          file: issue.file,
          problem: issue.problem,
          estimated_fix_hours: issue.estimated_fix_hours,
        })),
      high_risk_items: rankedResult.issues
        .filter((issue) => issue.severity === 'critical' || issue.category === 'security')
        .map((issue) => ({
          issue_id: issue.id,
          file: issue.file,
          category: issue.category,
          severity: issue.severity,
          security_risk_score: issue.security_risk_score,
        })),
      total_estimated_hours: rankedResult.summary.total_estimated_hours,
      auto_fixable_hours: rankedResult.issues
        .filter((issue) => issue.auto_fixable)
        .reduce((sum, issue) => sum + issue.estimated_fix_hours, 0),
    };

    return roadmap;
  }

  private getSeverityWeight(severity: string): number {
    const weights = {
      critical: 10,
      high: 7,
      medium: 4,
      low: 2,
    };
    return weights[severity as keyof typeof weights] || 4;
  }

  private calculateBlastRadius(issue: TechnicalDebtIssue, allIssues: TechnicalDebtIssue[]): number {
    // Count how many other files are affected by similar issues
    const relatedIssues = allIssues.filter(
      (other) => other.category === issue.category && other.id !== issue.id
    );

    // Normalize to 0-10 scale
    const radius = Math.min(relatedIssues.length / 2, 10);
    return Math.round(radius * 10) / 10;
  }

  private calculateSecurityRisk(issue: TechnicalDebtIssue): number {
    if (issue.category === 'security') {
      return this.getSeverityWeight(issue.severity);
    }

    // Outdated dependencies can have security implications
    if (issue.category === 'outdated_dependency') {
      return this.getSeverityWeight(issue.severity) * 0.7;
    }

    // Other categories have minimal direct security risk
    return 2;
  }

  private calculateVelocityDrag(issue: TechnicalDebtIssue): number {
    // How much does this slow down future development?
    const categoryDrag = {
      tight_coupling: 9,
      anti_pattern: 8,
      dead_code: 6,
      missing_tests: 7,
      outdated_dependency: 5,
      security: 4,
    };

    const baseDrag = categoryDrag[issue.category] || 5;
    
    // Multiply by fix hours (harder to fix = more drag)
    const dragScore = baseDrag * (1 + issue.estimated_fix_hours / 10);
    
    return Math.min(Math.round(dragScore * 10) / 10, 10);
  }

  private getRecommendedAction(issue: TechnicalDebtIssue): string {
    if (issue.auto_fixable) {
      return 'Auto-fix available - Review and merge PR';
    }

    if (issue.severity === 'critical') {
      return 'Immediate manual intervention required';
    }

    if (issue.estimated_fix_hours <= 1) {
      return 'Quick fix - Schedule in current sprint';
    }

    if (issue.estimated_fix_hours <= 3) {
      return 'Schedule in next sprint';
    }

    return 'Add to backlog - Plan for future sprint';
  }

  /**
   * Calculate cost savings if issues are fixed
   */
  calculateCostSavings(analysisResult: DebtAnalysisResult, hourlyRate: number = 100): {
    total_debt_cost: number;
    monthly_velocity_loss: number;
    annual_savings_potential: number;
  } {
    const totalHours = analysisResult.summary.total_estimated_hours;
    const velocityLoss = analysisResult.issues.reduce(
      (sum, issue) => sum + (issue.velocity_drag_score || 0),
      0
    );

    return {
      total_debt_cost: totalHours * hourlyRate,
      monthly_velocity_loss: velocityLoss * 10, // hours per month
      annual_savings_potential: velocityLoss * 10 * 12 * hourlyRate,
    };
  }
}

// Made with Bob
