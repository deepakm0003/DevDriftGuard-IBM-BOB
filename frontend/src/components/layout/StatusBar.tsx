import { useAppStore } from '../../store/appStore';

export function StatusBar() {
  const { scanResult, repoUrl } = useAppStore();
  
  const repoName = repoUrl ? repoUrl.split('/').slice(-2).join('/').replace('.git', '') : '';
  const issueCount = scanResult?.issues.length || 0;
  const criticalCount = scanResult?.summary.critical || 0;

  return (
    <div className="status-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px' }}>⬡</span>
          <span>IBM Bob</span>
        </div>
        {repoName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>{repoName}</span>
          </div>
        )}
        {issueCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>{issueCount} issues</span>
            {criticalCount > 0 && (
              <span style={{ color: '#ffcfcf', fontWeight: 600 }}>({criticalCount} critical)</span>
            )}
          </div>
        )}
      </div>
      <div style={{ opacity: 0.8 }}>
        DevDriftGuard v1.0
      </div>
    </div>
  );
}

