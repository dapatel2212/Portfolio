import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { useRouter } from 'next/router';
import Sidebar from '../../components/user/Sidebar';
import { getAdminUsers, toggleUserStatus, deleteUser } from '../../lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminUsers() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/dashboard');
  }, [user, loading]);

  const handleToggleUser = async (id, is_active) => {
    try {
      await toggleUserStatus(id, !is_active);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !is_active } : u));
      toast.success(!is_active ? 'User activated' : 'User suspended');
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Permanently delete "${name}" and all their data?`)) return;
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('User deleted');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    try {
      const r = await getAdminUsers({ search, limit: 100 });
      setUsers(r.data.users);
      if (r.data.users.length === 0) toast('No users found');
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content animate-fadeUp">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Users</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>Manage user accounts and permissions.</p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input className="input" placeholder="Search by name or email…" value={search}
            onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
          <button className="btn btn-primary" onClick={handleSearch} disabled={searching}>
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface)' }}>
                {['Name', 'Email', 'Portfolio', 'Certificates', 'Views', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: 'var(--color-muted)', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--color-muted)' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-muted)' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {u.slug ? (
                        <Link href={`/portfolio/${u.slug}`} target="_blank" style={{ fontSize: 13, color: 'var(--color-accent)', textDecoration: 'none' }}>
                          /{u.slug} ↗
                        </Link>
                      ) : <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{u.cert_count || 0}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{u.view_count || 0}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--color-muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
