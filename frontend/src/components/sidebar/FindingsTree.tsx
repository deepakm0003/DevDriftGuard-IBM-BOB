import { useAppStore, useAppDispatch } from '../../store/appStore';
import type { DebtIssue, IssueCategory } from '../../types';

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  security: 'SECURITY',
  outdated_dependency: 'DEPENDENCIES',
  god_class: 'ARCHITECTURE',
  missing_tests: 'TEST COVERAGE',
  dead_code: 'DEAD CODE',
  anti_pattern: 'ANTI PATTERNS',
  tight_coupling: 'ARCHITECTURE',
};

export function FindingsTree() {
  const { scanResult, selectedIssue } = useAppStore();
  const dispatch = useAppDispatch();

  if (!scanResult || scanResult.issues.length === 0) {
    return (
      <div style={{ padding: '24px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '12px' }}>
        No issues found
      </div>
    );
  }

  // Group issues by category
  const groupedIssues = scanResult.issues.reduce((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = [];
    }
    acc[issue.category].push(issue);
    return acc;
  }, {} as Record<IssueCategory, DebtIssue[]>);

  const handleIssueClick = (issue: DebtIssue) => {
    dispatch({ type: 'SELECT_ISSUE', payload: issue });
    dispatch({ type: 'SET_DETAIL_VIEW', payload: 'detail' });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'var(--accent-red)';
      case 'high': return 'var(--accent-yellow)';
      case 'medium': return 'var(--accent-blue)';
      case 'low': return 'var(--text-muted)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ paddingBottom: '24px' }}>
      {Object.entries(groupedIssues).map(([category, issues]) => (
        <div key={category} style={{ marginBottom: '4px' }}>
          <div style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.5px',
            cursor: 'default'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: getSeverityColor(issues[0].severity)
            }} />
            <span>{CATEGORY_LABELS[category as IssueCategory]}</span>
            <span style={{ marginLeft: 'auto', opacity: 0.5 }}>{issues.length}</span>
          </div>
          
          {issues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => handleIssueClick(issue)}
              style={{
                padding: '10px 16px 10px 30px',
                cursor: 'pointer',
                backgroundColor: selectedIssue?.id === issue.id ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                borderLeft: selectedIssue?.id === issue.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: getSeverityColor(issue.severity),
                flexShrink: 0,
                marginTop: '5px'
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: selectedIssue?.id === issue.id ? 500 : 400,
                  color: selectedIssue?.id === issue.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  marginBottom: '2px',
                  lineHeight: '1.4'
                }}>
                  {issue.title}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {issue.file_path}
                </div>
              </div>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: selectedIssue?.id === issue.id ? 'var(--accent-blue)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                {issue.dcs_score.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}


// Made with Bob
