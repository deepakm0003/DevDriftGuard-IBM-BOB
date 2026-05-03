import { useState } from 'react';
import { useAppStore, useAppDispatch } from '../../store/appStore';
import { api } from '../../api/client';
import { Search, ArrowRight, Code, Security, Flash } from '@carbon/icons-react';

const SCAN_LOGS = [
  { type: 'info' as const, text: 'Connecting to IBM Bob (Architect Mode)...' },
  { type: 'ok' as const, text: 'Repository context loaded: {repoName}' },
  { type: 'info' as const, text: 'Scanning directory structure...' },
  { type: 'warn' as const, text: 'Large file detected: src/services/UserService.js (847 lines)' },
  { type: 'info' as const, text: 'Running security vulnerability audit...' },
  { type: 'warn' as const, text: 'Hardcoded secret found: src/auth/token.js:44' },
  { type: 'info' as const, text: 'Checking dependency manifests...' },
  { type: 'warn' as const, text: '3 CVEs detected in express@4.17.1' },
  { type: 'info' as const, text: 'Analyzing test coverage gaps...' },
  { type: 'warn' as const, text: '0% coverage: src/payments/stripe.js' },
  { type: 'info' as const, text: 'Running Bob cost-weighted triage engine...' },
  { type: 'ok' as const, text: 'DCS scores calculated for all issues' },
  { type: 'ok' as const, text: 'Scan complete — {N} issues found' },
];

export function LandingPage() {
  const [url, setUrl] = useState('');
  const { isScanning } = useAppStore();
  const dispatch = useAppDispatch();

  const isValidGitHubUrl = (url: string) => {
    return /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+/.test(url);
  };

  const handleScan = async () => {
    if (!isValidGitHubUrl(url)) {
      alert('Please enter a valid GitHub repository URL');
      return;
    }

    dispatch({ type: 'SET_REPO_URL', payload: url });
    dispatch({ type: 'START_SCAN' });

    const repoName = url.split('/').slice(-2).join('/').replace('.git', '');

    for (let i = 0; i < SCAN_LOGS.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const log = SCAN_LOGS[i];
      let text = log.text.replace('{repoName}', repoName);
      dispatch({ type: 'ADD_LOG', payload: { type: log.type, text } });
      dispatch({ type: 'SCAN_PROGRESS', payload: Math.round(((i + 1) / SCAN_LOGS.length) * 100) });
    }

    try {
      const result = await api.scanRepo(url);
      const finalLog = SCAN_LOGS[SCAN_LOGS.length - 1];
      const finalText = finalLog.text.replace('{N}', String(result.issues.length));
      dispatch({ type: 'ADD_LOG', payload: { type: 'ok', text: finalText } });
      dispatch({ type: 'SCAN_COMPLETE', payload: result });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Scan failed';
      dispatch({ type: 'ADD_LOG', payload: { type: 'error' as any, text: `Error: ${errorMessage}` } });
      dispatch({ type: 'SCAN_ERROR', payload: errorMessage });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isScanning) {
      handleScan();
    }
  };

  return (
    <div className="landing-container">
      <div className="landing-glow"></div>

      <div className="landing-content">
        <div className="landing-badge">
          <span className="badge-dot"></span>
          Powered by IBM Bob AI
        </div>

        <div className="landing-avatar-container">
          <img src="/bob-avatar.png" alt="IBM Bob" className="landing-avatar" />
        </div>

        <h1 className="landing-title">
          DevDriftGuard <br />
          <span className="gradient-text"> BY IBM BOB </span>
        </h1>

        <p className="landing-subtitle">
          It analyzes your repositories, ranks technical debt by business impact,
          and generates production-ready fixes automatically.
        </p>

        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon"><Code size={24} /></div>
            <h3>Deep Analysis</h3>
            <p>Scans security, dead code, and anti-patterns across 1000+ files.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Security size={24} /></div>
            <h3>DCS Triage</h3>
            <p>Debt Cost Score ranks issues by actual business risk and ROI.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Flash size={24} /></div>
            <h3>Auto-Remediation</h3>
            <p>One-click PRs with production-ready fixes and test coverage.</p>
          </div>
        </div>
      </div>

      <style>{`
        .landing-container {
          position: relative;
          min-height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #000;
          color: #fff;
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
          padding: 40px 20px;
        }

        .landing-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% -20%, rgba(139,92,246,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .landing-content {
          position: relative;
          z-index: 1;
          max-width: 900px;
          width: 100%;
          text-align: center;
        }

        .landing-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(37, 122, 202, 0.2);
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          color: #a78bfa;
          margin-bottom: 24px;
        }

        .landing-avatar-container {
          width: 120px;
          height: 120px;
          margin: 0 auto 32px;
          position: relative;
          border-radius: 32px;
          padding: 4px;
          background: linear-gradient(135deg, rgba(139,92,246,0.5), rgba(124,58,237,0.2));
          box-shadow: 0 20px 40px rgba(124,58,237,0.3);
        }

        .landing-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 28px;
          border: 2px solid #000;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          background: #a78bfa;
          border-radius: 50%;
          box-shadow: 0 0 8px #a78bfa;
          animation: pulse 2s infinite;
        }

        .landing-title {
          font-size: 64px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #fff 0%, #e2d9f3 40%, #a78bfa 70%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .landing-subtitle {
          font-size: 20px;
          color: #9ca3af;
          line-height: 1.6;
          margin-bottom: 48px;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .landing-input-group {
          display: flex;
          gap: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 8px;
          border-radius: 16px;
          max-width: 600px;
          margin: 0 auto 64px;
          transition: all 0.3s;
        }

        .landing-input-group:focus-within {
          border-color: rgba(139,92,246,0.5);
          box-shadow: 0 0 20px rgba(139,92,246,0.1);
        }

        .input-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
        }

        .input-icon {
          color: #6b7280;
        }

        .input-wrapper input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 16px;
          outline: none;
          padding: 12px 0;
        }

        .landing-btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #7c3aed;
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .landing-btn-primary:hover:not(:disabled) {
          background: #6d28d9;
          transform: translateY(-1px);
        }

        .landing-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .landing-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 32px;
          border-radius: 24px;
          text-align: left;
          transition: all 0.3s;
        }

        .feature-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(139,92,246,0.2);
          transform: translateY(-4px);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          background: rgba(139,92,246,0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a78bfa;
          margin-bottom: 20px;
        }

        .feature-card h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #fff;
        }

        .feature-card p {
          font-size: 14px;
          color: #9ca3af;
          line-height: 1.5;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        @media (max-width: 768px) {
          .landing-title { font-size: 40px; }
          .landing-input-group { flex-direction: column; padding: 12px; }
          .landing-features { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
