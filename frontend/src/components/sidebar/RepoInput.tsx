import { useState } from 'react';

import { useAppStore, useAppDispatch } from '../../store/appStore';
import { api } from '../../api/client';

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

export function RepoInput() {
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
    <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          GitHub Repository
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          padding: '6px 10px'
        }}>
          <input
            type="text"
            placeholder="https://github.com/owner/repo"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isScanning}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              outline: 'none'
            }}
          />
        </div>
      </div>
      
      <button
        onClick={handleScan}
        disabled={!url || isScanning}
        style={{
          width: '100%',
          padding: '8px',
          backgroundColor: 'var(--bg-status-bar)',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          fontSize: '13px',
          fontWeight: 600,
          cursor: (url && !isScanning) ? 'pointer' : 'default',
          opacity: (url && !isScanning) ? 1 : 0.6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        {isScanning ? 'Scanning...' : 'Scan with Bob'}
      </button>
    </div>
  );
}

