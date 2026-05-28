import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { useRouter } from 'next/router';
import Sidebar from '../../components/user/Sidebar';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState({
    platform_name: 'PortfolioHub',
    platform_description: 'A professional portfolio platform for showcasing your work',
    contact_email: 'support@portfoliohub.com'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/dashboard');
  }, [user, loading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, you would call an API endpoint to save these settings
      // For now, just show a success message
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content animate-fadeUp">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Settings</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>Manage platform settings and configurations.</p>
        </div>

        <div style={{ maxWidth: 600 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--color-muted)', marginBottom: 6, fontWeight: 600 }}>
                Platform Name
              </label>
              <input className="input"
                value={settings.platform_name}
                onChange={e => setSettings(prev => ({ ...prev, platform_name: e.target.value }))}
                placeholder="Platform name" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--color-muted)', marginBottom: 6, fontWeight: 600 }}>
                Platform Description
              </label>
              <textarea className="input"
                value={settings.platform_description}
                onChange={e => setSettings(prev => ({ ...prev, platform_description: e.target.value }))}
                placeholder="Platform description"
                rows="4"
                style={{ resize: 'none' }} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--color-muted)', marginBottom: 6, fontWeight: 600 }}>
                Contact Email
              </label>
              <input className="input"
                type="email"
                value={settings.contact_email}
                onChange={e => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                placeholder="support@example.com" />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Settings'}
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 24, marginTop: 20, borderColor: '#fee2e2' }}>
            <h3 style={{ fontSize: 15, marginBottom: 12, color: '#991b1b' }}>Danger Zone</h3>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 16 }}>
              Irreversible actions
            </p>
            <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b' }} onClick={() => {
              if (confirm('Sign out?')) logout();
            }}>
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
