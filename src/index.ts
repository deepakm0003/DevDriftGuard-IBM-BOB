import express, { type Request, type Response } from 'express';
import OpenAI from 'openai';
import cors from 'cors';
import { config, validateConfig } from './config/index.js';
import { GitHubScanner } from './phase1/github-scanner.js';
import { CodeAnalyzer } from './phase1/code-analyzer.js';
import { TriageEngine } from './phase2/triage-engine.js';
import { AutoRemediation } from './phase3/auto-remediation.js';
import { SimpleRanker } from './utils/simple-ranker.js';
import { FixGenerator } from './utils/fix-generator.js';
import type { RepoConfig, ScanOptions } from './types/index.js';

const app = express();

app.use(cors({
  origin: '*', // Allow all for the hackathon demo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Increase timeout for long scans (5 minutes)
app.use((req, res, next) => {
  res.setTimeout(300000, () => {
    console.log('Request has timed out.');
    res.status(408).send('Request has timed out');
  });
  next();
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Scan repository endpoint
app.post('/api/scan', async (req: Request, res: Response) => {
  try {
    const { owner, repo, branch = 'main', options = {} } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({ error: 'owner and repo are required' });
    }

    const repoConfig: RepoConfig = { owner, repo, branch };
    const scanOptions: ScanOptions = options;

    // Phase 1: Scan repository
    const scanner = new GitHubScanner();
    const scanResult = await scanner.cloneAndScanRepo(repoConfig, scanOptions);

    // Phase 1: Analyze code
    const analyzer = new CodeAnalyzer();
    const analysisResult = await analyzer.analyzeCodebase(
      scanResult.files,
      scanResult.repository
    );

    // Phase 2: Rank by business impact
    const triage = new TriageEngine();
    const rankedResult = triage.rankIssues(analysisResult);
    const roadmap = triage.generateRemediationRoadmap(rankedResult);
    const costSavings = triage.calculateCostSavings(rankedResult);

    res.json({
      success: true,
      repository: scanResult.repository,
      metadata: scanResult.metadata,
      analysis: rankedResult,
      roadmap,
      cost_savings: costSavings,
      files: scanResult.files,
    });

  } catch (error: any) {
    console.error('Scan error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate fix for specific issue
app.post('/api/fix/:issueId', async (req: Request, res: Response) => {
  try {
    const { issueId } = req.params;
    const { owner, repo, issue, fileContent } = req.body;

    if (!owner || !repo || !issue || !fileContent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const remediation = new AutoRemediation();
    const plan = await remediation.generateFix(issue, fileContent);

    res.json({
      success: true,
      issue_id: issueId,
      plan,
    });
  } catch (error: any) {
    console.error('Fix generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create PR for fix
app.post('/api/pr/create', async (req: Request, res: Response) => {
  try {
    const { owner, repo, plan, baseBranch = 'main' } = req.body;

    if (!owner || !repo || !plan) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const remediation = new AutoRemediation();
    const pr = await remediation.createPullRequest(owner, repo, plan, baseBranch);

    res.json({
      success: true,
      pr_number: pr.pr_number,
      pr_url: pr.pr_url,
    });
  } catch (error: any) {
    console.error('PR creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Batch auto-fix endpoint
app.post('/api/batch-fix', async (req: Request, res: Response) => {
  try {
    const { owner, repo, issues, fileContents, maxPRs = 5 } = req.body;

    if (!owner || !repo || !issues || !fileContents) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const remediation = new AutoRemediation();
    const fileMap = new Map(Object.entries(fileContents)) as Map<string, string>;
    const results = await remediation.batchFix(owner, repo, issues, fileMap, maxPRs);

    res.json({
      success: true,
      fixed_count: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Batch fix error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get repository info
app.get('/api/repo/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;

    const scanner = new GitHubScanner();
    const info = await scanner.getRepositoryInfo(owner, repo);
    const branches = await scanner.listBranches(owner, repo);

    res.json({
      success: true,
      info,
      branches,
    });
  } catch (error: any) {
    console.error('Repository info error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Simple ranking endpoint
app.post('/api/rank-simple', async (req: Request, res: Response) => {
  try {
    const { issues } = req.body;

    if (!issues || !Array.isArray(issues)) {
      return res.status(400).json({ error: 'issues array is required' });
    }

    const ranker = new SimpleRanker();
    const result = ranker.rankIssues(issues);

    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Simple ranking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate structured fix endpoint
app.post('/api/generate-fix', async (req: Request, res: Response) => {
  try {
    const { category, file, problem, lines, fileContent } = req.body;

    if (!category || !file || !problem || !fileContent) {
      return res.status(400).json({ 
        error: 'category, file, problem, and fileContent are required' 
      });
    }

    const generator = new FixGenerator();
    const result = await generator.generateFix({
      category,
      file,
      problem,
      lines,
      fileContent,
    });

    res.json({
      success: true,
      fix: result,
    });
  } catch (error: any) {
    console.error('Fix generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debt cost scoring endpoint
app.post('/api/score-debt', async (req: Request, res: Response) => {
  try {
    const { issues } = req.body;

    if (!issues || !Array.isArray(issues)) {
      return res.status(400).json({ error: 'issues array is required' });
    }

    const { DebtCostScorer } = await import('./utils/debt-cost-scorer.js');
    const scorer = new DebtCostScorer();
    const result = scorer.scoreDebt(issues);

    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Debt scoring error:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI Chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    
    const openai = new OpenAI({
      apiKey: config.openai.apiKey,
      baseURL: config.openai.baseURL,
    });

    let systemPrompt = "You are Bob, an AI coding assistant for DevDriftGuard. You help developers understand and fix technical debt.";
    
    if (context?.selectedIssue) {
      const issue = context.selectedIssue;
      systemPrompt += `\n\nYou are currently discussing this issue:\n- Title: ${issue.title}\n- Category: ${issue.category}\n- Severity: ${issue.severity}\n- File: ${issue.file_path}\n- Impact: ${issue.description}`;
    }

    if (context?.repo) {
      systemPrompt += `\n\nThe current repository is: ${context.repo}`;
    }

    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    res.json({
      success: true,
      reply: response.choices[0]?.message?.content || "I'm not sure how to help with that. Could you provide more details?"
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
async function startServer() {
  try {
    validateConfig();
    
    const port = config.server.port;
    app.listen(port, () => {
      console.log(`🚀 DevDriftGuard API running on port ${port}`);
      console.log(`📊 Environment: ${config.server.nodeEnv}`);
      console.log(`🤖 AI Model: ${config.openai.model}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app };

// Made with Bob
