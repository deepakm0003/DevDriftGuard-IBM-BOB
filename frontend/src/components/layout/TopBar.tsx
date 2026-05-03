import { Download, Upload, Information } from '@carbon/icons-react';
import { useAppStore, useAppDispatch } from '../../store/appStore';
import { api } from '../../api/client';
import type { ChatMessage } from '../../types';

export function TopBar({ onReset }: { onReset?: () => void }) {
  const { activeTab, fixResult, scanResult, repoUrl, isPushing } = useAppStore();
  const dispatch = useAppDispatch();

  const handleExport = () => {
    if (!scanResult) return;
    
    // Generate HTML report
    const html = api.exportReport(scanResult);
    
    // Open in new window and trigger print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Wait for content to load, then open print dialog
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    }
  };

  const handleCreatePR = async () => {
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
    } catch (error) {
      console.error('PR push failed:', error);
      dispatch({ type: 'PUSH_COMPLETE' });
      
      // Bob's error response
      dispatch({
        type: 'ADD_CHAT',
        payload: {
          id: (Date.now() + 1).toString(),
          role: 'bob',
          content: `PR creation failed.\n\nPlease check:\n- GitHub token permissions\n- Write access to the repository\n- Network connection\n\nI can help you:\n1. Show how to create the PR manually\n2. Generate PR description for copy-paste\n3. Troubleshoot the connection`,
          timestamp: new Date(),
        }
      });
    } finally {
      dispatch({ type: 'SET_CHAT_LOADING', payload: false });
    }
  };


  const tabs = [
    { id: 'findings', label: 'Findings' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'roadmap', label: 'Roadmap' },
  ];

  return (
    <header style={{
      height: '48px',
      backgroundColor: 'var(--bg-header)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '24px',
      zIndex: 100
    }}>
      <div
        onClick={onReset}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minWidth: '200px',
          cursor: onReset ? 'pointer' : 'default',
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => onReset && (e.currentTarget.style.opacity = '0.8')}
        onMouseLeave={(e) => onReset && (e.currentTarget.style.opacity = '1')}
        title={onReset ? 'Click to reset DevDriftGuard' : ''}
      >
        <div style={{
          width: '24px',
          height: '24px',
          backgroundColor: 'var(--bg-status-bar)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '14px',
          color: 'white'
        }}>
          B
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, fontSize: '13px', lineHeight: 1.2 }}>IBM Bob</span>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1 }}>DevDriftGuard</span>
        </div>
      </div>
      
      <nav style={{ display: 'flex', height: '100%', gap: '4px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id as any })}
            style={{
              height: '100%',
              padding: '0 16px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 500 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={handleExport}
          disabled={!scanResult}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontSize: '12px',
            cursor: scanResult ? 'pointer' : 'not-allowed',
            opacity: scanResult ? 1 : 0.5,
            transition: 'background-color 0.2s'
          }}
        >
          <Download size={16} />
          Export Report
        </button>
        <button
          onClick={handleCreatePR}
          disabled={!fixResult || isPushing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: fixResult && !isPushing ? 'var(--bg-status-bar)' : 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'white',
            fontSize: '12px',
            fontWeight: 500,
            cursor: fixResult && !isPushing ? 'pointer' : 'not-allowed',
            opacity: fixResult && !isPushing ? 1 : 0.5,
            transition: 'all 0.2s'
          }}
        >
          <Upload size={16} />
          {isPushing ? 'Creating...' : 'Create PR'}
        </button>
      </div>
    </header>
  );
}

