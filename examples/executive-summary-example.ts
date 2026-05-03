/**
 * Example: Executive Summary Generator
 * 
 * Demonstrates how to generate concise, business-focused summaries
 * for non-technical executives and stakeholders.
 */

import { ExecutiveSummaryGenerator } from '../src/utils/executive-summary-generator.js';
import { TrendAnalyzer } from '../src/utils/trend-analyzer.js';
import { DebtCostScorer } from '../src/utils/debt-cost-scorer.js';
import type { DebtAnalysisResult } from '../src/types/index.js';

// Sample analysis result (from previous examples)
const sampleAnalysis: DebtAnalysisResult = {
  issues: [
    {
      id: 'SEC-001',
      category: 'security',
      file: 'src/auth/login.ts',
      problem: 'SQL injection vulnerability in authentication',
      impact: 'Critical security risk - potential data breach',
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
      id: 'TEST-001',
      category: 'missing_tests',
      file: 'src/payment/processor.ts',
      problem: 'No unit tests for payment processing',
      impact: 'High risk of bugs in production',
      estimated_fix_hours: 6,
      severity: 'high',
      auto_fixable: false,
      business_impact_score: 7.8,
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
  ],
  summary: {
    total_issues: 6,
    most_common_issue: 'dead_code',
    highest_risk_area: 'Authentication and Services',
    total_estimated_hours: 30,
    auto_fixable_count: 2,
  },
  timestamp: new Date().toISOString(),
  repository: 'acme-corp/customer-portal',
};

console.log('📊 Executive Summary Generator\n');
console.log('═'.repeat(80));

// Generate trend analysis
const trendAnalyzer = new TrendAnalyzer();
const trends = trendAnalyzer.analyzeTrends(sampleAnalysis);

// Calculate costs
const costScorer = new DebtCostScorer();
const costResult = costScorer.scoreDebt(sampleAnalysis.issues);

// Generate executive summary
const summaryGenerator = new ExecutiveSummaryGenerator();

console.log('\n📝 150-WORD EXECUTIVE SUMMARY\n');
console.log('═'.repeat(80));

const summary = summaryGenerator.generateFromAnalysis(
  sampleAnalysis,
  trends,
  costResult.monthly_cost_estimate
);

console.log(summary);

console.log('\n\n═'.repeat(80));
console.log('\n📄 FULL EXECUTIVE REPORT\n');
console.log('═'.repeat(80));

const fullReport = summaryGenerator.generateFullReport(
  sampleAnalysis,
  trends,
  costResult.monthly_cost_estimate
);

console.log(fullReport);

console.log('\n\n═'.repeat(80));
console.log('\n💼 EXAMPLE USE CASES\n');
console.log('═'.repeat(80));

console.log('\n1. Board Meeting Presentation');
console.log('   Use: Full report for quarterly tech debt review');
console.log('   Audience: Board members, investors');

console.log('\n2. VP/Director Update');
console.log('   Use: 150-word summary for weekly status email');
console.log('   Audience: Non-technical executives');

console.log('\n3. Budget Justification');
console.log('   Use: ROI section to justify engineering time allocation');
console.log('   Audience: Finance, product leadership');

console.log('\n4. Sprint Planning');
console.log('   Use: Recommended sprint plan for engineering team');
console.log('   Audience: Engineering managers, tech leads');

console.log('\n\n═'.repeat(80));
console.log('\n💡 KEY FEATURES\n');
console.log('═'.repeat(80));

console.log('\n✓ Plain English - No technical jargon');
console.log('✓ Business Impact - Costs in dollars, not code quality');
console.log('✓ ROI Analysis - Clear payback period and savings');
console.log('✓ Action Items - Specific, time-bound recommendations');
console.log('✓ Risk Translation - Technical risks in business terms');
console.log('✓ Concise Format - 150 words for busy executives');

console.log('\n\n✨ Executive summary generated!\n');

// Made with Bob
