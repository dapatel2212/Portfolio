'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth';

const navItems = {
  user: [
    { href: '/dashboard', icon: '⊞', label: 'Dashboard' },
    { href: '/dashboard/profile', icon: '◉', label: 'My Profile' },
    { href: '/dashboard/certificates', icon: '◈', label: 'Certificates' },
    { href: '/dashboard/projects', icon: '◇', label: 'Projects' },
    { href: '/dashboard/inbox', icon: '✉', label: 'Inbox' },
    { href: '/dashboard/share', icon: '↗', label: 'Share Portfolio' },
  ],
  admin: [
    { href: '/admin', icon: '⊞', label: 'Overview' },
    { href: '/admin/users', icon: '◉', label: 'Users' },
    { href: '/admin/certificates', icon: '◈', label: 'Certificates' },
    { href: '/admin/settings', icon: '◎', label: 'Settings' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const items = isAdmin ? navItems.admin : navItems.user;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          fontWeight: 800,
          color: 'white',
          letterSpacing: '-0.02em',
        }}>
          Portfolio<span style={{ color: '#6366f1' }}>Hub</span>
        </div>
        {isAdmin && (
          <span style={{
            fontSize: 11,
            background: '#6366f1',
            color: 'white',
            padding: '2px 8px',
            borderRadius: 4,
            fontWeight: 600,
            marginTop: 4,
            display: 'inline-block',
          }}>ADMIN</span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(({ href, icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: active ? 600 : 400,
              color: active ? 'white' : 'rgba(255,255,255,0.55)',
              background: active ? 'rgba(99,102,241,0.3)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Signed in as</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 12 }}>{user.name}</div>
        {!isAdmin && user.slug && (
          <Link href={`/portfolio/${user.slug}`} target="_blank" style={{
            display: 'block',
            fontSize: 12,
            color: '#818cf8',
            marginBottom: 12,
            textDecoration: 'none',
          }}>
            View public portfolio ↗
          </Link>
        )}
        <button onClick={logout} style={{
          width: '100%',
          padding: '8px',
          background: 'rgba(255,255,255,0.07)',
          color: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          fontSize: 13,
          cursor: 'pointer',
        }}>Sign out</button>
      </div>
    </aside>
  );
}
