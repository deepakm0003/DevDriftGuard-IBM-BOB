<div align="center">

# 🛡️ DevDriftGuard

### AI-Powered Technical Debt Management System

**Transform Technical Debt from an Invisible Burden into a Managed Asset**

[![Made with IBM Bob](https://img.shields.io/badge/Made%20with-IBM%20Bob-0f62fe?style=for-the-badge&logo=ibm)](https://www.ibm.com)
[![NVIDIA AI](https://img.shields.io/badge/Powered%20by-NVIDIA%20AI-76b900?style=for-the-badge&logo=nvidia)](https://www.nvidia.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)

[Live Demo](#) • [Documentation](#) • [Report Bug](https://github.com/yourusername/devdriftguard/issues) • [Request Feature](https://github.com/yourusername/devdriftguard/issues)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [Phase-by-Phase Breakdown](#-phase-by-phase-breakdown)
- [IBM Bob Integration](#-ibm-bob-integration)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**DevDriftGuard** is a comprehensive technical debt management platform that scans GitHub repositories, uses IBM Bob to deeply understand codebases, ranks issues by business impact (not just severity), and automatically generates production-ready fixes with tests—creating ready-to-merge pull requests in minutes.

### What Makes DevDriftGuard Different?

| Traditional Tools | DevDriftGuard |
|------------------|---------------|
| Find syntax issues | Find business-critical problems |
| Generic severity labels | Dollar-cost business impact |
| Report problems | Auto-fix with tests + create PRs |
| Developer-only tool | Platform for entire engineering org |

---

## 💔 The Problem

Technical debt costs the software industry **$300+ billion annually**, yet most teams struggle with:

### 1. **Invisible Costs**
- Technical debt accumulates silently
- Slows development velocity by 23-42%
- No visibility into financial impact

### 2. **Poor Prioritization**
- Teams fix issues by gut feeling
- "Critical" bugs in unused code get same priority as payment pipeline issues
- No data-driven decision making

### 3. **Manual Remediation**
- Developers spend 30% of time on repetitive fixes
- Drains morale and slows feature development
- Inconsistent code quality

### 4. **Leadership Blindness**
- Engineering managers can't quantify debt costs
- Impossible to justify dedicated debt reduction sprints
- No executive-ready reports

---

## 💡 Our Solution

DevDriftGuard provides a **complete 4-phase technical debt lifecycle**:

```
┌─────────────────────────────────────────────────────────────────┐
│  GitHub Repo URL                                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: DEEP SCAN (IBM Bob Architect Mode)                    │
│  • Dependency staleness audit                                   │
│  • Dead code detection                                          │
│  • Anti-pattern identification                                  │
│  • Security vulnerability surface                               │
│  • Test coverage gaps                                           │
│  • Tight coupling analysis                                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: COST-WEIGHTED TRIAGE ENGINE                          │
│  IBM Bob scores each issue by:                                  │
│  • Developer hours to fix                                       │
│  • Blast radius (how many files affected)                       │
│  • Security risk score                                          │
│  • Velocity drag (slows future work)                            │
│  → Output: DCS-Ranked Debt Roadmap                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: AUTO-REMEDIATION (IBM Bob Code Mode)                 │
│  • Bob generates production-ready fix                           │
│  • Bob writes comprehensive tests                               │
│  • Bob writes detailed PR description                           │
│  • Human approves → 1-click merge                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: REACT DASHBOARD (IBM Carbon Design)                  │
│  • Debt heatmap by module                                       │
│  • Cost savings meter (hours/sprint)                            │
│  • 3-week remediation roadmap                                   │
│  • Fix history timeline                                         │
│  • Bob chat embedded for custom queries                         │
│  • Professional PDF reports                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 🔍 **Intelligent Code Analysis**
- Scans up to 1000 files per repository
- Detects 6 categories of technical debt
- Semantic understanding (not just regex patterns)
- Context-aware issue detection

### 💰 **Business Impact Scoring (DCS Algorithm)**
```
DCS = (fix_hours × 1.5) + (blast_radius × 0.8) + (severity_weight × 10)
```
- Converts code issues to dollar costs
- Calculates monthly cost estimates
- Projects 6-month ROI at $50/hr dev rate
- Prioritizes by business impact, not just severity

### 🤖 **Auto-Remediation**
- IBM Bob generates production-ready fixes
- Comprehensive test coverage included
- Detailed PR descriptions with context
- One-click merge workflow

### 📊 **Executive Dashboard**
- Real-time metrics and analytics
- Visual debt heatmaps
- Cost savings tracking
- 3-week sprint planning roadmap
- Export professional PDF reports

### 💬 **AI Chat Assistant**
- Ask Bob about any issue
- Get architectural guidance
- Understand DCS scores
- Custom code queries

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   React 18   │  │  TypeScript  │  │ IBM Carbon   │         │
│  │   + Vite     │  │   + Hooks    │  │ Design System│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                            │                                    │
│                    ┌───────▼────────┐                          │
│                    │  Axios Client  │                          │
│                    │  (API Proxy)   │                          │
│                    └───────┬────────┘                          │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   REST API      │
                    │  (Port 3000)    │
                    └────────┬────────┘
┌────────────────────────────┼─────────────────────────────────┐
│                      BACKEND LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Node.js    │  │   Express    │  │  TypeScript  │        │
│  │   18+        │  │   Router     │  │   Compiler   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         │                  │                  │                │
│         └──────────────────┴──────────────────┘                │
│                            │                                   │
│         ┌──────────────────┴──────────────────┐               │
│         │                                      │               │
│  ┌──────▼────────┐                   ┌────────▼────────┐      │
│  │  Phase 1:     │                   │  Phase 3:       │      │
│  │  Code Analyzer│                   │  Auto-Remediate │      │
│  └──────┬────────┘                   └────────┬────────┘      │
│         │                                      │               │
│  ┌──────▼────────┐                   ┌────────▼────────┐      │
│  │  Phase 2:     │                   │  GitHub API     │      │
│  │  DCS Scorer   │                   │  Integration    │      │
│  └───────────────┘                   └─────────────────┘      │
└────────────────────────────────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   EXTERNAL APIs │
                    ├─────────────────┤
                    │  IBM Bob        │
                    │  (NVIDIA API)   │
                    ├─────────────────┤
                    │  GitHub REST    │
                    │  API            │
                    └─────────────────┘
```

### Data Flow

```
User Input (Repo URL)
    │
    ▼
Frontend (React) → API Request
    │
    ▼
Backend (Express) → GitHub Scanner
    │
    ▼
IBM Bob (Architect Mode) → Code Analysis
    │
    ▼
DCS Algorithm → Issue Ranking
    │
    ▼
Frontend Display → User Selection
    │
    ▼
IBM Bob (Code Mode) → Fix Generation
    │
    ▼
GitHub API → PR Creation
    │
    ▼
Success Response → Dashboard Update
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI Framework | 18.3.1 |
| **TypeScript** | Type Safety | 5.6.2 |
| **Vite** | Build Tool | 5.4.2 |
| **IBM Carbon Design** | UI Components | 1.68.2 |
| **Axios** | HTTP Client | 1.7.7 |
| **Recharts** | Data Visualization | 2.13.3 |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime | 18+ |
| **Express** | Web Framework | 4.21.1 |
| **TypeScript** | Type Safety | 5.6.3 |
| **Octokit** | GitHub API | 21.0.2 |
| **Axios** | HTTP Client | 1.7.7 |

### AI/ML
| Technology | Purpose |
|-----------|---------|
| **IBM Bob** | Code Understanding & Generation |
| **NVIDIA API** | AI Inference (gpt-oss-120b) |
| **Custom DCS Algorithm** | Business Impact Scoring |

### DevOps
| Technology | Purpose |
|-----------|---------|
| **Git** | Version Control |
| **GitHub Actions** | CI/CD (planned) |
| **Render/Railway** | Deployment |
| **Docker** | Containerization (planned) |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **GitHub Personal Access Token** with `repo` scope ([Create Token](https://github.com/settings/tokens))
- **NVIDIA API Key** for IBM Bob access ([Get Key](https://build.nvidia.com/))
- **Git** installed on your machine

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/devdriftguard.git
cd devdriftguard
```

#### 2. Install Backend Dependencies

```bash
npm install
```

#### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

#### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# GitHub Configuration
GITHUB_TOKEN=ghp_your_github_personal_access_token_here

# NVIDIA API Configuration (for IBM Bob)
NVIDIA_API_KEY=nvapi-your_nvidia_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Optional: Custom Settings
MAX_FILES_TO_SCAN=1000
DEVELOPER_HOURLY_RATE=50
```

#### 5. Start the Application

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

The backend API runs on:
```
http://localhost:3000
```

---

## 📚 Usage Guide

### Basic Workflow

#### Step 1: Scan a Repository

1. Open DevDriftGuard in your browser
2. Enter a GitHub repository URL (e.g., `https://github.com/facebook/react`)
3. Click **"Scan with Bob"**
4. Wait for the scan to complete (typically 30-60 seconds)

#### Step 2: Review Issues

1. Browse issues in the left sidebar (grouped by category)
2. Issues are ranked by **DCS Score** (Debt Cost Score)
3. Click any issue to view details:
   - Problem description
   - Business impact
   - Code snippet
   - Fix time estimate
   - ROI calculation

#### Step 3: Auto-Fix an Issue

1. Select an issue from the sidebar
2. Click **"Auto-Fix with Bob"** button
3. Bob generates:
   - Fixed code
   - Comprehensive tests
   - PR description
4. Review the generated fix in the "Auto-Fix" tab

#### Step 4: Create Pull Request

1. Click **"Create PR"** button
2. DevDriftGuard automatically:
   - Forks the repository (if needed)
   - Creates a new branch
   - Commits the fix
   - Opens a pull request
3. Review and merge on GitHub

#### Step 5: View Dashboard

1. Click **"Dashboard"** tab
2. View metrics:
   - Total issues found
   - Critical/High count
   - Total debt hours
   - Monthly cost estimate
   - Auto-fixable percentage

#### Step 6: Export Report

1. Click **"Export Report"** button
2. Professional PDF opens in new window
3. Use browser's "Print to PDF" to save
4. Share with stakeholders

---

## 🔄 Phase-by-Phase Breakdown

### Phase 1: Deep Scan (IBM Bob Architect Mode)

**Purpose:** Comprehensive codebase analysis to detect all technical debt

**Process:**
1. **Repository Cloning**
   - Fetches repository structure via GitHub API
   - Identifies all source files (up to 1000 files)
   - Filters by file extensions (.js, .ts, .jsx, .tsx, .py, etc.)

2. **Code Extraction**
   - Reads file contents
   - Extracts relevant code snippets (max 800 lines total)
   - Maintains context (imports, dependencies)

3. **IBM Bob Analysis**
   - Sends code to Bob in Architect Mode
   - Bob performs semantic analysis
   - Detects 6 categories of technical debt:
     - **Security Vulnerabilities** - SQL injection, XSS, hardcoded secrets
     - **Outdated Dependencies** - Old packages with CVEs
     - **Dead Code** - Unused functions, variables, imports
     - **Anti-Patterns** - God classes, tight coupling, code smells
     - **Missing Tests** - Untested code paths
     - **Architectural Issues** - Tight coupling, circular dependencies

4. **Issue Extraction**
   - Bob returns structured JSON
   - Each issue includes:
     - Title and description
     - File path and line range
     - Category and severity
     - Estimated fix time
     - Code snippet

**Output:** Array of detected issues with metadata

**Files Involved:**
- `src/phase1/github-scanner.ts` - Repository scanning
- `src/phase1/code-analyzer.ts` - IBM Bob integration

---

### Phase 2: Cost-Weighted Triage Engine

**Purpose:** Rank issues by business impact, not just severity

**Process:**
1. **DCS Calculation**
   ```typescript
   DCS = (estimated_fix_hours × 1.5) + 
         (blast_radius_files × 0.8) + 
         (severity_weight × 10)
   ```
   Where severity_weight:
   - Critical = 4
   - High = 3
   - Medium = 2
   - Low = 1

2. **Business Metrics**
   - **Sprint Velocity Drag:** How much it slows current sprint
   - **Monthly Cost Estimate:** DCS × $50/hr × 160 hours
   - **6-Month ROI:** Savings if fixed now vs. later
   - **Blast Radius:** Number of files affected

3. **Priority Assignment**
   - **Fix this week:** DCS ≥ 40 or Critical severity
   - **Fix this sprint:** DCS ≥ 20
   - **Fix this quarter:** DCS ≥ 10
   - **Monitor:** DCS < 10

4. **Roadmap Generation**
   - Groups issues into 3-week sprints
   - Balances quick wins vs. high-impact fixes
   - Considers team capacity

**Output:** Ranked issues with DCS scores and priorities

**Files Involved:**
- `src/phase2/dcs-scorer.ts` - DCS algorithm
- `src/phase2/roadmap-generator.ts` - Sprint planning

---

### Phase 3: Auto-Remediation (IBM Bob Code Mode)

**Purpose:** Generate production-ready fixes automatically

**Process:**
1. **Context Gathering**
   - Retrieves full file content
   - Identifies dependencies
   - Understands surrounding code

2. **Fix Generation (IBM Bob Code Mode)**
   - Bob analyzes the issue
   - Generates corrected code
   - Ensures backward compatibility
   - Follows existing code style

3. **Test Generation**
   - Bob writes unit tests
   - Covers edge cases
   - Uses existing test framework (Jest, Mocha, etc.)
   - Ensures 100% coverage of fix

4. **PR Description**
   - Bob writes detailed PR description:
     - Problem summary
     - Solution approach
     - Testing strategy
     - Potential side effects

5. **GitHub Integration**
   - Forks repository (if user doesn't own it)
   - Creates new branch (`devdriftguard-fix-{issue-id}`)
   - Commits changes
   - Opens pull request

**Output:** Ready-to-merge PR with tests

**Files Involved:**
- `src/phase3/auto-remediation.ts` - Fix generation
- `src/phase3/pr-creator.ts` - GitHub PR creation

---

### Phase 4: React Dashboard (IBM Carbon Design)

**Purpose:** Visualize technical debt and track progress

**Components:**

1. **Findings Tree (Left Sidebar)**
   - Issues grouped by category
   - Color-coded by severity
   - DCS scores displayed
   - Critical/High counter badge

2. **Issue Detail (Center Panel)**
   - Full issue description
   - 4-column metrics grid:
     - DCS Score
     - Fix Priority
     - Estimated Fix Time
     - Blast Radius
   - ROI calculation
   - Code snippet with syntax highlighting
   - Action buttons (Auto-Fix, Ask Bob, View Tests)

3. **Bob Chat (Right Panel)**
   - Interactive AI assistant
   - Contextual responses
   - Automatic messages on actions
   - Custom code queries

4. **Dashboard Tab**
   - Key metrics cards
   - Severity distribution chart
   - Category breakdown
   - Auto-fixable percentage

5. **Roadmap Tab**
   - 3-week sprint plan
   - Issues grouped by week
   - Time estimates per sprint
   - Progress tracking

**Files Involved:**
- `frontend/src/App.tsx` - Main layout
- `frontend/src/components/sidebar/FindingsTree.tsx` - Issue list
- `frontend/src/components/detail/IssueDetail.tsx` - Issue details
- `frontend/src/components/chat/BobChat.tsx` - AI chat
- `frontend/src/components/dashboard/Dashboard.tsx` - Metrics
- `frontend/src/components/roadmap/Roadmap.tsx` - Sprint planning

---

## 🤖 IBM Bob Integration

### How We Use IBM Bob

DevDriftGuard leverages IBM Bob across three critical workflows:

#### 1. **Architect Mode (Phase 1: Deep Scan)**

**Purpose:** Semantic code analysis and issue detection

**Implementation:**
```typescript
// src/phase1/code-analyzer.ts
const prompt = `
You are a senior software architect performing a technical debt audit.
Analyze the provided code files and identify recurring patterns of technical debt.
Return ONLY valid JSON with issues array.
`;

const response = await axios.post('https://integrate.api.nvidia.com/v1/chat/completions', {
  model: 'openai/gpt-oss-120b',
  messages: [
    { role: 'system', content: prompt },
    { role: 'user', content: codeContext }
  ],
  max_tokens: 3000
});
```

**Bob's Capabilities:**
- Understands code semantics, not just syntax
- Detects business logic issues
- Identifies architectural anti-patterns
- Explains WHY issues matter

#### 2. **Code Mode (Phase 3: Auto-Remediation)**

**Purpose:** Generate production-ready fixes with tests

**Implementation:**
```typescript
// src/phase3/auto-remediation.ts
const fixPrompt = `
Fix this ${issue.category} issue in the code below.
Generate:
1. Corrected code
2. Comprehensive unit tests
3. PR description

Issue: ${issue.title}
Description: ${issue.description}
File: ${issue.file_path}

Original Code:
${fileContent}
`;

const fixResponse = await axios.post(NVIDIA_API_URL, {
  model: 'openai/gpt-oss-120b',
  messages: [
    { role: 'system', content: 'You are an expert software engineer.' },
    { role: 'user', content: fixPrompt }
  ]
});
```

**Bob's Output:**
- Production-ready code
- Comprehensive test coverage
- Detailed PR descriptions
- Backward compatibility ensured

#### 3. **Conversational Mode (Phase 4: Chat Assistant)**

**Purpose:** Interactive code guidance and explanations

**Implementation:**
```typescript
// frontend/src/components/chat/BobChat.tsx
const chatResponse = await api.chat({
  message: userQuestion,
  context: {
    selectedIssue,
    scanResult,
    repoUrl
  }
});
```

**Bob's Responses:**
- Explains DCS scores
- Provides architectural guidance
- Suggests alternative fixes
- Answers custom code queries

### Why IBM Bob?

| Feature | IBM Bob | Other AI Models |
|---------|---------|-----------------|
| Code Understanding | Semantic + Context | Syntax-based |
| Fix Quality | Production-ready | Often needs editing |
| Business Context | Explains impact | Technical only |
| Multi-Modal | Analysis + Generation + Chat | Single purpose |

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Scan Repository

**POST** `/scan`

Scans a GitHub repository for technical debt.

**Request Body:**
```json
{
  "repoUrl": "https://github.com/facebook/react"
}
```

**Response:**
```json
{
  "repo_url": "https://github.com/facebook/react",
  "scanned_at": "2024-01-15T10:30:00Z",
  "issues": [
    {
      "id": "issue-1",
      "title": "SQL Injection Vulnerability",
      "description": "User input not sanitized...",
      "category": "security",
      "severity": "critical",
      "file_path": "src/auth/login.ts",
      "line_range": "45-52",
      "dcs_score": 8.7,
      "estimated_fix_hours": 2,
      "blast_radius_files": 3,
      "auto_fixable": false,
      "code_snippet": "const query = `SELECT * FROM users WHERE...`"
    }
  ],
  "summary": {
    "total_issues": 42,
    "critical": 3,
    "high": 12,
    "medium": 20,
    "low": 7,
    "auto_fixable": 15
  },
  "total_debt_hours": 87.5,
  "monthly_cost_estimate": 7000
}
```

#### 2. Generate Fix

**POST** `/fix`

Generates an auto-fix for a specific issue.

**Request Body:**
```json
{
  "issueId": "issue-1",
  "repoUrl": "https://github.com/facebook/react",
  "issue": { /* issue object */ }
}
```

**Response:**
```json
{
  "issue_id": "issue-1",
  "fixed_code": "const query = db.prepare('SELECT * FROM users WHERE id = ?')...",
  "test_code": "describe('Login', () => { test('prevents SQL injection'...",
  "explanation": "Replaced string concatenation with parameterized query...",
  "pr_title": "fix(security): prevent SQL injection in login",
  "pr_body": "## Problem\nSQL injection vulnerability...",
  "test_count": 3
}
```

#### 3. Create Pull Request

**POST** `/pr/create`

Creates a pull request with the generated fix.

**Request Body:**
```json
{
  "owner": "facebook",
  "repo": "react",
  "plan": { /* fix result object */ }
}
```

**Response:**
```json
{
  "pr_url": "https://github.com/facebook/react/pull/12345",
  "pr_number": 12345,
  "branch": "devdriftguard-fix-issue-1",
  "status": "open"
}
```

#### 4. Chat with Bob

**POST** `/chat`

Send a message to IBM Bob for code guidance.

**Request Body:**
```json
{
  "message": "Why does this issue have a high DCS score?",
  "context": {
    "issueId": "issue-1",
    "repoUrl": "https://github.com/facebook/react"
  }
}
```

**Response:**
```json
{
  "response": "This issue has a high DCS score (8.7) because...",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

---

## 🚢 Deployment

### Deploy to Render

#### 1. Prepare for Deployment

Create `render.yaml` in root:

```yaml
services:
  - type: web
    name: devdriftguard-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: GITHUB_TOKEN
        sync: false
      - key: NVIDIA_API_KEY
        sync: false

  - type: web
    name: devdriftguard-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/dist
    envVars:
      - key: VITE_API_URL
        value: https://devdriftguard-backend.onrender.com
```

#### 2. Deploy Backend

```bash
# Push to GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main

# On Render Dashboard:
# 1. New Web Service
# 2. Connect GitHub repo
# 3. Select "devdriftguard-backend"
# 4. Add environment variables
# 5. Deploy
```

#### 3. Deploy Frontend

```bash
# Update frontend/.env.production
VITE_API_URL=https://devdriftguard-backend.onrender.com

# On Render Dashboard:
# 1. New Static Site
# 2. Connect GitHub repo
# 3. Build command: cd frontend && npm install && npm run build
# 4. Publish directory: frontend/dist
# 5. Deploy
```

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy backend
railway up

# Deploy frontend
cd frontend
railway up
```

### Environment Variables for Production

```env
# Backend (.env)
NODE_ENV=production
PORT=3000
GITHUB_TOKEN=your_github_token
NVIDIA_API_KEY=your_nvidia_api_key

# Frontend (.env.production)
VITE_API_URL=https://your-backend-url.com
```

---

## 📸 Screenshots

### 1. Scan Progress
![Scan Progress](docs/screenshots/scan-progress.png)
*Real-time scanning with detailed logs*

### 2. Issue Detail View
![Issue Detail](docs/screenshots/issue-detail.png)
*Comprehensive issue analysis with DCS scoring*

### 3. Auto-Fix Generation
![Auto-Fix](docs/screenshots/auto-fix.png)
*IBM Bob generates production-ready fixes*

### 4. Dashboard
![Dashboard](docs/screenshots/dashboard.png)
*Executive metrics and analytics*

### 5. Roadmap
![Roadmap](docs/screenshots/roadmap.png)
*3-week sprint planning*

### 6. PDF Report
![PDF Report](docs/screenshots/pdf-report.png)
*Professional reports for stakeholders*

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow IBM Carbon Design patterns
- Keep commits atomic and descriptive

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **IBM Bob** - For incredible AI capabilities
- **NVIDIA** - For powerful AI infrastructure
- **IBM Carbon Design** - For beautiful UI components
- **GitHub** - For comprehensive REST API
- **Open Source Community** - For inspiration and support

---

## 📞 Contact & Support

- **GitHub Issues:** [Report bugs or request features](https://github.com/yourusername/devdriftguard/issues)
- **Email:** deepak23188@iiitd.ac.in
- **LinkedIn:** [Deepak Meena](https://linkedin.com/in/yourprofile)
- **Twitter:** [@yourhandle](https://twitter.com/yourhandle)

---

## 🎯 Project Stats

- **Lines of Code:** 15,000+
- **Components:** 22 React components
- **API Endpoints:** 4 RESTful endpoints
- **Test Coverage:** 85%+ (planned)
- **Performance:** < 2 min scan-to-PR time

---

<div align="center">

### Made with ❤️ by Deepak Meena

**Powered by IBM Bob & NVIDIA AI**

[⬆ Back to Top](#-devdriftguard)

</div>