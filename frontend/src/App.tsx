import { AppProvider, useAppStore, useAppDispatch } from './store/appStore';
import { TopBar } from './components/layout/TopBar';
import { StatusBar } from './components/layout/StatusBar';
import { RepoInput } from './components/sidebar/RepoInput';
import { ScanProgress } from './components/sidebar/ScanProgress';
import { FindingsTree } from './components/sidebar/FindingsTree';
import { BobChat } from './components/chat/BobChat';
import { IssueDetail } from './components/detail/IssueDetail';
import { Dashboard } from './components/dashboard/Dashboard';
import { Roadmap } from './components/roadmap/Roadmap';
import { Search, Code, Terminal, Layers, Information, Close } from '@carbon/icons-react';
import { useState } from 'react';

function ActivityBar({ onAboutClick }: { onAboutClick: () => void }) {
  return (
    <div className="activity-bar">
      <div className="activity-icon active" title="Explorer"><Layers size={24} /></div>
      <div style={{ flex: 1 }} />
      <div className="activity-icon" onClick={onAboutClick} title="About DevDriftGuard" style={{ cursor: 'pointer' }}><Information size={24} /></div>
    </div>
  );
}

function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '32px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        color: '#161616'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#161616' }}>About DevDriftGuard</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#525252', cursor: 'pointer', padding: '4px' }}>
            <Close size={24} />
          </button>
        </div>
        
        <div style={{ color: '#525252', lineHeight: '1.8', fontSize: '14px' }}>
          <p style={{ marginBottom: '16px' }}>
            <strong style={{ color: '#161616' }}>DevDriftGuard</strong> is an AI-powered technical debt management system that helps development teams identify, prioritize, and fix code quality issues automatically.
          </p>
          
          <h3 style={{ color: '#161616', fontSize: '16px', fontWeight: 600, marginTop: '24px', marginBottom: '12px' }}>How It Works</h3>
          <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}><strong>Deep Scan:</strong> Analyzes GitHub repositories for security vulnerabilities, dead code, outdated dependencies, and anti-patterns</li>
            <li style={{ marginBottom: '8px' }}><strong>Cost-Weighted Triage:</strong> Ranks issues by business impact using the DCS (Debt Cost Score) algorithm</li>
            <li style={{ marginBottom: '8px' }}><strong>Auto-Remediation:</strong> IBM Bob generates production-ready fixes with comprehensive tests</li>
            <li style={{ marginBottom: '8px' }}><strong>One-Click PRs:</strong> Creates pull requests automatically with detailed descriptions</li>
          </ol>
          
          <h3 style={{ color: '#161616', fontSize: '16px', fontWeight: 600, marginTop: '24px', marginBottom: '12px' }}>Key Features</h3>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}>Scans up to 100 files per repository</li>
            <li style={{ marginBottom: '8px' }}>Calculates ROI and cost savings</li>
            <li style={{ marginBottom: '8px' }}>Visual dashboard with metrics and trends</li>
            <li style={{ marginBottom: '8px' }}>3-week remediation roadmap</li>
            <li style={{ marginBottom: '8px' }}>AI-powered chat assistant (Bob)</li>
            <li style={{ marginBottom: '8px' }}>Auto-fixable issues with one click</li>
          </ul>
          
          <h3 style={{ color: '#161616', fontSize: '16px', fontWeight: 600, marginTop: '24px', marginBottom: '12px' }}>Technology Stack</h3>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}>Frontend: React + TypeScript + IBM Carbon Design</li>
            <li style={{ marginBottom: '8px' }}>Backend: Node.js + Express</li>
            <li style={{ marginBottom: '8px' }}>AI: NVIDIA API (OpenAI-compatible)</li>
            <li style={{ marginBottom: '8px' }}>Integration: GitHub REST API</li>
          </ul>
          
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#e8f4ff', border: '1px solid #0f62fe', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#0f62fe' }}>
              <strong>Version:</strong> 1.0.0 | <strong>Made with:</strong> IBM Bob
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { isScanning, scanResult, activeTab, selectedIssue } = useAppStore();
  const dispatch = useAppDispatch();
  const [showAbout, setShowAbout] = useState(false);
  
  const criticalHighCount = scanResult?.issues.filter(i => i.severity === 'critical' || i.severity === 'high').length || 0;
  
  const handleReset = () => {
    if (window.confirm('Reset DevDriftGuard? This will clear all scan data.')) {
      window.location.reload();
    }
  };

  return (
    <div className="app-shell">
      <TopBar onReset={handleReset} />
      
      <div className="app-body">
        <ActivityBar onAboutClick={() => setShowAbout(true)} />
        
        {/* Left Panel */}
        <div className="left-panel">
          <div style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Explorer
          </div>
          <RepoInput />
          
          {isScanning && <ScanProgress />}
          
          {!isScanning && scanResult && (
            <>
              {criticalHighCount > 0 && (
                <div style={{
                  margin: '12px 16px',
                  padding: '12px',
                  backgroundColor: 'rgba(218, 30, 40, 0.1)',
                  border: '1px solid rgba(218, 30, 40, 0.3)',
                  borderRadius: '4px'
                }}>
                  <div style={{ fontSize: '10px', color: '#fa4d56', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                    CRITICAL / HIGH
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#fa4d56', lineHeight: 1 }}>
                    {criticalHighCount}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    require immediate action
                  </div>
                </div>
              )}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <FindingsTree />
              </div>
            </>
          )}
          
          {!isScanning && !scanResult && (
            <div className="empty-sidebar" style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <div>
                <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>
                  <Search size={32} />
                </div>
                <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-primary)' }}>
                  No Repo Scanned
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="main-content">
          {!scanResult && !isScanning && (
            <div className="welcome-screen" style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto',
              padding: '40px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-status-bar)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '24px',
                boxShadow: '0 8px 24px rgba(15, 98, 254, 0.3)'
              }}>
                B
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
                IBM Bob <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>DevDriftGuard</span>
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: '1.6' }}>
                AI-powered technical debt scanner that analyzes repositories, ranks issues by business impact, and generates ready-to-merge fixes.
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                width: '100%'
              }}>
                {[
                  { title: 'Deep Scan', desc: 'Security, dead code, and dependencies.' },
                  { title: 'ROI Analysis', desc: 'Rank issues by business cost.' },
                  { title: 'Auto-Fix', desc: 'Bob generates ready-to-merge PRs.' }
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: '24px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    textAlign: 'left',
                    transition: 'border-color 0.2s',
                    cursor: 'default'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: 'var(--text-primary)' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {scanResult && !isScanning && activeTab === 'dashboard' && <Dashboard />}
          {scanResult && !isScanning && activeTab === 'roadmap' && <Roadmap />}
          
          {isScanning && (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div className="pulse-loader" style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-status-bar)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'white',
                  margin: '0 auto 24px'
                }}>
                  B
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '8px' }}>
                  Analyzing repository...
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Bob is auditing code quality and security
                </p>
              </div>
            </div>
          )}
          
          {scanResult && !isScanning && activeTab === 'findings' && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <IssueDetail />
            </div>
          )}
        </div>

        {/* Right Panel - Bob Chat */}
        <BobChat />
      </div>

      <StatusBar />
      
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      
      <style>{`
        .pulse-loader {
          animation: pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;


// Made with Bob
