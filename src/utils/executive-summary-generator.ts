import type { DebtAnalysisResult, TechnicalDebtIssue } from '../types/index.js';
import type { TrendAnalysisResult } from './trend-analyzer.js';

export interface ExecutiveSummaryInput {
  total_issues: number;
  total_fix_hours: number;
  monthly_cost: number;
  top_3_critical: Array<{
    id: string;
    problem: string;
    impact: string;
  }>;
  sprint_plan: {
    week_1: string[];
    week_2: string[];
    week_3: string[];
  };
  annual_cost?: number;
  roi_if_fixed_now?: number;
}

/**
 * Executive Summary Generator
 * 
 * Generates concise, business-focused summaries for non-technical executives
 */
export class ExecutiveSummaryGenerator {
  private readonly DEV_HOURLY_RATE = 50;

  /**
   * Generate a 150-word executive summary
   */
  generateSummary(input: ExecutiveSummaryInput): string {
    const businessCost = this.quantifyBusinessCost(input);
    const topRisks = this.explainTopRisks(input.top_3_critical);
    const roiAnalysis = this.calculateROI(input);
    const callToAction = this.generateCallToAction(input);

    return `${businessCost}

${topRisks}

${roiAnalysis}

${callToAction}`;
  }

  /**
   * Generate from full analysis results
   */
  generateFromAnalysis(
    analysisResult: DebtAnalysisResult,
    trendAnalysis: TrendAnalysisResult,
    monthlyCost: number
  ): string {
    // Extract top 3 critical issues
    const criticalIssues = analysisResult.issues
      .filter((i) => i.severity === 'critical' || i.severity === 'high')
      .sort((a, b) => (b.business_impact_score || 0) - (a.business_impact_score || 0))
      .slice(0, 3)
      .map((issue) => ({
        id: issue.id,
        problem: issue.problem,
        impact: issue.impact,
      }));

    const input: ExecutiveSummaryInput = {
      total_issues: analysisResult.summary.total_issues,
      total_fix_hours: analysisResult.summary.total_estimated_hours,
      monthly_cost: monthlyCost,
      annual_cost: monthlyCost * 12,
      top_3_critical: criticalIssues,
      sprint_plan: trendAnalysis.recommended_sprint_plan,
    };

    return this.generateSummary(input);
  }

  private quantifyBusinessCost(input: ExecutiveSummaryInput): string {
    const annualCost = input.annual_cost || input.monthly_cost * 12;
    const fixCost = input.total_fix_hours * this.DEV_HOURLY_RATE;

    return `Our codebase contains ${input.total_issues} technical debt issues costing $${input.monthly_cost.toLocaleString()}/month in lost productivity ($${annualCost.toLocaleString()}/year). Fixing these issues requires ${input.total_fix_hours} engineering hours ($${fixCost.toLocaleString()} one-time investment).`;
  }

  private explainTopRisks(criticalIssues: Array<{ id: string; problem: string; impact: string }>): string {
    if (criticalIssues.length === 0) {
      return 'Top risks: No critical issues identified. Focus on preventive maintenance.';
    }

    const risks = criticalIssues.slice(0, 3).map((issue, index) => {
      const plainEnglish = this.translateToPlainEnglish(issue.problem, issue.impact);
      return `${index + 1}. ${plainEnglish}`;
    });

    return `Top 3 risks:\n${risks.join('\n')}`;
  }

  private translateToPlainEnglish(problem: string, impact: string): string {
    const lowerProblem = problem.toLowerCase();
    const lowerImpact = impact.toLowerCase();

    // Security issues
    if (lowerProblem.includes('sql injection') || lowerProblem.includes('injection')) {
      return 'Security vulnerability allows hackers to access customer data';
    }
    if (lowerProblem.includes('security') || lowerProblem.includes('vulnerability')) {
      return 'Security hole exposes sensitive information to unauthorized access';
    }

    // Architectural issues
    if (lowerProblem.includes('god object') || lowerProblem.includes('too many')) {
      return 'Core system is overloaded, slowing down all new feature development';
    }
    if (lowerProblem.includes('coupling') || lowerProblem.includes('tight')) {
      return 'Systems are tangled together, making changes risky and expensive';
    }
    if (lowerProblem.includes('database') && lowerProblem.includes('component')) {
      return 'Poor architecture makes the system fragile and hard to scale';
    }

    // Testing issues
    if (lowerProblem.includes('no unit test') || lowerProblem.includes('missing test')) {
      if (lowerProblem.includes('payment') || lowerImpact.includes('payment')) {
        return 'Payment system has no safety checks, risking financial errors';
      }
      return 'Critical code lacks safety checks, increasing risk of production bugs';
    }

    // Dependencies
    if (lowerProblem.includes('outdated') || lowerProblem.includes('behind')) {
      return 'Outdated software components create security risks and limit new features';
    }

    // Dead code
    if (lowerProblem.includes('unused') || lowerProblem.includes('dead code')) {
      return 'Unnecessary code slows down development and increases maintenance costs';
    }

    // Generic fallback
    if (lowerImpact.includes('security')) {
      return 'Security risk that could lead to data breach or system compromise';
    }
    if (lowerImpact.includes('slow') || lowerImpact.includes('velocity')) {
      return 'Technical issue slowing down team productivity and feature delivery';
    }
    if (lowerImpact.includes('bug') || lowerImpact.includes('risk')) {
      return 'Quality issue increasing the likelihood of production failures';
    }

    // Last resort
    return `${problem} - ${impact}`;
  }

