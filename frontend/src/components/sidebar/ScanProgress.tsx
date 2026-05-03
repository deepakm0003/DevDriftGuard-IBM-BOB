import { useEffect, useRef } from 'react';
import { ProgressBar, Loading } from '@carbon/react';
import { useAppStore } from '../../store/appStore';

export function ScanProgress() {
  const { scanProgress, scanLog } = useAppStore();
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [scanLog]);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'ok': return '#24a148';
      case 'info': return '#4589ff';
      case 'warn': return '#f1c21b';
      case 'error': return '#da1e28';
      default: return '#f4f4f4';
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <Loading small withOverlay={false} />
      </div>
      
      <div style={{
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: '12px',
        marginBottom: '8px',
        color: '#c6c6c6'
      }}>
        Scanning... {scanProgress}%
      </div>
      
      <ProgressBar
        value={scanProgress}
        max={100}
        label="Scan progress"
        hideLabel
        size="sm"
      />
      
      <div style={{
        marginTop: '16px',
        maxHeight: '160px',
        overflowY: 'auto',
        backgroundColor: '#262626',
        border: '1px solid #393939',
        borderRadius: '4px',
        padding: '8px',
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: '11px',
        lineHeight: '1.6'
      }}>
        {scanLog.map((log, index) => (
          <div
            key={index}
            style={{
              color: getLogColor(log.type),
              marginBottom: '4px'
            }}
          >
            [{log.type.toUpperCase()}] {log.text}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

// Made with Bob
