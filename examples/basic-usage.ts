/**
 * Basic usage example for DevDriftGuard
 * 
 * This example demonstrates how to:
 * 1. Scan a GitHub repository
 * 2. Analyze technical debt
 * 3. Generate a remediation roadmap
 * 4. Auto-fix issues and create PRs
 */

import { GitHubScanner } from '../src/phase1/github-scanner.js';
import { CodeAnalyzer } from '../src/phase1/code-analyzer.js';
import { TriageEngine } from '../src/phase2/triage-engine.js';
import { AutoRemediation } from '../src/phase3/auto-remediation.js';
import { DashboardAPI } from '../src/phase4/dashboard-api.js';

async function main() {
  // Configuration
  const repoConfig = {
    owner: 'facebook',
    repo: 'react',
    branch: 'main',
  };

  const scanOptions = {
    maxFiles: 50, // Limit for demo purposes
    deepAnalysis: true,
  };

  console.log('🚀 Starting DevDriftGuard analysis...\n');

  // ============================================
  // PHASE 1: DEEP SCAN
  // ============================================
  console.log('📡 Phase 1: Scanning repository...');
  
  const scanner = new GitHubScanner();
  const scanResult = await scanner.cloneAndScanRepo(repoConfig, scanOptions);
  
  console.log(`✅ Scanned ${scanResult.files.length} files`);
  console.log(`📦 Repository: ${scanResult.repository}`);
  console.log(`⭐ Stars: ${scanResult.metadata.stars}`);
  console.log(`💻 Language: ${scanResult.metadata.language}\n`);

  // Analyze code with AI
  console.log('🤖 Analyzing code with AI...');
  const analyzer = new CodeAnalyzer();
  const analysisResult = await analyzer.analyzeCodebase(
    scanResult.files,
    scanResult.repository
  );

  console.log(`✅ Found ${analysisResult.summary.total_issues} issues`);
  console.log(`📊 Most common: ${analysisResult.summary.most_common_issue}`);
  console.log(`⚠️  Highest risk: ${analysisResult.summary.highest_risk_area}\n`);

  // ============================================
  // PHASE 2: COST-WEIGHTED TRIAGE
  // ============================================
  console.log('💰 Phase 2: Calculating business impact...');
  
  const triage = new TriageEngine();
  const rankedResult = triage.rankIssues(analysisResult);
  const roadmap = triage.generateRemediationRoadmap(rankedResult);
  const costSavings = triage.calculateCostSavings(rankedResult);

  console.log(`✅ Ranked ${rankedResult.issues.length} issues by business impact`);
  console.log(`💵 Total debt cost: $${costSavings.total_debt_cost.toLocaleString()}`);
  console.log(`📉 Monthly velocity loss: ${costSavings.monthly_velocity_loss} hours`);
  console.log(`💰 Annual savings potential: $${costSavings.annual_savings_potential.toLocaleString()}\n`);

  // Display top 3 critical issues
  console.log('🎯 Top 3 Critical Issues:');
  roadmap.critical_path.slice(0, 3).forEach((item, index) => {
    console.log(`\n${index + 1}. [${item.category}] ${item.file}`);
    console.log(`   Problem: ${item.problem}`);
    console.log(`   Impact Score: ${item.business_impact_score?.toFixed(2)}`);
    console.log(`   Fix Time: ${item.estimated_fix_hours}h`);
    console.log(`   Auto-fixable: ${item.auto_fixable ? '✅' : '❌'}`);
  });

  // Display quick wins
  console.log('\n\n⚡ Quick Wins (Auto-fixable):');
  roadmap.quick_wins.slice(0, 5).forEach((item, index) => {
    console.log(`${index + 1}. ${item.file} - ${item.problem} (${item.estimated_fix_hours}h)`);
  });

  // ============================================
  // PHASE 3: AUTO-REMEDIATION (Demo)
  // ============================================
  console.log('\n\n🔧 Phase 3: Auto-remediation (Demo)...');
  
  const remediation = new AutoRemediation();
  
  // Find first auto-fixable issue
  const autoFixableIssue = rankedResult.issues.find((issue) => issue.auto_fixable);
  
  if (autoFixableIssue) {
    console.log(`\n🎯 Generating fix for: ${autoFixableIssue.problem}`);
    
    // Get file content
    const fileContent = scanResult.files.find(
      (f) => f.path === autoFixableIssue.file
    )?.content || '';

    // Generate fix plan
    const plan = await remediation.generateFix(autoFixableIssue, fileContent);
    
    console.log(`✅ Fix generated:`);
    console.log(`   Description: ${plan.fix_description}`);
    console.log(`   Code changes: ${plan.code_changes.length} files`);
    console.log(`   Test changes: ${plan.test_changes.length} files`);
    console.log(`   PR Title: ${plan.pr_title}`);
    
    // Note: Uncomment to actually create PR (requires write access)
    // const pr = await remediation.createPullRequest(
    //   repoConfig.owner,
    //   repoConfig.repo,
    //   plan
    // );
    // console.log(`✅ PR created: ${pr.pr_url}`);
  } else {
    console.log('ℹ️  No auto-fixable issues found in this scan');
  }

  // ============================================
  // PHASE 4: DASHBOARD METRICS
  // ============================================
  console.log('\n\n📊 Phase 4: Generating dashboard metrics...');
  
  const dashboard = new DashboardAPI();
  const metrics = dashboard.generateMetrics([rankedResult]);
  const heatmap = dashboard.generateHeatmap(rankedResult);
  const moduleBreakdown = dashboard.getModuleBreakdown(rankedResult);
  const recommendations = dashboard.getFixRecommendations(rankedResult, 5);

  console.log('\n📈 Dashboard Metrics:');
  console.log(`   Total Debt Hours: ${metrics.total_debt_hours}`);
  console.log(`   Issues by Category:`);
  Object.entries(metrics.issues_by_category).forEach(([category, count]) => {
    if (count > 0) {
      console.log(`     - ${category}: ${count}`);
    }
  });

  console.log('\n🗺️  Module Breakdown (Top 5):');
  moduleBreakdown.slice(0, 5).forEach((module, index) => {
    console.log(`${index + 1}. ${module.module}`);
    console.log(`   Issues: ${module.issue_count}, Hours: ${module.total_hours.toFixed(1)}`);
  });

  console.log('\n💡 Fix Recommendations (Top 5):');
  recommendations.forEach((rec) => {
    console.log(`${rec.priority}. ${rec.file}`);
    console.log(`   ${rec.problem}`);
    console.log(`   Reason: ${rec.reason}`);
  });

  console.log('\n\n✨ Analysis complete!');
  console.log('\n📝 Summary:');
  console.log(`   - Scanned ${scanResult.files.length} files`);
  console.log(`   - Found ${analysisResult.summary.total_issues} issues`);
  console.log(`   - ${analysisResult.summary.auto_fixable_count} auto-fixable`);
  console.log(`   - Estimated ${analysisResult.summary.total_estimated_hours} hours to fix`);
  console.log(`   - Potential savings: $${costSavings.annual_savings_potential.toLocaleString()}/year`);
}

// Run the example
main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

// Made with Bob
