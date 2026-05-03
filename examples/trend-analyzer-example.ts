/**
 * Example: Trend Analyzer - Strategic Debt Analysis
 * 
 * Demonstrates how to analyze technical debt trends and generate
 * strategic insights for sprint planning.
 */

import { TrendAnalyzer } from '../src/utils/trend-analyzer.js';
import type { DebtAnalysisResult, TechnicalDebtIssue } from '../src/types/index.js';

// Sample analysis result with realistic technical debt
const sampleAnalysis: DebtAnalysisResult = {
  issues: [
    {
      id: 'SEC-001',
      category: 'security',
      file: 'src/auth/login.ts',
      problem: 'SQL injection vulnerability in authentication',
      impact: 'Critical security risk',
      estimated_fix_hours: 3,
      severity: 'critical',
      auto_fixable: false,
      business_impact_score: 9.5,
    },
    {
      id: 'ARCH-001',
      category: 'tight_coupling',
      file: 'src/services/UserService.ts',
      problem: 'God object with 45 methods',
      impact: 'Slows all feature development',
      estimated_fix_hours: 12,
      severity: 'high',
      auto_fixable: false,
      business_impact_score: 8.7,
    },
    {
      id: 'ARCH-002',
      category: 'tight_coupling',
      file: 'src/services/OrderService.ts',
      problem: 'Direct database calls in service layer',
      impact: 'Hard to test and maintain',
      estimated_fix_hours: 6,
      severity: 'high',
      auto_fixable: false,
      business_impact_score: 7.5,
    },
    {
      id: 'PATTERN-001',
      category: 'anti_pattern',
      file: 'src/components/Dashboard.tsx',
      problem: 'Business logic in React component',
      impact: 'Violates separation of concerns',
      estimated_fix_hours: 4,
      severity: 'medium',
      auto_fixable: false,
      business_impact_score: 6.2,
    },
    {
      id: 'PATTERN-002',
      category: 'anti_pattern',
      file: 'src/utils/helpers.ts',
      problem: 'Utility file with 30+ unrelated functions',
      impact: 'Poor organization',
      estimated_fix_hours: 5,
      severity: 'medium',
      auto_fixable: false,
      business_impact_score: 5.8,
    },
    {
      id: 'TEST-001',
      category: 'missing_tests',
      file: 'src/payment/processor.ts',
      problem: 'No unit tests for payment processing',
      impact: 'High risk of bugs',
      estimated_fix_hours: 6,
      severity: 'high',
      auto_fixable: false,
      business_impact_score: 7.8,
    },
    {
      id: 'TEST-002',
      category: 'missing_tests',
      file: 'src/services/NotificationService.ts',
      problem: 'Missing integration tests',
      impact: 'Notification failures not caught',
      estimated_fix_hours: 3,
      severity: 'medium',
      auto_fixable: false,
      business_impact_score: 5.5,
    },
    {
      id: 'CODE-001',
      category: 'dead_code',
      file: 'src/utils/legacy.ts',
      problem: 'Entire file unused (500 lines)',
      impact: 'Increases bundle size',
      estimated_fix_hours: 0.5,
      severity: 'low',
      auto_fixable: true,
      business_impact_score: 2.1,
    },
    {
      id: 'CODE-002',
      category: 'dead_code',
      file: 'src/components/OldModal.tsx',
      problem: 'Deprecated component still in codebase',
      impact: 'Confusion for developers',
      estimated_fix_hours: 0.5,
      severity: 'low',
      auto_fixable: true,
      business_impact_score: 1.8,
    },
    {
      id: 'CODE-003',
      category: 'dead_code',
      file: 'src/services/DeprecatedAPI.ts',
      problem: 'Unused API integration',
      impact: 'Maintenance burden',
      estimated_fix_hours: 1,
      severity: 'low',
      auto_fixable: true,
      business_impact_score: 2.3,
    },
    {
      id: 'DEP-001',
      category: 'outdated_dependency',
      file: 'package.json',
      problem: 'React 16.8 (3 major versions behind)',
      impact: 'Missing features and security patches',
      estimated_fix_hours: 8,
      severity: 'medium',
      auto_fixable: false,
      business_impact_score: 6.5,
    },
    {
      id: 'DEP-002',
      category: 'outdated_dependency',
      file: 'package.json',
      problem: 'lodash@4.17.15 has known vulnerabilities',
      impact: 'Security risk',
      estimated_fix_hours: 1,
      severity: 'medium',
      auto_fixable: true,
      business_impact_score: 4.2,
    },
  ],
  summary: {
    total_issues: 12,
    most_common_issue: 'tight_coupling',
    highest_risk_area: 'Services layer',
    total_estimated_hours: 50,
    auto_fixable_count: 4,
  },
  timestamp: new Date().toISOString(),
  repository: 'example/repo',
};

