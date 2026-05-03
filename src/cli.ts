#!/usr/bin/env node

import { GitHubScanner } from './phase1/github-scanner.js';
import { CodeAnalyzer } from './phase1/code-analyzer.js';
import { TriageEngine } from './phase2/triage-engine.js';
import { AutoRemediation } from './phase3/auto-remediation.js';
import { validateConfig } from './config/index.js';
import type { RepoConfig } from './types/index.js';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
DevDriftGuard CLI - Technical Debt Scanner

Usage:
  devdriftguard scan <owner> <repo> [branch]
  devdriftguard fix <owner> <repo> <issue-id>
  devdriftguard batch-fix <owner> <repo> [max-prs]

Examples:
  devdriftguard scan facebook react main
  devdriftguard fix myorg myrepo issue-123
  devdriftguard batch-fix myorg myrepo 5

Environment variables required:
  GITHUB_TOKEN - GitHub personal access token
  OPENAI_API_KEY - OpenAI API key
`);
    process.exit(1);
  }

  try {
    validateConfig();
  } catch (error: any) {
    console.error('❌ Configuration error:', error.message);
    console.error('Please set required environment variables in .env file');
    process.exit(1);
  }

  const command = args[0];

  try {
    switch (command) {
      case 'scan':
        await handleScan(args[1], args[2], args[3]);
        break;
      case 'fix':
        await handleFix(args[1], args[2], args[3]);
        break;
      case 'batch-fix':
        await handleBatchFix(args[1], args[2], parseInt(args[3] || '5'));
        break;
      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function handleScan(owner: string, repo: string, branch: string = 'main') {
  console.log(`\n🔍 Scanning ${owner}/${repo} (${branch})...\n`);

  const repoConfig: RepoConfig = { owner, repo, branch };

  // Phase 1: Scan
  const scanner = new GitHubScanner();
  const scanResult = await scanner.cloneAndScanRepo(repoConfig);
  console.log(`✅ Scanned ${scanResult.files.length} files`);

  // Phase 1: Analyze
  const analyzer = new CodeAnalyzer();
  const analysisResult = await analyzer.analyzeCodebase(scanResult.files, scanResult.repository);
  console.log(`✅ Found ${analysisResult.summary.total_issues} issues`);

  // Phase 2: Triage
  const triage = new TriageEngine();
  const rankedResult = triage.rankIssues(analysisResult);
  const roadmap = triage.generateRemediationRoadmap(rankedResult);
  const costSavings = triage.calculateCostSavings(rankedResult);

  // Display results
  console.log('\n📊 ANALYSIS SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Total Issues: ${rankedResult.summary.total_issues}`);
  console.log(`Most Common: ${rankedResult.summary.most_common_issue}`);
  console.log(`Highest Risk: ${rankedResult.summary.highest_risk_area}`);
  console.log(`Total Hours: ${rankedResult.summary.total_estimated_hours}`);
  console.log(`Auto-fixable: ${rankedResult.summary.auto_fixable_count}`);

  console.log('\n💰 COST ANALYSIS');
  console.log('═'.repeat(60));
  console.log(`Total Debt Cost: $${costSavings.total_debt_cost.toLocaleString()}`);
  console.log(`Monthly Velocity Loss: ${costSavings.monthly_velocity_loss} hours`);
  console.log(`Annual Savings Potential: $${costSavings.annual_savings_potential.toLocaleString()}`);

  console.log('\n🎯 TOP 5 CRITICAL ISSUES');
  console.log('═'.repeat(60));
  roadmap.critical_path.forEach((item) => {
    console.log(`\n${item.priority}. [${item.category}] ${item.file}`);
    console.log(`   Problem: ${item.problem}`);
    console.log(`   Impact Score: ${item.business_impact_score?.toFixed(2)}`);
    console.log(`   Fix Time: ${item.estimated_fix_hours}h`);
    console.log(`   Auto-fixable: ${item.auto_fixable ? '✅' : '❌'}`);
  });

  console.log('\n⚡ QUICK WINS (Auto-fixable)');
  console.log('═'.repeat(60));
  roadmap.quick_wins.forEach((item, index) => {
    console.log(`${index + 1}. ${item.file} - ${item.problem} (${item.estimated_fix_hours}h)`);
  });

  console.log('\n🚨 HIGH RISK ITEMS');
  console.log('═'.repeat(60));
  roadmap.high_risk_items.forEach((item, index) => {
    console.log(`${index + 1}. [${item.severity}] ${item.file} - ${item.category}`);
  });

  console.log('\n✨ Analysis complete!\n');
}

async function handleFix(owner: string, repo: string, issueId: string) {
  console.log(`\n🔧 Generating fix for issue: ${issueId}...\n`);
  console.log('This feature requires the full scan data.');
  console.log('Please use the API endpoint /api/fix/:issueId instead.\n');
}

async function handleBatchFix(owner: string, repo: string, maxPRs: number) {
  console.log(`\n🚀 Batch fixing up to ${maxPRs} issues in ${owner}/${repo}...\n`);
  console.log('This feature requires the full scan data.');
  console.log('Please use the API endpoint /api/batch-fix instead.\n');
}

main();

// Made with Bob
