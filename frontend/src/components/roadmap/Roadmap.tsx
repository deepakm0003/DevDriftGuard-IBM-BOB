import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { api } from '../../api/client';
import type { RoadmapData } from '../../types';

export function Roadmap() {
  const { scanResult } = useAppStore();
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scanResult && scanResult.issues.length > 0) {
      setLoading(true);
      api.generateRoadmap(scanResult.issues)
        .then(setRoadmap)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [scanResult]);

  if (!scanResult) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No scan results available.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
        <div className="pulse-loader" style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--accent-blue)' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Architecting remediation roadmap...</div>
      </div>
    );
  }

  if (!roadmap) return null;

  return (
    <div style={{ padding: '32px', height: '100%', backgroundColor: 'var(--bg-main)', overflowY: 'auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Sprint Remediation Roadmap
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Bob generated 3 week remediation plan • Total: {roadmap.total_hours}h estimated
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', backgroundColor: 'var(--border-color)', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '40px' }}>
        {[
          { label: 'WEEK 1 — Critical & High Priority', issues: roadmap.week1, color: 'var(--accent-blue)' },
          { label: 'WEEK 2 — Medium Priority', issues: roadmap.week2, color: 'var(--accent-blue)' },
          { label: 'WEEK 3 — Monitor & Clean Up', issues: roadmap.week3, color: 'var(--accent-blue)' }
        ].map((week, i) => (
          <div key={i} style={{ backgroundColor: 'var(--bg-card)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: week.color, letterSpacing: '0.5px' }}>{week.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {week.issues.map((task, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>›</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {task.split(': ').map((part, pidx) => (
                      pidx === 0 ? <strong key={pidx} style={{ color: 'var(--text-primary)', marginRight: '8px' }}>{part}</strong> : part
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '24px', backgroundColor: 'rgba(36, 161, 72, 0.05)', border: '1px solid rgba(36, 161, 72, 0.2)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '16px' }}>🔥</span>
        <div style={{ fontSize: '13px', color: 'var(--accent-green)' }}>
          Fixing all issues recovers <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>~${roadmap.monthly_savings.toLocaleString()}/month</span> in developer velocity
        </div>
      </div>
    </div>

  );
}

