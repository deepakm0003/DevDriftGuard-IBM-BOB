/**
 * Example: Simple Issue Ranking
 * 
 * This demonstrates the simplified ranking formula:
 * Score = (estimated_fix_hours × 1.5) + severity_weight
 * 
 * Where severity_weight: critical=10, high=7, medium=4, low=1
 */

import { SimpleRanker } from '../src/utils/simple-ranker.js';
import type { TechnicalDebtIssue } from '../src/types/index.js';

// Example issues from a code analysis
const sampleIssues: TechnicalDebtIssue[] = [
  {
    id: 'issue-1',
    category: 'security',
    file: 'src/auth.ts',
    problem: 'SQL injection vulnerability in login endpoint',
    impact: 'Critical security risk - potential data breach',
    estimated_fix_hours: 3,
    severity: 'critical',
    auto_fixable: false,
  },
  {
    id: 'issue-2',
    category: 'dead_code',
    file: 'src/utils/helpers.ts',
    problem: 'Unused function calculateDeprecatedTotal',
    impact: 'Increases bundle size by 2KB',
    estimated_fix_hours: 0.5,
    severity: 'low',
    auto_fixable: true,
  },
  {
    id: 'issue-3',
    category: 'anti_pattern',
    file: 'src/services/UserService.ts',
    problem: 'God object with 45 methods',
    impact: 'Hard to maintain and test',
    estimated_fix_hours: 8,
    severity: 'high',
    auto_fixable: false,
  },
  {
    id: 'issue-4',
    category: 'missing_tests',
    file: 'src/payment/processor.ts',
    problem: 'No unit tests for payment processing logic',
    impact: 'High risk of bugs in production',
    estimated_fix_hours: 4,
    severity: 'high',
    auto_fixable: false,
  },
  {
    id: 'issue-5',
    category: 'outdated_dependency',
    file: 'package.json',
    problem: 'lodash@4.17.15 has known vulnerabilities',
    impact: 'Security risk and missing performance improvements',
    estimated_fix_hours: 1,
    severity: 'medium',
    auto_fixable: true,
  },
  {
    id: 'issue-6',
    category: 'tight_coupling',
    file: 'src/components/Dashboard.tsx',
    problem: 'Direct database calls in React component',
    impact: 'Violates separation of concerns',
    estimated_fix_hours: 2,
    severity: 'medium',
    auto_fixable: false,
  },
];

console.log('🔍 Simple Issue Ranking Example\n');
console.log('Formula: Score = (estimated_fix_hours × 1.5) + severity_weight');
console.log('Severity weights: critical=10, high=7, medium=4, low=1\n');
console.log('═'.repeat(70));

// Create ranker instance
const ranker = new SimpleRanker();

// Rank the issues
const result = ranker.rankIssues(sampleIssues);

// Display results
console.log('\n📊 RANKING RESULTS\n');

result.prioritized.forEach((issue, index) => {
  console.log(`${index + 1}. [Score: ${issue.score}] ${issue.title}`);
  console.log(`   ID: ${issue.id}`);
  console.log(`   Priority: ${issue.priority}`);
  console.log(`   ROI: ${issue.roi_statement}`);
  console.log('');
});

console.log('═'.repeat(70));
console.log('\n📈 SUMMARY\n');
console.log(`Total Estimated Hours: ${result.total_estimated_hours}`);
console.log(`Monthly Time Loss: ${result.monthly_time_loss}`);

// Group by priority
const fixNow = result.prioritized.filter((i) => i.priority === 'Fix now');
const thisSprint = result.prioritized.filter((i) => i.priority === 'This sprint');
const later = result.prioritized.filter((i) => i.priority === 'Later');

console.log('\n🎯 PRIORITY BREAKDOWN\n');
console.log(`Fix now: ${fixNow.length} issues`);
console.log(`This sprint: ${thisSprint.length} issues`);
console.log(`Later: ${later.length} issues`);

// Example: Using JSON input/output
console.log('\n\n📄 JSON OUTPUT\n');
console.log('═'.repeat(70));

const jsonResult = ranker.rankFromJSON(JSON.stringify({ issues: sampleIssues }));
console.log(jsonResult);

console.log('\n✨ Ranking complete!\n');

// Made with Bob
