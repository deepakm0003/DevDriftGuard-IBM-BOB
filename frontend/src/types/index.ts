export type IssueCategory = 
  | 'dead_code' 
  | 'outdated_dependency' 
  | 'security' 
  | 'anti_pattern' 
  | 'missing_tests' 
  | 'tight_coupling'
  | 'god_class';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface DebtIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  file_path: string;
  line_range: string;
  title: string;
  description: string;
  estimated_fix_hours: number;
  blast_radius_files: number;
  dcs_score: number;
  fix_priority: 'Fix this week' | 'Fix this sprint' | 'Fix this quarter' | 'Monitor';
  sprint_velocity_drag: string;
  roi_if_fixed_now: string;
  auto_fixable: boolean;
  snippet?: string;
  file?: string;
  problem?: string;
  impact?: string;
}


export interface ScanResult {
  repo_url: string;
  scanned_at: string;
  issues: DebtIssue[];
  total_debt_hours: number;
  monthly_cost_estimate: number;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    auto_fixable: number;
    total_issues: number;
    most_common_issue?: IssueCategory;
    highest_risk_area?: string;
  };
  repository?: string;
  metadata?: any;
  analysis?: any;
  roadmap?: any;
  cost_savings?: any;
  files?: Array<{ path: string; content: string }>;
}


export interface FixResult {
  issue_id: string;
  explanation: string;
  fixed_code: string;
  test_code: string;
  pr_title: string;
  pr_body: string;
  dependent_changes: string[];
  test_count: number;
  plan?: any;
}

export interface ChatMessage {
  id: string;
  role: 'bob' | 'user';
  content: string;
  timestamp: Date;
}

export interface RoadmapData {
  week1: string[];
  week2: string[];
  week3: string[];
  total_hours: number;
  monthly_savings: number;
}

// Made with Bob