  private calculateROI(input: ExecutiveSummaryInput): string {
    const fixCost = input.total_fix_hours * this.DEV_HOURLY_RATE;
    const monthlySavings = input.monthly_cost;
    
    // Calculate payback period
    const paybackMonths = Math.ceil(fixCost / monthlySavings);
    
    // Sprint (2 weeks) vs Quarter (3 months) comparison
    const sprintSavings = (monthlySavings / 2) * 3; // 3 months of savings if fixed in 2 weeks
    const quarterDelay = monthlySavings * 3; // 3 months of continued cost if delayed
    
    const roiDifference = quarterDelay - (fixCost / 2); // Approximate cost of delay

    if (paybackMonths <= 1) {
      return `ROI: Fixing this sprint pays for itself in ${paybackMonths} month. Delaying to next quarter costs an additional $${quarterDelay.toLocaleString()} in lost productivity.`;
    } else if (paybackMonths <= 3) {
      return `ROI: Investment pays back in ${paybackMonths} months. Acting now vs. next quarter saves $${Math.round(roiDifference).toLocaleString()} in productivity losses.`;
    } else {
      return `ROI: While payback takes ${paybackMonths} months, delaying increases technical risk and compounds future costs. Early action prevents $${quarterDelay.toLocaleString()} in near-term losses.`;
    }
  }

  private generateCallToAction(input: ExecutiveSummaryInput): string {
    const week1Count = input.sprint_plan.week_1.length;
    const totalWeeks = 3;
    
    if (week1Count === 0) {
      return 'Recommendation: Maintain current quality standards and monitor for new debt accumulation.';
    }

    const urgency = input.top_3_critical.some((issue) => 
      issue.problem.toLowerCase().includes('security') ||
      issue.problem.toLowerCase().includes('critical')
    );

    if (urgency) {
      return `Action required: Allocate ${Math.ceil(input.total_fix_hours / totalWeeks)} hours/week for ${totalWeeks} weeks to address critical risks. Start with ${week1Count} high-priority items this week to prevent escalation.`;
    }

    return `Recommendation: Dedicate ${Math.ceil(input.total_fix_hours / totalWeeks)} hours/week over ${totalWeeks} weeks to eliminate this debt. Proposed plan addresses ${week1Count} items in week 1, preventing future slowdowns.`;
  }

  /**
   * Generate a one-page executive report
   */
  generateFullReport(
    analysisResult: DebtAnalysisResult,
    trendAnalysis: TrendAnalysisResult,
    monthlyCost: number
  ): string {
    const summary = this.generateFromAnalysis(analysisResult, trendAnalysis, monthlyCost);
    
    const report = `
TECHNICAL DEBT AUDIT - EXECUTIVE SUMMARY
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Repository: ${analysisResult.repository}

═══════════════════════════════════════════════════════════════════

${summary}

═══════════════════════════════════════════════════════════════════

DETAILED BREAKDOWN

Financial Impact:
• Monthly Cost: $${monthlyCost.toLocaleString()}
• Annual Cost: $${(monthlyCost * 12).toLocaleString()}
• One-time Fix Cost: $${(analysisResult.summary.total_estimated_hours * this.DEV_HOURLY_RATE).toLocaleString()}

Issue Distribution:
• Total Issues: ${analysisResult.summary.total_issues}
• Critical/High: ${analysisResult.issues.filter(i => i.severity === 'critical' || i.severity === 'high').length}
• Auto-fixable: ${analysisResult.summary.auto_fixable_count}
• Estimated Hours: ${analysisResult.summary.total_estimated_hours}

Strategic Insights:
• Hottest Module: ${trendAnalysis.hottest_module}
• Growing Risk: ${trendAnalysis.fastest_growing_risk}
• Architecture: ${trendAnalysis.architectural_smell}

Quick Wins (< 1 hour each):
${trendAnalysis.quick_wins.map((win, i) => `${i + 1}. ${win}`).join('\n')}

3-Week Sprint Plan:
• Week 1: ${trendAnalysis.recommended_sprint_plan.week_1.length} issues
• Week 2: ${trendAnalysis.recommended_sprint_plan.week_2.length} issues  
• Week 3: ${trendAnalysis.recommended_sprint_plan.week_3.length} issues

═══════════════════════════════════════════════════════════════════

Prepared by: DevDriftGuard Technical Debt Analysis System
`;

    return report.trim();
  }
}

/**
 * Quick function to generate executive summary
 */
export function generateExecutiveSummary(input: ExecutiveSummaryInput): string {
  const generator = new ExecutiveSummaryGenerator();
  return generator.generateSummary(input);
}

// Made with Bob
