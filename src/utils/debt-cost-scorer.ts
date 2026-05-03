import type { TechnicalDebtIssue, IssueSeverity } from '../types/index.js';

interface DebtCostItem {
  issue_id: string;
  title: string;
  dcs_score: number;
  sprint_velocity_drag: string;
  roi_if_fixed_now: string;
  fix_priority: 'Fix this week' | 'Fix this sprint' | 'Fix this quarter' | 'Monitor';
}

interface DebtCostResult {
  prioritized_debt: DebtCostItem[];
  total_debt_hours: number;
  monthly_cost_estimate: number;
}

/**
 * Debt Cost Scorer - Economic analysis of technical debt
 * 
 * Formula: DCS = (estimated_fix_hours × 1.5) + (blast_radius_files × 0.8) + (severity_weight × 10)
 * Where severity_weight: critical=4, high=3, medium=2, low=1
 */
export class DebtCostScorer {
  private readonly DEV_HOURLY_RATE = 50;
  private readonly SPRINT_WEEKS = 2;
  private readonly HOURS_PER_SPRINT = 80; // 2 weeks × 40 hours

  private getSeverityWeight(severity: IssueSeverity): number {
    const weights: Record<IssueSeverity, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    return weights[severity];
  }

  /**
   * Calculate Debt Cost Score (DCS)
   */
  private calculateDCS(
    estimatedFixHours: number,
    blastRadiusFiles: number,
    severity: IssueSeverity
  ): number {
    const severityWeight = this.getSeverityWeight(severity);
    const dcs = 
      (estimatedFixHours * 1.5) + 
      (blastRadiusFiles * 0.8) + 
      (severityWeight * 10);
    
    return Math.round(dcs * 100) / 100;
  }

  /**
   * Estimate blast radius (number of files affected)
   */
  private estimateBlastRadius(issue: TechnicalDebtIssue): number {
    // Use existing blast_radius if available, otherwise estimate
    if (issue.blast_radius !== undefined) {
      return issue.blast_radius;
    }

    // Estimate based on category
    const categoryEstimates: Record<string, number> = {
      security: 5,
      tight_coupling: 8,
      anti_pattern: 6,
      outdated_dependency: 10,
      missing_tests: 2,
      dead_code: 1,
    };

    return categoryEstimates[issue.category] || 3;
  }

  /**
   * Calculate sprint velocity drag
   */
  private calculateSprintVelocityDrag(
    dcsScore: number,
    category: string
  ): string {
    // Higher DCS = more drag on velocity
    let dragHours = 0;

    if (category === 'tight_coupling' || category === 'anti_pattern') {
      dragHours = dcsScore * 0.5;
    } else if (category === 'security') {
      dragHours = dcsScore * 0.3;
    } else if (category === 'missing_tests') {
      dragHours = dcsScore * 0.4;
    } else {
      dragHours = dcsScore * 0.2;
    }

    return `${Math.round(dragHours)} hours/sprint lost`;
  }

  /**
   * Calculate ROI if fixed now
   */
  private calculateROI(
    estimatedFixHours: number,
    dcsScore: number,
    category: string
  ): string {
    // Calculate ongoing cost over 6 months if NOT fixed
    const sprintsIn6Months = 13; // ~26 weeks / 2
    const dragPerSprint = parseFloat(
      this.calculateSprintVelocityDrag(dcsScore, category).split(' ')[0]
    );
    
    const totalDragHours = dragPerSprint * sprintsIn6Months;
    const costOfNotFixing = totalDragHours * this.DEV_HOURLY_RATE;
    const costOfFixing = estimatedFixHours * this.DEV_HOURLY_RATE;
    
    const netSavings = costOfNotFixing - costOfFixing;

    if (netSavings > 0) {
      return `saves $${Math.round(netSavings).toLocaleString()} over 6 months at $${this.DEV_HOURLY_RATE}/hr dev rate`;
    } else {
      return `minimal ROI - fix for quality/risk reduction`;
    }
  }

  /**
   * Determine fix priority based on DCS score and severity
   */
  private determineFixPriority(
    dcsScore: number,
    severity: IssueSeverity
  ): 'Fix this week' | 'Fix this sprint' | 'Fix this quarter' | 'Monitor' {
    if (severity === 'critical' || dcsScore >= 50) {
      return 'Fix this week';
    }
    if (dcsScore >= 30) {
      return 'Fix this sprint';
    }
    if (dcsScore >= 15) {
      return 'Fix this quarter';
    }
    return 'Monitor';
  }

