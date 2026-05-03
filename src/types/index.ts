export type IssueCategory = 
  | 'dead_code' 
  | 'outdated_dependency' 
  | 'security' 
  | 'anti_pattern' 
  | 'missing_tests' 
  | 'tight_coupling';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface TechnicalDebtIssue {
  id: string;
  category: IssueCategory;
  file: string;
  problem: string;
  impact: string;
  estimated_fix_hours: number;
  severity: IssueSeverity;
  auto_fixable: boolean;
  lines?: string;
  snippet?: string;
  blast_radius?: number;
  security_risk_score?: number;
  velocity_drag_score?: number;
  business_impact_score?: number;
}


export interface AnalysisSummary {
  total_issues: number;
  most_common_issue: IssueCategory;
  highest_risk_area: string;
  total_estimated_hours: number;
  auto_fixable_count: number;
}

export interface DebtAnalysisResult {
  issues: TechnicalDebtIssue[];
  summary: AnalysisSummary;
  timestamp: string;
  repository: string;
}

export interface RepoConfig {
  owner: string;
  repo: string;
  branch?: string;
  excludePaths?: string[];
}

export interface ScanOptions {
  maxFiles?: number;
  includeTests?: boolean;
  deepAnalysis?: boolean;
  categories?: IssueCategory[];
  excludePaths?: string[];
}

export interface RemediationPlan {
  issue_id: string;
  fix_description: string;
  code_changes: CodeChange[];
  test_changes: CodeChange[];
  pr_title: string;
  pr_description: string;
  estimated_time: number;
}

export interface CodeChange {
  file: string;
  action: 'create' | 'modify' | 'delete';
  content?: string;
  line_start?: number;
  line_end?: number;
}

export interface DashboardMetrics {
  total_debt_hours: number;
  issues_by_category: Record<IssueCategory, number>;
  issues_by_severity: Record<IssueSeverity, number>;
  top_files: Array<{ file: string; issue_count: number }>;
  trend_data: Array<{ date: string; issues: number }>;
}

// Made with Bob
