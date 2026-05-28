import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/user/Sidebar';
import { getInbox, markMessageRead } from '../../lib/api';

export default function InboxPage() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInbox()
      .then(r => setMessages(r.data))
      .finally(() => setLoading(false));
  }, []);

  const openMessage = async (msg) => {
    setSelected(msg);
    if (!msg.is_read) {
      await markMessageRead(msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  const replyViaGmail = (msg) => {
    const subject = encodeURIComponent(`Re: ${msg.subject}`);
    const body = encodeURIComponent(`Hi ${msg.sender_name},\n\nThank you for reaching out!\n\n`);
    window.open(`mailto:${msg.sender_email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content animate-fadeUp" style={{ padding: 0 }}>
        <div style={{ display: 'flex', height: 'calc(100vh - 0px)' }}>
          {/* Message list */}
          <div style={{
            width: 340, borderRight: '1px solid var(--color-border)',
            display: 'flex', flexDirection: 'column',
            background: 'white',
          }}>
            <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--color-border)' }}>
              <h2 style={{ fontSize: 18, marginBottom: 2 }}>Inbox</h2>
              {unreadCount > 0 && (
                <span style={{ fontSize: 13, color: 'var(--color-accent)', fontWeight: 500 }}>
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: 24, color: 'var(--color-muted)', fontSize: 14 }}>Loading…</div>
              ) : messages.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-muted)' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>✉</div>
                  <div style={{ fontSize: 14 }}>No messages yet</div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>Messages from your portfolio will appear here</div>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    onClick={() => openMessage(msg)}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      background: selected?.id === msg.id ? 'var(--color-accent-light)' : msg.is_read ? 'white' : '#f0f4ff',
                      transition: 'background 0.1s',
                      borderLeft: selected?.id === msg.id ? '3px solid var(--color-accent)' : '3px solid transparent',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: msg.is_read ? 400 : 700, color: 'var(--color-ink)' }}>
                        {msg.sender_name}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                        {formatDate(msg.sent_at)}
                      </span>
                    </div>
                    {msg.sender_company && (
                      <div style={{ fontSize: 12, color: 'var(--color-accent)', marginBottom: 3 }}>{msg.sender_company}</div>
                    )}
                    <div style={{ fontSize: 13, color: 'var(--color-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {msg.subject}
                    </div>
                    {!msg.is_read && (
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block', marginTop: 6 }} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message detail */}
          <div style={{ flex: 1, overflowY: 'auto', background: 'var(--color-surface)' }}>
            {selected ? (
              <div style={{ padding: 36, maxWidth: 680 }}>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, marginBottom: 8 }}>{selected.subject}</h2>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{selected.sender_name}</span>
                    {selected.sender_company && (
                      <span className="badge badge-blue">{selected.sender_company}</span>
                    )}
                    <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>&lt;{selected.sender_email}&gt;</span>
                    <span style={{ fontSize: 12, color: 'var(--color-muted)', marginLeft: 'auto' }}>
                      {new Date(selected.sent_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>

                <div className="card" style={{ padding: 28, marginBottom: 20 }}>
                  <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--color-slate)', whiteSpace: 'pre-wrap' }}>
                    {selected.body}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary" onClick={() => replyViaGmail(selected)}>
                    ↩ Reply via Gmail
                  </button>
                  <a href={`mailto:${selected.sender_email}`} className="btn btn-outline">
                    ✉ Open in Mail App
                  </a>
                </div>

                <div style={{ marginTop: 16, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 13, color: '#92400e' }}>
                  💡 Tip: Click "Reply via Gmail" to respond. The interviewer's email is <strong>{selected.sender_email}</strong>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-muted)', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 48 }}>✉</div>
                <div style={{ fontSize: 15 }}>Select a message to read it</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return d.toLocaleDateString('en-IN', { weekday: 'short' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
