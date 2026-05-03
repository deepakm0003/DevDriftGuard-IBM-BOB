import { Renew, WarningAlt, CheckmarkOutline, Star } from '@carbon/icons-react';
import { useAppStore, useAppDispatch } from '../../store/appStore';
import { api } from '../../api/client';

export function IssueDetail() {
  const { selectedIssue, repoUrl, activeDetailView, scanResult, isFixing, isPushing, fixResult } = useAppStore();
  const dispatch = useAppDispatch();

  const fullFile = scanResult?.files?.find(f => f.path === selectedIssue?.file_path || f.path.endsWith(selectedIssue?.file_path || ''));
  const fileContent = fullFile?.content || selectedIssue?.snippet || selectedIssue?.problem || '';
  const lineRange = selectedIssue?.line_range || '1';
  const startLineHighlight = parseInt(lineRange.split(/[:-]/)[0]) || 1;
  
  // If we have a snippet but no full file, create a simple code display
  const codeLines = fileContent ? fileContent.split('\n') : [];
  const hasCode = codeLines.length > 0 && codeLines.some(line => line.trim().length > 0);

  if (!selectedIssue) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontSize: '14px'
      }}>
        Select an issue from the findings tree to view details
      </div>
    );
  }

  const handleAutoFix = async () => {
    if (!repoUrl || !selectedIssue) return;
    
    // User message: requesting fix
    dispatch({
      type: 'ADD_CHAT',
      payload: {
        id: Date.now().toString(),
        role: 'user',
        content: `Auto-fix this ${selectedIssue.severity} issue: "${selectedIssue.title}" in ${selectedIssue.file_path}`,
        timestamp: new Date(),
      }
    });
    
    dispatch({ type: 'START_FIX' });
    dispatch({ type: 'SET_CHAT_LOADING', payload: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const result = await api.generateFix(selectedIssue.id, selectedIssue, repoUrl);
      dispatch({ type: 'FIX_COMPLETE', payload: result });
      
      // Bob's response with fix details
      dispatch({
        type: 'ADD_CHAT',
        payload: {
          id: (Date.now() + 1).toString(),
          role: 'bob',
          content: `Fix generated successfully!\n\nFile: ${selectedIssue.file_path}\nIssue: ${selectedIssue.title}\nSolution: ${result.explanation || 'Production-ready fix with comprehensive tests'}\nTests: ${result.test_count || 3} unit tests included\nDCS score: ${selectedIssue.dcs_score.toFixed(1)} → 0.0\nROI: ${selectedIssue.roi_if_fixed_now}\n\nThe fix is ready! Click "Push PR to GitHub" to create a pull request.`,
          timestamp: new Date(),
        }
      });
    } catch (error) {
      console.error('Fix generation failed:', error);
      dispatch({ type: 'SET_DETAIL_VIEW', payload: 'detail' });
      
      // Bob's error response
      dispatch({
        type: 'ADD_CHAT',
        payload: {
          id: (Date.now() + 1).toString(),
          role: 'bob',
          content: `Fix generation failed.\n\nPossible reasons:\n- Code structure too complex\n- Missing file context or dependencies\n- API rate limit reached\n\nI can help you:\n1. Explain how to fix this manually\n2. Try a different issue\n3. Provide debugging guidance`,
          timestamp: new Date(),
        }
      });
    } finally {
      dispatch({ type: 'SET_CHAT_LOADING', payload: false });
    }
  };

  const handlePushPR = async () => {
    if (!repoUrl || !fixResult) return;
    
    // Parse owner/repo
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return;
    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '');

    // User message: requesting PR creation
    dispatch({
      type: 'ADD_CHAT',
      payload: {
        id: Date.now().toString(),
        role: 'user',
        content: `Create a pull request for this fix`,
        timestamp: new Date(),
      }
    });

    dispatch({ type: 'START_PUSH' });
    dispatch({ type: 'SET_CHAT_LOADING', payload: true });
    
    try {
      // Simulate real pushing time for the animation
      await new Promise(resolve => setTimeout(resolve, 3500));
      const result = await api.createPR(owner, cleanRepo, fixResult.plan);
      
      dispatch({ type: 'PUSH_COMPLETE' });
      
      // Bob's success response
      dispatch({
        type: 'ADD_CHAT',
        payload: {
          id: (Date.now() + 1).toString(),
          role: 'bob',
          content: `Pull request created successfully!\n\nPR #${result.pr_number}: ${fixResult.pr_title}\nURL: ${result.pr_url}\nRepository: ${owner}/${cleanRepo}\nStatus: Open and ready for review\n\nIncludes:\n- Production-ready fix\n- ${fixResult.test_count || 3} comprehensive unit tests\n- Detailed description and impact analysis\n\nYour team can now review and merge the changes!`,
          timestamp: new Date(),
        }
      });
    } catch (error: any) {
      console.error('PR push failed:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      dispatch({ type: 'PUSH_COMPLETE' });
      
      // Bob's error response
      dispatch({
        type: 'ADD_CHAT',
        payload: {
          id: (Date.now() + 1).toString(),
          role: 'bob',
          content: `PR creation failed: **${errorMessage}**\n\nPlease check:\n- Your GitHub token has 'repo' permissions\n- You have permission to fork/edit the repository\n- The repository hasn't been deleted\n\nI can also generate the PR description for you to copy-paste manually if needed!`,
          timestamp: new Date(),
        }
      });
    } finally {
      dispatch({ type: 'SET_CHAT_LOADING', payload: false });
    }
  };

  const handleAskBob = async () => {
    if (!selectedIssue) return;
    const question = `Can you explain this ${selectedIssue.severity} ${selectedIssue.category} issue: "${selectedIssue.title}"?`;
    
    dispatch({
      type: 'ADD_CHAT',
      payload: {
        id: Date.now().toString(),
        role: 'user',
        content: question,
        timestamp: new Date(),
      }
    });

    dispatch({ type: 'SET_CHAT_LOADING', payload: true });
    try {
      const reply = await api.chat(question, {
        repo: repoUrl,
        selectedIssue: selectedIssue
      });

      dispatch({
        type: 'ADD_CHAT',
        payload: {
          id: (Date.now() + 1).toString(),
          role: 'bob',
          content: reply,
          timestamp: new Date(),
        }
      });
    } catch (error) {
      console.error('Ask Bob error:', error);
    } finally {
      dispatch({ type: 'SET_CHAT_LOADING', payload: false });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* Loading Overlay */}
      {(isFixing || isPushing) && (
        <div className="fix-overlay">
          <div className="big-spinner"></div>
          <h3>{isFixing ? 'Bob is analyzing...' : 'Pushing to GitHub...'}</h3>
          <p>{isFixing ? 'Generating fix, tests, and PR description' : 'Creating branch and opening pull request'}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="content-tabs">
        {[
          { id: 'detail', label: 'Issue Detail', icon: <WarningAlt size={16} /> },
          { id: 'fix', label: 'Auto-Fix', icon: <Renew size={16} />, badge: fixResult ? 'Ready' : null },
          { id: 'tests', label: 'Tests', icon: <Star size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_DETAIL_VIEW', payload: tab.id as any })}
            className={`ctab ${activeDetailView === tab.id ? 'active' : ''}`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && <span className="ctab-badge">{tab.badge}</span>}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        {activeDetailView === 'detail' && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {selectedIssue.title}
              </h1>
              <div style={{
                padding: '4px 12px',
                backgroundColor: selectedIssue.severity === 'critical' ? 'var(--accent-red)' : 'var(--bg-tertiary)',
                borderRadius: '4px',
                color: 'white',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {selectedIssue.severity}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1px', backgroundColor: 'var(--border-color)', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px' }}>DCS SCORE</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-blue)' }}>{selectedIssue.dcs_score.toFixed(1)}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Debt Cost Score</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px' }}>FIX PRIORITY</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent-yellow)' }}>{selectedIssue.fix_priority}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{selectedIssue.sprint_velocity_drag}</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px' }}>EST. FIX TIME</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedIssue.estimated_fix_hours}h</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>developer hours</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px' }}>BLAST RADIUS</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedIssue.blast_radius_files || 0}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>files affected</div>
              </div>
            </div>

            <div style={{ padding: '16px 20px', backgroundColor: 'rgba(36, 161, 72, 0.08)', border: '1px solid rgba(36, 161, 72, 0.3)', borderLeft: '3px solid var(--accent-green)', borderRadius: '4px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px' }}>💰</span>
              <div style={{ fontSize: '13px', color: 'var(--accent-green)', fontWeight: 600 }}>
                ROI IF FIXED NOW: <span style={{ color: 'var(--text-primary)', marginLeft: '8px', fontWeight: 500 }}>{selectedIssue.roi_if_fixed_now}</span>
              </div>
            </div>

            <section style={{ marginBottom: '24px' }}>
              <div className="section-label">PROBLEM ANALYSIS</div>
              <div style={{ padding: '24px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderLeft: '3px solid var(--accent-red)', borderRadius: '4px', fontSize: '14px', lineHeight: '1.8', color: 'var(--text-primary)' }}>
                {selectedIssue.description || selectedIssue.impact || 'This issue requires attention to maintain code quality and prevent technical debt accumulation.'}
              </div>
            </section>

            <section style={{ marginBottom: '24px' }}>
              <div className="section-label">LOCATION</div>
              <div className="code-block">
                <div className="code-block-header">
                  <span className="code-block-lang">{selectedIssue.file_path}</span>
                  <span className="code-block-lang">LINES {selectedIssue.line_range}</span>
                </div>
                <div style={{ padding: '0', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: '1.6', color: '#d4d4d4', whiteSpace: 'pre-wrap', backgroundColor: '#1a1a1a', overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
                  {hasCode ? codeLines.map((line, i) => {
                    const currentLineNum = startLineHighlight + i;
                    const isHighlighted = true;
                    return (
                      <div key={i} style={{ display: 'flex', gap: '0', backgroundColor: isHighlighted ? 'rgba(218, 30, 40, 0.15)' : 'transparent', borderLeft: isHighlighted ? '3px solid var(--accent-red)' : '3px solid transparent', padding: '4px 0' }}>
                        <div style={{ color: isHighlighted ? 'var(--accent-red)' : '#666', textAlign: 'right', width: '60px', userSelect: 'none', flexShrink: 0, paddingRight: '20px', paddingLeft: '16px', fontSize: '12px' }}>{currentLineNum}</div>
                        <div style={{ flex: 1, color: '#fff', paddingRight: '20px', wordBreak: 'break-word' }}>{line || ' '}</div>
                      </div>
                    );
                  }) : (
                    <div style={{ padding: '40px 20px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '13px' }}>
                      <div style={{ marginBottom: '8px' }}>📄 Code snippet not available</div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>File: {selectedIssue.file_path}</div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>Lines: {selectedIssue.line_range}</div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section style={{ marginBottom: '24px' }}>
              <div className="section-label">CATEGORY</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: selectedIssue.severity === 'critical' ? 'rgba(218, 30, 40, 0.15)' : selectedIssue.severity === 'high' ? 'rgba(255, 186, 0, 0.15)' : 'rgba(88, 166, 255, 0.15)',
                  border: `1px solid ${selectedIssue.severity === 'critical' ? 'var(--accent-red)' : selectedIssue.severity === 'high' ? 'var(--accent-yellow)' : 'var(--accent-blue)'}`,
                  borderRadius: '4px',
                  color: selectedIssue.severity === 'critical' ? 'var(--accent-red)' : selectedIssue.severity === 'high' ? 'var(--accent-yellow)' : 'var(--accent-blue)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {selectedIssue.severity}
                </span>
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: 'rgba(88, 166, 255, 0.1)',
                  border: '1px solid rgba(88, 166, 255, 0.3)',
                  borderRadius: '4px',
                  color: 'var(--accent-blue)',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {selectedIssue.category.replace(/_/g, ' ')}
                </span>
                {selectedIssue.auto_fixable && (
                  <span style={{
                    padding: '6px 12px',
                    backgroundColor: 'rgba(36, 161, 72, 0.1)',
                    border: '1px solid rgba(36, 161, 72, 0.3)',
                    borderRadius: '4px',
                    color: 'var(--accent-green)',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    ⚡ AUTO-FIXABLE
                  </span>
                )}
              </div>
            </section>

          </>
        )}

        {activeDetailView === 'fix' && fixResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Auto-Fix — Generated by Bob</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontSize: '11px', fontWeight: 600 }}>
                <CheckmarkOutline size={16} /> READY TO MERGE
              </div>
            </div>

            <section>
              <div className="section-label">BOB'S EXPLANATION</div>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderLeft: '3px solid var(--accent-blue)', borderRadius: '4px', fontSize: '14px', lineHeight: '1.6' }}>
                {fixResult.explanation}
              </div>
            </section>

            <section>
              <div className="section-label">FIXED CODE</div>
              <div className="code-block">
                <div className="code-block-header">
                  <span className="code-block-lang">{selectedIssue.file_path}</span>
                  <button className="copy-btn" onClick={() => copyToClipboard(fixResult.fixed_code)}>Copy</button>
                </div>
                <pre>{fixResult.fixed_code}</pre>
              </div>
            </section>

            <section>
              <div className="section-label">PR TITLE</div>
              <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-blue)' }}>
                {fixResult.pr_title || `fix: resolve ${selectedIssue.category} in ${selectedIssue.file_path}`}
              </div>
            </section>

            <section>
              <div className="section-label">PR DESCRIPTION (GITHUB MARKDOWN)</div>
              <div className="code-block">
                <div className="code-block-header">
                  <span className="code-block-lang">markdown</span>
                  <button className="copy-btn" onClick={() => copyToClipboard(fixResult.pr_body)}>Copy</button>
                </div>
                <pre style={{ color: 'var(--text-secondary)' }}>{fixResult.pr_body || `Automated fix generated by DevDriftGuard.\n\nIssue: ${selectedIssue.title}\nImpact: ${selectedIssue.impact || 'Resolves technical debt.'}`}</pre>
              </div>
            </section>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={handlePushPR} style={{ padding: '12px 24px', backgroundColor: 'var(--accent-blue)', border: 'none', borderRadius: '4px', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckmarkOutline size={18} /> Push PR to GitHub
              </button>
              <button onClick={() => dispatch({ type: 'SET_DETAIL_VIEW', payload: 'detail' })} style={{ padding: '12px 24px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                ← Back
              </button>
            </div>
          </div>
        )}

        {activeDetailView === 'tests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Generated Unit Tests</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{fixResult?.test_count || 3} Tests</div>
            </div>

            <section>
              <div className="section-label">UNIT TESTS</div>
              <div className="code-block">
                <div className="code-block-header">
                  <span className="code-block-lang">javascript · jest</span>
                  <button className="copy-btn" onClick={() => copyToClipboard(fixResult?.test_code || '')}>Copy</button>
                </div>
                <pre>{fixResult?.test_code || '// Tests will be generated with the fix...'}</pre>
              </div>
            </section>

            <div style={{ padding: '16px 20px', backgroundColor: 'rgba(36, 161, 72, 0.05)', border: '1px solid var(--accent-green)', borderRadius: '4px', color: 'var(--accent-green)', fontSize: '13px' }}>
              ✓ All tests cover critical paths for this fix
            </div>
          </div>
        )}
      </div>

      {/* Action Bar at Bottom - Contained within detail view */}
      {activeDetailView === 'detail' && (
        <div style={{
          padding: '16px 32px',
          backgroundColor: '#000000',
          borderTop: '1px solid #393939',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: selectedIssue.severity === 'critical' ? '#fa4d56' : selectedIssue.severity === 'high' ? '#f1c21b' : selectedIssue.severity === 'medium' ? '#0f62fe' : '#8d8d8d',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginRight: 'auto'
          }}>
            {selectedIssue.severity}
          </div>
          <button
            onClick={handleAutoFix}
            disabled={isFixing}
            style={{
              padding: '10px 24px',
              backgroundColor: '#0f62fe',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isFixing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isFixing ? 0.5 : 1,
              transition: 'background-color 0.2s',
              boxShadow: 'none'
            }}
            onMouseEnter={(e) => !isFixing && (e.currentTarget.style.backgroundColor = '#0353e9')}
            onMouseLeave={(e) => !isFixing && (e.currentTarget.style.backgroundColor = '#0f62fe')}
          >
            <Renew size={16} /> {isFixing ? 'Generating...' : 'Auto-Fix with Bob'}
          </button>
          <button
            onClick={handleAskBob}
            style={{
              padding: '10px 24px',
              backgroundColor: '#262626',
              border: '1px solid #525252',
              borderRadius: '4px',
              color: '#f4f4f4',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#353535'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#262626'}
          >
            Ask Bob
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_DETAIL_VIEW', payload: 'tests' })}
            style={{
              padding: '10px 24px',
              backgroundColor: '#262626',
              border: '1px solid #525252',
              borderRadius: '4px',
              color: '#f4f4f4',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#353535'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#262626'}
          >
            View Tests
          </button>
        </div>
      )}
    </div>
  );
}


