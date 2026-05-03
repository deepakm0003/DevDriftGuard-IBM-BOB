/**
 * Example: Debt Cost Scoring - Economic Analysis
 * 
 * This demonstrates the Debt Cost Score (DCS) calculation:
 * DCS = (estimated_fix_hours × 1.5) + (blast_radius_files × 0.8) + (severity_weight × 10)
 * 
 * Where severity_weight: critical=4, high=3, medium=2, low=1
 */

import { DebtCostScorer } from '../src/utils/debt-cost-scorer.js';
import type { TechnicalDebtIssue } from '../src/types/index.js';

// Sample technical debt issues
const sampleIssues: TechnicalDebtIssue[] = [
  {
    id: 'SEC-001',
    category: 'security',
    file: 'src/auth/login.ts',
    problem: 'SQL injection vulnerability in authentication',
    impact: 'Critical security risk - potential data breach',
    estimated_fix_hours: 3,
    severity: 'critical',
    auto_fixable: false,
    blast_radius: 5,
  },
  {
    id: 'ARCH-001',
    category: 'tight_coupling',
    file: 'src/services/UserService.ts',
    problem: 'God object with 45 methods across 8 modules',
    impact: 'Slows all feature development',
    estimated_fix_hours: 12,
    severity: 'high',
    auto_fixable: false,
    blast_radius: 8,
  },
  {
    id: 'TEST-001',
    category: 'missing_tests',
    file: 'src/payment/processor.ts',
    problem: 'No unit tests for payment processing',
    impact: 'High risk of production bugs',
    estimated_fix_hours: 6,
    severity: 'high',
    auto_fixable: false,
    blast_radius: 2,
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
    blast_radius: 15,
  },
  {
    id: 'CODE-001',
    category: 'dead_code',
    file: 'src/utils/legacy.ts',
    problem: 'Entire file unused (500 lines)',
    impact: 'Increases bundle size and confusion',
    estimated_fix_hours: 1,
    severity: 'low',
    auto_fixable: true,
    blast_radius: 1,
  },
  {
    id: 'PATTERN-001',
    category: 'anti_pattern',
    file: 'src/components/Dashboard.tsx',
    problem: 'Direct database calls in React component',
    impact: 'Violates architecture, hard to test',
    estimated_fix_hours: 4,
    severity: 'medium',
    auto_fixable: false,
    blast_radius: 3,
  },
];

console.log('💰 Debt Cost Scoring - Economic Analysis\n');
console.log('Formula: DCS = (hours × 1.5) + (blast_radius × 0.8) + (severity_weight × 10)');
console.log('Severity weights: critical=4, high=3, medium=2, low=1\n');
console.log('═'.repeat(80));

const scorer = new DebtCostScorer();

// Score the debt
const result = scorer.scoreDebt(sampleIssues);

// Display results
console.log('\n📊 PRIORITIZED TECHNICAL DEBT\n');

result.prioritized_debt.forEach((item, index) => {
  console.log(`${index + 1}. [DCS: ${item.dcs_score}] ${item.title}`);
  console.log(`   ID: ${item.issue_id}`);
  console.log(`   Priority: ${item.fix_priority}`);
  console.log(`   Velocity Drag: ${item.sprint_velocity_drag}`);
  console.log(`   ROI: ${item.roi_if_fixed_now}`);
  console.log('');
});

console.log('═'.repeat(80));
console.log('\n📈 FINANCIAL SUMMARY\n');
console.log(`Total Debt Hours: ${result.total_debt_hours}`);
console.log(`Monthly Cost Estimate: $${result.monthly_cost_estimate.toLocaleString()}`);
console.log(`Annual Cost Estimate: $${(result.monthly_cost_estimate * 12).toLocaleString()}`);

// Priority breakdown
const byPriority = {
  'Fix this week': result.prioritized_debt.filter(i => i.fix_priority === 'Fix this week').length,
  'Fix this sprint': result.prioritized_debt.filter(i => i.fix_priority === 'Fix this sprint').length,
  'Fix this quarter': result.prioritized_debt.filter(i => i.fix_priority === 'Fix this quarter').length,
  'Monitor': result.prioritized_debt.filter(i => i.fix_priority === 'Monitor').length,
};

console.log('\n🎯 PRIORITY BREAKDOWN\n');
Object.entries(byPriority).forEach(([priority, count]) => {
  if (count > 0) {
    console.log(`${priority}: ${count} issues`);
  }
});

// Executive summary
console.log('\n' + scorer.generateExecutiveSummary(result));

// JSON output
console.log('\n📄 JSON OUTPUT\n');
console.log('═'.repeat(80));
console.log(JSON.stringify(result, null, 2));

console.log('\n✨ Economic analysis complete!\n');

// Calculate specific metrics
const criticalIssues = result.prioritized_debt.filter(i => i.fix_priority === 'Fix this week');
if (criticalIssues.length > 0) {
  console.log('⚠️  URGENT ACTION REQUIRED\n');
  console.log(`${criticalIssues.length} critical issues need immediate attention:`);
  criticalIssues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue.title} (DCS: ${issue.dcs_score})`);
  });
  console.log('');
}

// ROI calculation
const totalPotentialSavings = result.prioritized_debt.reduce((sum, item) => {
  const match = item.roi_if_fixed_now.match(/\$([0-9,]+)/);
  if (match) {
    return sum + parseInt(match[1].replace(/,/g, ''));
  }
  return sum;
}, 0);

console.log('💡 INVESTMENT RECOMMENDATION\n');
console.log(`Invest ${result.total_debt_hours} hours now to save $${totalPotentialSavings.toLocaleString()} over 6 months`);
console.log(`ROI: ${Math.round((totalPotentialSavings / (result.total_debt_hours * 50)) * 100)}%`);
console.log('');

// Made with Bob
