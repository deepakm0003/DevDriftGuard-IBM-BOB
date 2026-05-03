import { useState, useEffect, useRef } from 'react';
import { Send } from '@carbon/icons-react';
import { useAppStore, useAppDispatch } from '../../store/appStore';
import { api } from '../../api/client';

export function BobChat() {
  const [message, setMessage] = useState('');
  const { chatMessages, isChatLoading, selectedIssue, scanResult, repoUrl } = useAppStore();
  const dispatch = useAppDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!message.trim() || isChatLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
    };

    dispatch({ type: 'ADD_CHAT', payload: userMessage });
    setMessage('');
    dispatch({ type: 'SET_CHAT_LOADING', payload: true });

    try {
      const reply = await api.chat(message, {
        repo: repoUrl,
        issues: scanResult?.issues,
        selectedIssue: selectedIssue || undefined,
      });

      const bobMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bob' as const,
        content: reply,
        timestamp: new Date(),
      };

      dispatch({ type: 'ADD_CHAT', payload: bobMessage });
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      dispatch({ type: 'SET_CHAT_LOADING', payload: false });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatContent = (content: string) => {
    const parts = content.split(/(`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--accent-blue)',
              padding: '2px 4px',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="right-panel">
      {/* Chat Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: 'var(--bg-header)'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '4px',
          backgroundColor: 'var(--bg-status-bar)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '12px',
          color: 'white'
        }}>
          B
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>Bob</div>
          <div style={{ fontSize: '10px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>DevDriftGuard Mode</span>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--accent-green)' }} />
          </div>
        </div>
      </div>

      {/* Message List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {chatMessages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              backgroundColor: msg.role === 'bob' ? 'var(--bg-status-bar)' : '#484f58',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 600,
              color: 'white',
              flexShrink: 0,
              marginTop: '2px',
              overflow: 'hidden'
            }}>
              {msg.role === 'bob' ? (
                <img src="/bob-avatar.png" alt="B" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                'U'
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                  {msg.role === 'bob' ? 'Bob' : 'You'}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{
                fontSize: '13px',
                lineHeight: '1.6',
                color: 'var(--text-secondary)',
                backgroundColor: msg.role === 'bob' ? 'transparent' : 'rgba(88, 166, 255, 0.05)',
                padding: msg.role === 'bob' ? '0' : '8px 12px',
                borderRadius: '6px',
                border: msg.role === 'bob' ? 'none' : '1px solid rgba(88, 166, 255, 0.1)'
              }}>
                {formatContent(msg.content)}
              </div>
            </div>
          </div>
        ))}
        
        {isChatLoading && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '4px', 
              backgroundColor: 'var(--bg-status-bar)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              overflow: 'hidden' 
            }}>
              <img src="/bob-avatar.png" alt="B" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
              <div className="typing-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
              <span>Bob is thinking</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-header)'
      }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '8px 12px'
        }}>
          <textarea
            placeholder="Ask Bob about your codebase..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isChatLoading}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
              minHeight: '20px',
              maxHeight: '100px'
            }}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isChatLoading}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: message.trim() ? 'var(--accent-blue)' : 'var(--text-muted)',
              cursor: message.trim() ? 'pointer' : 'default',
              display: 'flex',
              padding: '4px'
            }}
          >
            <Send size={16} />
          </button>
        </div>
        <div style={{
          marginTop: '8px',
          fontSize: '10px',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          Press Enter to send · Shift+Enter for new line
        </div>
      </div>

      <style>{`
        .typing-dots span {
          animation: blink 1.4s infinite both;
          font-size: 18px;
          line-height: 1;
        }
        .typing-dots span:nth-child(2) { animation-delay: .2s; }
        .typing-dots span:nth-child(3) { animation-delay: .4s; }
        @keyframes blink {
          0% { opacity: .2; }
          20% { opacity: 1; }
          100% { opacity: .2; }
        }
      `}</style>
    </div>
  );
}

