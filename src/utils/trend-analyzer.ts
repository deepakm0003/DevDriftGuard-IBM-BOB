import type { TechnicalDebtIssue, DebtAnalysisResult, IssueCategory } from '../types/index.js';

export interface TrendAnalysisResult {
  hottest_module: string;
  fastest_growing_risk: string;
  quick_wins: string[];
  architectural_smell: string;
  recommended_sprint_plan: {
    week_1: string[];
    week_2: string[];
    week_3: string[];
  };
}

/**
 * Trend Analyzer - Strategic analysis of technical debt patterns
 * 
 * Analyzes debt distribution, growth patterns, and provides actionable recommendations
 */
export class TrendAnalyzer {
  /**
   * Analyze technical debt trends and generate strategic insights
   */
  analyzeTrends(analysisResult: DebtAnalysisResult): TrendAnalysisResult {
    const hottestModule = this.identifyHottestModule(analysisResult.issues);
    const fastestGrowingRisk = this.identifyFastestGrowingRisk(analysisResult.issues);
    const quickWins = this.identifyQuickWins(analysisResult.issues);
    const architecturalSmell = this.identifyArchitecturalSmell(analysisResult.issues);
    const sprintPlan = this.generateSprintPlan(analysisResult.issues);

    return {
      hottest_module: hottestModule,
      fastest_growing_risk: fastestGrowingRisk,
      quick_wins: quickWins,
      architectural_smell: architecturalSmell,
      recommended_sprint_plan: sprintPlan,
    };
  }

  /**
   * Analyze from JSON input
   */
  analyzeTrendsFromJSON(analysisJSON: string): string {
    try {
      const parsed = JSON.parse(analysisJSON);
      const analysisResult: DebtAnalysisResult = parsed;
      
      const result = this.analyzeTrends(analysisResult);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      throw new Error(`Failed to parse analysis JSON: ${error}`);
    }
  }

  /**
   * Identify the module/directory with the most technical debt
   */
  private identifyHottestModule(issues: TechnicalDebtIssue[]): string {
    // Group issues by module (first directory in path)
    const moduleMap = new Map<string, {
      count: number;
      totalHours: number;
      criticalCount: number;
      categories: Set<string>;
    }>();

    for (const issue of issues) {
      const module = this.extractModule(issue.file);
      const existing = moduleMap.get(module) || {
        count: 0,
        totalHours: 0,
        criticalCount: 0,
        categories: new Set<string>(),
      };

      existing.count++;
      existing.totalHours += issue.estimated_fix_hours;
      if (issue.severity === 'critical' || issue.severity === 'high') {
        existing.criticalCount++;
      }
      existing.categories.add(issue.category);

      moduleMap.set(module, existing);
    }

    // Find module with highest combined score
    let hottestModule = '';
    let highestScore = 0;

    for (const [module, data] of moduleMap.entries()) {
      // Score = count + (hours * 2) + (critical * 5) + (category diversity * 3)
      const score = 
        data.count + 
        (data.totalHours * 2) + 
        (data.criticalCount * 5) + 
        (data.categories.size * 3);

      if (score > highestScore) {
        highestScore = score;
        hottestModule = module;
      }
    }

    const moduleData = moduleMap.get(hottestModule);
    if (!moduleData) {
      return 'No significant debt concentration found';
    }

    const reasons: string[] = [];
    if (moduleData.count > 5) {
      reasons.push(`${moduleData.count} issues`);
    }
    if (moduleData.totalHours > 10) {
      reasons.push(`${moduleData.totalHours}h to fix`);
    }
    if (moduleData.criticalCount > 0) {
      reasons.push(`${moduleData.criticalCount} critical/high severity`);
    }
    if (moduleData.categories.size > 2) {
      reasons.push(`${moduleData.categories.size} different debt types`);
    }

    return `${hottestModule} - ${reasons.join(', ')}`;
  }

