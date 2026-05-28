import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { getProfileStats } from '../../lib/api';
import Sidebar from '../../components/user/Sidebar';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ views: 0, certs: 0, unread_messages: 0 });

  useEffect(() => {
    getProfileStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portfolio/${user?.slug}`;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content animate-fadeUp">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 15 }}>
            Here's an overview of your portfolio activity.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          <StatCard icon="👁" label="Profile Views" value={stats.views} color="#3b5bdb" />
          <StatCard icon="📜" label="Certificates" value={stats.certs} color="#059669" />
          <StatCard icon="✉" label="Unread Messages" value={stats.unread_messages} color="#d97706" />
        </div>

        {/* Share link */}
        {user?.slug && (
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16 }}>Your Public Portfolio Link</h3>
              <span className="badge badge-green">Live</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '10px 14px',
            }}>
              <span style={{ flex: 1, fontSize: 14, color: 'var(--color-accent)', fontWeight: 500 }}>{shareUrl}</span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => { navigator.clipboard.writeText(shareUrl); }}
              >Copy</button>
              <Link href={`/portfolio/${user.slug}`} target="_blank" className="btn btn-primary btn-sm">Open ↗</Link>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <QuickAction href="/dashboard/profile" icon="◉" label="Edit Profile" desc="Update bio, skills, photo" />
            <QuickAction href="/dashboard/certificates" icon="◈" label="Upload Certificate" desc="Add new certifications" />
            <QuickAction href="/dashboard/projects" icon="◇" label="Add Project" desc="Showcase your work" />
            <QuickAction href="/dashboard/inbox" icon="✉" label="View Messages" desc={`${stats.unread_messages} unread`} />
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color, fontFamily: 'var(--font-display)', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{label}</div>
    </div>
  );
}

function QuickAction({ href, icon, label, desc }) {
  return (
    <Link href={href} style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 16px',
      border: '1px solid var(--color-border)',
      borderRadius: 10,
      textDecoration: 'none',
      color: 'inherit',
      transition: 'all 0.15s',
    }}
    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{desc}</div>
      </div>
    </Link>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