  /**
   * Score and prioritize technical debt issues
   */
  scoreDebt(issues: TechnicalDebtIssue[]): DebtCostResult {
    const prioritizedDebt: DebtCostItem[] = issues
      .map((issue) => {
        const blastRadius = this.estimateBlastRadius(issue);
        const dcsScore = this.calculateDCS(
          issue.estimated_fix_hours,
          blastRadius,
          issue.severity
        );

        return {
          issue_id: issue.id,
          title: issue.problem,
          dcs_score: dcsScore,
          sprint_velocity_drag: this.calculateSprintVelocityDrag(
            dcsScore,
            issue.category
          ),
          roi_if_fixed_now: this.calculateROI(
            issue.estimated_fix_hours,
            dcsScore,
            issue.category
          ),
          fix_priority: this.determineFixPriority(dcsScore, issue.severity),
        };
      })
      .sort((a, b) => b.dcs_score - a.dcs_score);

    const totalDebtHours = issues.reduce(
      (sum, issue) => sum + issue.estimated_fix_hours,
      0
    );

    // Calculate monthly cost: sum of all velocity drag per sprint × 2 sprints/month
    const monthlyCost = prioritizedDebt.reduce((sum, item) => {
      const dragHours = parseFloat(item.sprint_velocity_drag.split(' ')[0]);
      return sum + (dragHours * 2 * this.DEV_HOURLY_RATE);
    }, 0);

    return {
      prioritized_debt: prioritizedDebt,
      total_debt_hours: totalDebtHours,
      monthly_cost_estimate: Math.round(monthlyCost),
    };
  }

  /**
   * Score debt from JSON input
   */
  scoreDebtFromJSON(issuesJSON: string): string {
    try {
      const parsed = JSON.parse(issuesJSON);
      const issues: TechnicalDebtIssue[] = parsed.issues || parsed;
      
      const result = this.scoreDebt(issues);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      throw new Error(`Failed to parse issues JSON: ${error}`);
    }
  }

  /**
   * Generate executive summary
   */
  generateExecutiveSummary(result: DebtCostResult): string {
    const criticalItems = result.prioritized_debt.filter(
      (item) => item.fix_priority === 'Fix this week'
    );
    const highPriorityItems = result.prioritized_debt.filter(
      (item) => item.fix_priority === 'Fix this sprint'
    );

    const totalROI = result.prioritized_debt.reduce((sum, item) => {
      const match = item.roi_if_fixed_now.match(/\$([0-9,]+)/);
      if (match) {
        return sum + parseInt(match[1].replace(/,/g, ''));
      }
      return sum;
    }, 0);

    return `
EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════

Total Technical Debt: ${result.total_debt_hours} hours
Monthly Cost Impact: $${result.monthly_cost_estimate.toLocaleString()}
Annual Cost Impact: $${(result.monthly_cost_estimate * 12).toLocaleString()}

PRIORITY BREAKDOWN:
- Fix this week: ${criticalItems.length} issues
- Fix this sprint: ${highPriorityItems.length} issues
- Total issues: ${result.prioritized_debt.length}

POTENTIAL 6-MONTH ROI: $${totalROI.toLocaleString()}

TOP 3 HIGHEST COST ITEMS:
${result.prioritized_debt.slice(0, 3).map((item, i) => 
  `${i + 1}. ${item.title} (DCS: ${item.dcs_score})\n   ${item.roi_if_fixed_now}`
).join('\n')}

RECOMMENDATION:
${criticalItems.length > 0 
  ? `Address ${criticalItems.length} critical items immediately to prevent escalation.`
  : 'No critical items. Focus on sprint-level priorities for steady improvement.'
}
`;
  }
}

/**
 * Standalone function for quick debt scoring
 */
export function scoreDebtQuick(issues: TechnicalDebtIssue[]): DebtCostResult {
  const scorer = new DebtCostScorer();
  return scorer.scoreDebt(issues);
}

/**
 * CLI-friendly function that accepts and returns JSON strings
 */
export function scoreDebtFromJSON(issuesJSON: string): string {
  const scorer = new DebtCostScorer();
  return scorer.scoreDebtFromJSON(issuesJSON);
}

// Made with Bob