  /**
   * Identify which category of debt is likely to compound fastest
   */
  private identifyFastestGrowingRisk(issues: TechnicalDebtIssue[]): string {
    // Analyze debt categories by compounding potential
    const categoryAnalysis = new Map<IssueCategory, {
      count: number;
      avgSeverity: number;
      compoundingFactor: number;
    }>();

    // Compounding factors (how quickly debt grows if not addressed)
    const compoundingFactors: Record<IssueCategory, number> = {
      tight_coupling: 5, // Spreads to new features
      anti_pattern: 4, // Gets copied by developers
      missing_tests: 4, // Makes refactoring risky
      security: 3, // Vulnerabilities can multiply
      outdated_dependency: 2, // Falls further behind
      dead_code: 1, // Doesn't grow much
    };

    const severityScores: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    for (const issue of issues) {
      const existing = categoryAnalysis.get(issue.category) || {
        count: 0,
        avgSeverity: 0,
        compoundingFactor: compoundingFactors[issue.category],
      };

      existing.count++;
      existing.avgSeverity = 
        (existing.avgSeverity * (existing.count - 1) + severityScores[issue.severity]) / 
        existing.count;

      categoryAnalysis.set(issue.category, existing);
    }

    // Find category with highest growth risk
    let fastestGrowing: IssueCategory = 'anti_pattern';
    let highestRisk = 0;

    for (const [category, data] of categoryAnalysis.entries()) {
      // Risk = count × compounding_factor × avg_severity
      const risk = data.count * data.compoundingFactor * data.avgSeverity;
      
      if (risk > highestRisk) {
        highestRisk = risk;
        fastestGrowing = category;
      }
    }

    const data = categoryAnalysis.get(fastestGrowing);
    const explanations: Record<IssueCategory, string> = {
      tight_coupling: 'spreads to every new feature, making changes increasingly difficult',
      anti_pattern: 'gets copied by developers, multiplying the problem across the codebase',
      missing_tests: 'makes refactoring risky, causing debt to accumulate faster',
      security: 'vulnerabilities can be exploited and create cascading security issues',
      outdated_dependency: 'falls further behind, making eventual migration more costly',
      dead_code: 'accumulates slowly but creates confusion and maintenance burden',
    };

    return `${fastestGrowing} (${data?.count || 0} issues) - ${explanations[fastestGrowing]}`;
  }

  /**
   * Identify top 3 quick wins (fixable in under 1 hour)
   */
  private identifyQuickWins(issues: TechnicalDebtIssue[]): string[] {
    const quickWinIssues = issues
      .filter((issue) => issue.estimated_fix_hours <= 1)
      .sort((a, b) => {
        // Sort by: auto_fixable first, then by severity, then by hours
        if (a.auto_fixable !== b.auto_fixable) {
          return a.auto_fixable ? -1 : 1;
        }
        
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const severityDiff = 
          severityOrder[b.severity] - severityOrder[a.severity];
        
        if (severityDiff !== 0) {
          return severityDiff;
        }
        
        return a.estimated_fix_hours - b.estimated_fix_hours;
      })
      .slice(0, 3);

    return quickWinIssues.map((issue) => {
      const autoFixBadge = issue.auto_fixable ? ' [auto-fixable]' : '';
      return `${issue.id}: ${issue.problem} (${issue.estimated_fix_hours}h)${autoFixBadge}`;
    });
  }

