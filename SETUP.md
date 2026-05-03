# DevDriftGuard - Complete Setup Guide

This guide will help you set up and run DevDriftGuard from scratch.

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **Git** (for cloning repositories)
   - Download from: https://git-scm.com/
   - Verify: `git --version`

## 🔑 Required API Keys

You'll need two API keys:

### 1. GitHub Personal Access Token

**Steps to create:**
1. Go to GitHub.com → Settings → Developer settings
2. Click "Personal access tokens" → "Tokens (classic)"
3. Click "Generate new token (classic)"
4. Give it a name: "DevDriftGuard"
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:org` (Read org and team membership)
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again!)

### 2. OpenAI API Key

**Steps to create:**
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys section
4. Click "Create new secret key"
5. Give it a name: "DevDriftGuard"
6. **Copy the key immediately**

**Note:** OpenAI API requires a paid account. You'll need to add payment method.

## 🚀 Installation Steps

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express (API server)
- @octokit/rest (GitHub API)
- openai (AI analysis)
- cors (API security)
- dotenv (environment variables)
- typescript (type safety)
- And more...

### Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your API keys:
```env
# GitHub Configuration
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_key_here
OPENAI_MODEL=gpt-4-turbo-preview

# Server Configuration
PORT=3000
NODE_ENV=development

# Analysis Configuration
MAX_FILES_TO_ANALYZE=100
ANALYSIS_TIMEOUT_MS=300000
```

**Important:** Replace the placeholder values with your actual keys!

### Step 3: Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

## ▶️ Running DevDriftGuard

### Option 1: Run API Server

Start the REST API server:

```bash
npm start
```

You should see:
```
🚀 DevDriftGuard API running on port 3000
📊 Environment: development
🤖 AI Model: gpt-4-turbo-preview
```

The API is now available at `http://localhost:3000`

### Option 2: Run CLI

Scan a repository directly from command line:

```bash
npm run dev src/cli.ts scan facebook react main
```

### Option 3: Run Examples

Try the example scripts:

```bash
# Basic usage example
npm run dev examples/basic-usage.ts

# Simple ranking example
npm run dev examples/simple-ranking-example.ts

# Debt cost scoring example
npm run dev examples/debt-cost-scorer-example.ts

# Fix generator example
npm run dev examples/fix-generator-example.ts

# Trend analyzer example
npm run dev examples/trend-analyzer-example.ts

# Executive summary example
npm run dev examples/executive-summary-example.ts

# PR description example
npm run dev examples/pr-description-example.ts
```

## 🔌 API Endpoints

Once the server is running, you can use these endpoints:

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Scan Repository
```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "facebook",
    "repo": "react",
    "branch": "main",
    "options": {
      "maxFiles": 50
    }
  }'
```

### 3. Simple Ranking
```bash
curl -X POST http://localhost:3000/api/rank-simple \
  -H "Content-Type: application/json" \
  -d '{
    "issues": [
      {
        "id": "issue-1",
        "category": "security",
        "file": "src/auth.ts",
        "problem": "SQL injection",
        "impact": "Critical risk",
        "estimated_fix_hours": 3,
        "severity": "critical",
        "auto_fixable": false
      }
    ]
  }'
```

### 4. Debt Cost Scoring
```bash
curl -X POST http://localhost:3000/api/score-debt \
  -H "Content-Type: application/json" \
  -d '{
    "issues": [...]
  }'
```

### 5. Trend Analysis
```bash
curl -X POST http://localhost:3000/api/analyze-trends \
  -H "Content-Type: application/json" \
  -d '{
    "analysisResult": {
      "issues": [...],
      "summary": {...}
    }
  }'
```

### 6. Generate Fix
```bash
curl -X POST http://localhost:3000/api/generate-fix \
  -H "Content-Type: application/json" \
  -d '{
    "category": "security",
    "file": "src/auth.ts",
    "problem": "SQL injection vulnerability",
    "fileContent": "..."
  }'
```

## 🧪 Running Tests

```bash
npm test
```

This runs the test suite using Vitest.

## 🐛 Troubleshooting

### Issue: "Cannot find module"

**Solution:** Install dependencies
```bash
npm install
```

### Issue: "Missing required environment variables"

**Solution:** Check your `.env` file has all required keys:
- GITHUB_TOKEN
- OPENAI_API_KEY

### Issue: "OpenAI API error: 401 Unauthorized"

**Solution:** 
1. Verify your OpenAI API key is correct
2. Ensure you have credits in your OpenAI account
3. Check if the key has proper permissions

### Issue: "GitHub API rate limit exceeded"

**Solution:**
1. Verify your GitHub token is set correctly
2. Authenticated requests have higher rate limits
3. Wait for rate limit to reset (check headers)

### Issue: TypeScript errors

**Solution:** Rebuild the project
```bash
npm run build
```

### Issue: Port 3000 already in use

**Solution:** Change the port in `.env`:
```env
PORT=3001
```

## 📚 Usage Examples

### Example 1: Scan Your Own Repository

1. Set your repo in `.env`:
```env
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo-name
```

2. Run the scan:
```bash
npm run dev examples/basic-usage.ts
```

### Example 2: Analyze Public Repository

```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "vercel",
    "repo": "next.js",
    "branch": "canary",
    "options": {
      "maxFiles": 30
    }
  }'
```

### Example 3: Generate Executive Summary

```bash
npm run dev examples/executive-summary-example.ts
```

## 💡 Tips

1. **Start Small:** Begin with small repositories (< 50 files) to test
2. **Monitor Costs:** OpenAI API calls cost money - track your usage
3. **Rate Limits:** GitHub has rate limits - use authenticated requests
4. **Cache Results:** Save analysis results to avoid re-scanning
5. **Test Mode:** Use examples before scanning production repos

## 📖 Next Steps

1. ✅ Complete setup and verify API keys work
2. ✅ Run health check endpoint
3. ✅ Try example scripts
4. ✅ Scan a small test repository
5. ✅ Review the analysis results
6. ✅ Generate fixes for auto-fixable issues
7. ✅ Create PRs with the fixes

## 🆘 Getting Help

If you encounter issues:

1. Check this setup guide
2. Review error messages carefully
3. Verify all environment variables are set
4. Check API key permissions
5. Review the README.md for more details

## 🔒 Security Notes

- **Never commit `.env` file** - it contains secrets
- **Keep API keys secure** - don't share them
- **Rotate keys regularly** - especially if exposed
- **Use environment-specific keys** - different keys for dev/prod
- **Monitor API usage** - track costs and usage

## ✅ Verification Checklist

Before using DevDriftGuard, verify:

- [ ] Node.js v18+ installed
- [ ] npm installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with API keys
- [ ] GitHub token has `repo` scope
- [ ] OpenAI API key is valid
- [ ] OpenAI account has credits
- [ ] Project builds successfully (`npm run build`)
- [ ] Health check endpoint works
- [ ] At least one example runs successfully

## 🎉 You're Ready!

Once all checks pass, you're ready to use DevDriftGuard to analyze and fix technical debt!

Start with:
```bash
npm start
```

Then visit: http://localhost:3000/health

Happy debt hunting! 🚀