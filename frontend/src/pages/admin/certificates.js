import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { useRouter } from 'next/router';
import Sidebar from '../../components/user/Sidebar';
import { getAdminCertificates, verifyCertificate } from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminCertificates() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [certs, setCerts] = useState([]);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/dashboard');
  }, [user, loading]);

  useEffect(() => {
    loadCertificates();
  }, [filter]);

  const loadCertificates = async () => {
    try {
      const r = await getAdminCertificates({ verified: filter === 'verified' ? 'true' : 'false' });
      setCerts(r.data);
    } catch (err) {
      toast.error('Failed to load certificates');
    }
  };

  const handleVerifyCert = async (id, is_verified) => {
    try {
      await verifyCertificate(id, !is_verified);
      setCerts(prev => prev.map(c => c.id === id ? { ...c, is_verified: !is_verified } : c));
      toast.success(!is_verified ? 'Certificate verified ✓' : 'Verification removed');
    } catch (err) {
      toast.error('Failed to update certificate');
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content animate-fadeUp">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Certificates</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>Review and verify user certificates.</p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['pending', 'verified'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="btn btn-sm"
              style={{
                background: filter === f ? 'var(--color-accent)' : 'transparent',
                color: filter === f ? 'white' : 'var(--color-muted)',
                border: `1px solid ${filter === f ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}>
              {f === 'pending' ? `Pending (${certs.length})` : 'Verified'}
            </button>
          ))}
        </div>

        {certs.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-muted)' }}>
            No {filter} certificates
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {certs.map(cert => (
              <div key={cert.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 4 }}>{cert.user_name}</div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{cert.title}</div>
                  </div>
                  {cert.is_verified && (
                    <span style={{ fontSize: 20 }}>✓</span>
                  )}
                </div>

                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--color-accent)', textDecoration: 'none' }}>
                    View Certificate ↗
                  </a>
                )}

                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <button className={`btn btn-sm ${cert.is_verified ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => handleVerifyCert(cert.id, cert.is_verified)}>
                    {cert.is_verified ? 'Remove Verification' : 'Verify'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
