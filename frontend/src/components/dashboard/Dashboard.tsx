import { useAppStore, useAppDispatch } from '../../store/appStore';
import type { IssueCategory } from '../../types';

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  security: 'Security',
  outdated_dependency: 'Dependencies',
  god_class: 'Architecture',
  missing_tests: 'Test Coverage',
  dead_code: 'Dead Code',
  anti_pattern: 'Anti-Patterns',
  tight_coupling: 'Coupling',
};

export function Dashboard() {
  const { scanResult } = useAppStore();
  const dispatch = useAppDispatch();

  if (!scanResult) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--text-muted)' }}>
        No scan results available.
      </div>
    );
  }

  const categoryCount: Record<string, number> = {};
  scanResult.issues.forEach(issue => {
    categoryCount[issue.category] = (categoryCount[issue.category] || 0) + 1;
  });

  const topIssues = [...scanResult.issues]
    .sort((a, b) => b.dcs_score - a.dcs_score)
    .slice(0, 5);

  const handleIssueClick = (issue: any) => {
    dispatch({ type: 'SELECT_ISSUE', payload: issue });
    dispatch({ type: 'SET_TAB', payload: 'findings' });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'var(--accent-red)';
      case 'high': return 'var(--accent-yellow)';
      case 'medium': return 'var(--accent-blue)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ padding: '32px', overflowY: 'auto', height: '100%', backgroundColor: 'var(--bg-main)' }}>
      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', backgroundColor: 'var(--border-color)', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '32px' }}>
        {[
          { label: 'TOTAL ISSUES', value: scanResult.summary.total_issues, sub: `across ${scanResult.issues.length} files`, trend: '↑ DCS Avg: 33.5' },
          { label: 'CRITICAL / HIGH', value: `${scanResult.summary.critical} ${scanResult.summary.high}`, sub: 'require immediate action', color: 'var(--accent-red)' },
          { label: 'MONTHLY DEBT COST', value: `$${Math.round(scanResult.monthly_cost_estimate).toLocaleString()}`, sub: 'at $50/hr dev rate', trend: '↓ Fix top 3: save 60%', color: 'var(--accent-yellow)' },
          { label: 'AUTO-FIXABLE', value: scanResult.summary.auto_fixable, sub: 'Bob can fix instantly', trend: '~16.0h total fix time', color: 'var(--accent-green)' }
        ].map((metric, i) => (
          <div key={i} style={{ padding: '24px', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '16px' }}>{metric.label}</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: metric.color || 'var(--text-primary)', marginBottom: '8px' }}>{metric.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{metric.sub}</div>
            {metric.trend && <div style={{ fontSize: '11px', color: metric.color || 'var(--accent-blue)', opacity: 0.8 }}>{metric.trend}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Debt by Category */}
        <div style={{ padding: '32px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '32px', color: 'var(--text-primary)' }}>Debt by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {Object.entries(categoryCount).map(([category, count]) => {
              const percentage = (count / scanResult.issues.length) * 100;
              const color = category === 'security' ? 'var(--accent-red)' : category === 'dead_code' ? 'var(--accent-blue)' : 'var(--accent-yellow)';
              return (
                <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <span style={{ width: '120px', fontSize: '12px', color: 'var(--text-secondary)' }}>{CATEGORY_LABELS[category as IssueCategory]}</span>
                  <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: color }} />
                  </div>
                  <span style={{ width: '20px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Priority Issues */}
        <div style={{ padding: '32px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-primary)' }}>Top Priority Issues (by DCS)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topIssues.map((issue) => (
              <div key={issue.id} onClick={() => handleIssueClick(issue)} style={{
                padding: '16px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{issue.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    DCS {issue.dcs_score.toFixed(1)} • {issue.fix_priority} • <span style={{ color: 'var(--accent-green)' }}>saves $7,200</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

  );
}

