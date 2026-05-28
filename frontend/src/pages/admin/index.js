import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { useRouter } from 'next/router';
import Sidebar from '../../components/user/Sidebar';
import { getAdminDashboard, getAdminUsers, toggleUserStatus, deleteUser, getAdminCertificates, verifyCertificate } from '../../lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [certs, setCerts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/dashboard');
  }, [user, loading]);

  useEffect(() => {
    getAdminDashboard().then(r => {
      setStats(r.data.stats);
      setUsers(r.data.recent_users);
    });
    getAdminCertificates({ verified: 'false' }).then(r => setCerts(r.data));
  }, []);

  const handleToggleUser = async (id, is_active) => {
    await toggleUserStatus(id, !is_active);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !is_active } : u));
    toast.success(!is_active ? 'User activated' : 'User suspended');
  };

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Permanently delete "${name}" and all their data?`)) return;
    await deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success('User deleted');
  };

  const handleVerifyCert = async (id, is_verified) => {
    await verifyCertificate(id, !is_verified);
    setCerts(prev => prev.map(c => c.id === id ? { ...c, is_verified: !is_verified } : c));
    toast.success(!is_verified ? 'Certificate verified ✓' : 'Verification removed');
  };

  const loadAllUsers = async () => {
    const r = await getAdminUsers({ search, limit: 50 });
    setUsers(r.data.users);
  };

  if (!stats) return <div style={{ padding: 40, color: 'var(--color-muted)' }}>Loading…</div>;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content animate-fadeUp">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>Manage users, verify certificates, and monitor activity.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Users', value: stats.total_users, icon: '◉', color: '#3b5bdb' },
            { label: 'Certificates', value: stats.total_certificates, icon: '◈', color: '#059669' },
            { label: 'Messages Sent', value: stats.total_messages, icon: '✉', color: '#d97706' },
            { label: 'Portfolio Views', value: stats.total_views, icon: '👁', color: '#7c3aed' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>{value}</div>
              <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {['overview', 'users', 'certificates'].map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); if (tab === 'users') loadAllUsers(); }}
              className="btn btn-sm"
              style={{
                background: activeTab === tab ? 'var(--color-accent)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--color-muted)',
                border: `1px solid ${activeTab === tab ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: 15 }}>
              Recent Users
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface)' }}>
                  {['Name', 'Email', 'Portfolio', 'Views', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: 'var(--color-muted)', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-muted)' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {u.slug ? (
                        <Link href={`/portfolio/${u.slug}`} target="_blank" style={{ fontSize: 13, color: 'var(--color-accent)' }}>/{u.slug} ↗</Link>
                      ) : <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{u.view_count || 0}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => handleToggleUser(u.id, u.is_active)}>
                          {u.is_active ? 'Suspend' : 'Activate'}
                        </button>
                        <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b' }} onClick={() => handleDeleteUser(u.id, u.name)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <input className="input" placeholder="Search by name or email…" value={search}
                onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
              <button className="btn btn-primary" onClick={loadAllUsers}>Search</button>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface)' }}>
                    {['Name', 'Email', 'Certs', 'Views', 'Joined', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: 'var(--color-muted)', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>{u.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-muted)' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{u.cert_count || 0}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{u.view_count || 0}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--color-muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>{u.is_active ? 'Active' : 'Suspended'}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => handleToggleUser(u.id, u.is_active)}>
                            {u.is_active ? 'Suspend' : 'Activate'}
                          </button>
                          <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b' }} onClick={() => handleDeleteUser(u.id, u.name)}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div>
            <p style={{ color: 'var(--color-muted)', fontSize: 14, marginBottom: 16 }}>
              {certs.length} pending verification
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {certs.map(cert => (
                <div key={cert.id} className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>{cert.user_name}</span>
                    {cert.is_verified && <span className="badge badge-green">✓ Verified</span>}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{cert.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 12 }}>{cert.issuer}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {cert.file_url && (
                      <a href={cert.file_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">View File</a>
                    )}
                    <button className="btn btn-sm"
                      style={{ background: cert.is_verified ? '#fee2e2' : '#d1fae5', color: cert.is_verified ? '#991b1b' : '#065f46' }}
                      onClick={() => handleVerifyCert(cert.id, cert.is_verified)}>
                      {cert.is_verified ? 'Unverify' : '✓ Verify'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