  /**
   * Identify the biggest structural/architectural problem
   */
  private identifyArchitecturalSmell(issues: TechnicalDebtIssue[]): string {
    // Count architectural issues
    const architecturalCategories: IssueCategory[] = [
      'tight_coupling',
      'anti_pattern',
    ];

    const archIssues = issues.filter((issue) =>
      architecturalCategories.includes(issue.category)
    );

    if (archIssues.length === 0) {
      return 'No significant architectural issues detected';
    }

    // Analyze patterns
    const couplingIssues = archIssues.filter((i) => i.category === 'tight_coupling');
    const patternIssues = archIssues.filter((i) => i.category === 'anti_pattern');

    // Check for God objects
    const godObjects = archIssues.filter((i) =>
      i.problem.toLowerCase().includes('god object') ||
      i.problem.toLowerCase().includes('too many')
    );

    // Check for layering violations
    const layeringIssues = archIssues.filter((i) =>
      i.problem.toLowerCase().includes('database') ||
      i.problem.toLowerCase().includes('direct') ||
      i.problem.toLowerCase().includes('coupling')
    );

    if (godObjects.length > 0) {
      return `God objects detected in ${godObjects.length} modules - services are doing too much and need to be split into focused, single-responsibility components`;
    }

    if (layeringIssues.length > 0) {
      return `Layering violations in ${layeringIssues.length} components - business logic is mixed with data access and presentation, making the code hard to test and maintain`;
    }

    if (couplingIssues.length > patternIssues.length) {
      return `High coupling across ${couplingIssues.length} modules - components are too interdependent, making changes risky and slowing development velocity`;
    }

    return `Anti-patterns in ${patternIssues.length} areas - code quality issues are reducing maintainability and increasing the cost of future changes`;
  }

  /**
   * Generate a 3-week sprint plan
   */
  private generateSprintPlan(issues: TechnicalDebtIssue[]): {
    week_1: string[];
    week_2: string[];
    week_3: string[];
  } {
    // Sort issues by priority
    const prioritizedIssues = [...issues].sort((a, b) => {
      // Priority order: critical > high > medium > low
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      
      if (severityDiff !== 0) {
        return severityDiff;
      }

      // Then by business impact if available
      if (a.business_impact_score && b.business_impact_score) {
        return b.business_impact_score - a.business_impact_score;
      }

      // Then by estimated hours (easier first)
      return a.estimated_fix_hours - b.estimated_fix_hours;
    });

    const week1: string[] = [];
    const week2: string[] = [];
    const week3: string[] = [];

    let week1Hours = 0;
    let week2Hours = 0;
    let week3Hours = 0;

    const maxHoursPerWeek = 16; // ~2 days per week for debt work

    for (const issue of prioritizedIssues) {
      if (week1Hours + issue.estimated_fix_hours <= maxHoursPerWeek) {
        week1.push(issue.id);
        week1Hours += issue.estimated_fix_hours;
      } else if (week2Hours + issue.estimated_fix_hours <= maxHoursPerWeek) {
        week2.push(issue.id);
        week2Hours += issue.estimated_fix_hours;
      } else if (week3Hours + issue.estimated_fix_hours <= maxHoursPerWeek) {
        week3.push(issue.id);
        week3Hours += issue.estimated_fix_hours;
      } else {
        // Issue too large or weeks full, skip for now
        break;
      }
    }

    return {
      week_1: week1,
      week_2: week2,
      week_3: week3,
    };
  }

  private extractModule(filePath: string): string {
    const parts = filePath.split('/');
    
    // Skip common prefixes
    let startIndex = 0;
    if (parts[0] === 'src' || parts[0] === 'lib' || parts[0] === 'app') {
      startIndex = 1;
    }

    if (parts.length > startIndex + 1) {
      return parts.slice(startIndex, startIndex + 2).join('/');
    }
    
    return parts[startIndex] || 'root';
  }
}

/**
 * Quick function to analyze trends
 */
export function analyzeTrendsQuick(analysisResult: DebtAnalysisResult): TrendAnalysisResult {
  const analyzer = new TrendAnalyzer();
  return analyzer.analyzeTrends(analysisResult);
}

/**
 * CLI-friendly function that accepts and returns JSON strings
 */
export function analyzeTrendsFromJSON(analysisJSON: string): string {
  const analyzer = new TrendAnalyzer();
  return analyzer.analyzeTrendsFromJSON(analysisJSON);
}

// Made with Bob