console.log('📊 Technical Debt Trend Analysis\n');
console.log('═'.repeat(80));

const analyzer = new TrendAnalyzer();

// Analyze trends
const trends = analyzer.analyzeTrends(sampleAnalysis);

// Display results
console.log('\n🔥 HOTTEST MODULE\n');
console.log(trends.hottest_module);

console.log('\n\n📈 FASTEST GROWING RISK\n');
console.log(trends.fastest_growing_risk);

console.log('\n\n⚡ QUICK WINS (< 1 hour each)\n');
trends.quick_wins.forEach((win, index) => {
  console.log(`${index + 1}. ${win}`);
});

console.log('\n\n🏗️  ARCHITECTURAL SMELL\n');
console.log(trends.architectural_smell);

console.log('\n\n📅 RECOMMENDED 3-WEEK SPRINT PLAN\n');
console.log('Week 1 (Focus: Critical & High Priority):');
trends.recommended_sprint_plan.week_1.forEach((id) => {
  const issue = sampleAnalysis.issues.find((i) => i.id === id);
  if (issue) {
    console.log(`  - ${id}: ${issue.problem} (${issue.estimated_fix_hours}h, ${issue.severity})`);
  }
});

console.log('\nWeek 2 (Focus: Medium Priority & Tests):');
trends.recommended_sprint_plan.week_2.forEach((id) => {
  const issue = sampleAnalysis.issues.find((i) => i.id === id);
  if (issue) {
    console.log(`  - ${id}: ${issue.problem} (${issue.estimated_fix_hours}h, ${issue.severity})`);
  }
});

console.log('\nWeek 3 (Focus: Cleanup & Dependencies):');
trends.recommended_sprint_plan.week_3.forEach((id) => {
  const issue = sampleAnalysis.issues.find((i) => i.id === id);
  if (issue) {
    console.log(`  - ${id}: ${issue.problem} (${issue.estimated_fix_hours}h, ${issue.severity})`);
  }
});

// Calculate sprint metrics
const week1Hours = trends.recommended_sprint_plan.week_1.reduce((sum, id) => {
  const issue = sampleAnalysis.issues.find((i) => i.id === id);
  return sum + (issue?.estimated_fix_hours || 0);
}, 0);

const week2Hours = trends.recommended_sprint_plan.week_2.reduce((sum, id) => {
  const issue = sampleAnalysis.issues.find((i) => i.id === id);
  return sum + (issue?.estimated_fix_hours || 0);
}, 0);

const week3Hours = trends.recommended_sprint_plan.week_3.reduce((sum, id) => {
  const issue = sampleAnalysis.issues.find((i) => i.id === id);
  return sum + (issue?.estimated_fix_hours || 0);
}, 0);

console.log('\n\n📊 SPRINT CAPACITY ANALYSIS\n');
console.log(`Week 1: ${week1Hours}h planned (${trends.recommended_sprint_plan.week_1.length} issues)`);
console.log(`Week 2: ${week2Hours}h planned (${trends.recommended_sprint_plan.week_2.length} issues)`);
console.log(`Week 3: ${week3Hours}h planned (${trends.recommended_sprint_plan.week_3.length} issues)`);
console.log(`Total: ${week1Hours + week2Hours + week3Hours}h over 3 weeks`);

console.log('\n\n💡 STRATEGIC RECOMMENDATIONS\n');
console.log('1. Address critical security issue (SEC-001) in Week 1');
console.log('2. Focus on architectural improvements to prevent debt accumulation');
console.log('3. Knock out quick wins for morale and momentum');
console.log('4. Add missing tests to enable safer refactoring');
console.log('5. Update dependencies to stay current and secure');

console.log('\n\n📄 JSON OUTPUT\n');
console.log('═'.repeat(80));
console.log(JSON.stringify(trends, null, 2));

console.log('\n✨ Trend analysis complete!\n');

// Made with Bob
