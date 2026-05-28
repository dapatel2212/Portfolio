import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import Sidebar from '../../components/user/Sidebar';
import { getCertificates, uploadCertificate, deleteCertificate, updateCertificate } from '../../lib/api';

export default function CertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', issuer: '', issue_date: '', expiry_date: '', credential_id: '', credential_url: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    getCertificates().then(r => setCerts(r.data));
  }, []);

  const onDrop = useCallback(files => {
    setSelectedFile(files[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.issuer) return toast.error('Title and issuer are required');
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
    if (selectedFile) fd.append('file', selectedFile);

    try {
      const r = await uploadCertificate(fd);
      setCerts(prev => [r.data, ...prev]);
      setShowForm(false);
      setForm({ title: '', issuer: '', issue_date: '', expiry_date: '', credential_id: '', credential_url: '' });
      setSelectedFile(null);
      toast.success('Certificate uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this certificate?')) return;
    await deleteCertificate(id);
    setCerts(prev => prev.filter(c => c.id !== id));
    toast.success('Deleted');
  };

  const toggleVisibility = async (cert) => {
    const updated = await updateCertificate(cert.id, { is_visible: !cert.is_visible });
    setCerts(prev => prev.map(c => c.id === cert.id ? updated.data : c));
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content animate-fadeUp">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, marginBottom: 4 }}>Certificates</h1>
            <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>{certs.length} certificate{certs.length !== 1 ? 's' : ''} uploaded</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Certificate'}
          </button>
        </div>

        {/* Upload Form */}
        {showForm && (
          <div className="card" style={{ padding: 28, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 20, fontSize: 16 }}>Add New Certificate</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="label">Certificate Title *</label>
                  <input className="input" placeholder="e.g. AWS Solutions Architect" value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Issuing Organization *</label>
                  <input className="input" placeholder="e.g. Amazon Web Services" value={form.issuer}
                    onChange={e => setForm(p => ({ ...p, issuer: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Issue Date</label>
                  <input className="input" type="date" value={form.issue_date}
                    onChange={e => setForm(p => ({ ...p, issue_date: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Expiry Date (optional)</label>
                  <input className="input" type="date" value={form.expiry_date}
                    onChange={e => setForm(p => ({ ...p, expiry_date: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Credential ID</label>
                  <input className="input" placeholder="ABC123XYZ" value={form.credential_id}
                    onChange={e => setForm(p => ({ ...p, credential_id: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Credential URL</label>
                  <input className="input" type="url" placeholder="https://verify.example.com/..." value={form.credential_url}
                    onChange={e => setForm(p => ({ ...p, credential_url: e.target.value }))} />
                </div>
              </div>

              {/* Dropzone */}
              <div {...getRootProps()} style={{
                border: `2px dashed ${isDragActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 10,
                padding: 28,
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragActive ? 'var(--color-accent-light)' : 'var(--color-surface)',
                marginBottom: 16,
                transition: 'all 0.2s',
              }}>
                <input {...getInputProps()} />
                <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
                {selectedFile ? (
                  <div>
                    <strong style={{ color: 'var(--color-accent)' }}>{selectedFile.name}</strong>
                    <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>Drop your certificate here</div>
                    <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>PDF or image · Max 10MB</div>
                  </div>
                )}
              </div>

              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Uploading…' : 'Upload Certificate'}
              </button>
            </form>
          </div>
        )}

        {/* Certificate Grid */}
        {certs.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--color-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>◈</div>
            <h3>No certificates yet</h3>
            <p style={{ fontSize: 14, marginTop: 8 }}>Upload your first certificate to get started</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {certs.map(cert => (
              <CertCard key={cert.id} cert={cert} onDelete={handleDelete} onToggle={toggleVisibility} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function CertCard({ cert, onDelete, onToggle }) {
  const isExpired = cert.expiry_date && new Date(cert.expiry_date) < new Date();

  return (
    <div className="card" style={{ padding: 20, opacity: cert.is_visible ? 1 : 0.6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ fontSize: 28 }}>
          {cert.file_type === 'pdf' ? '📄' : cert.file_url ? '🖼' : '🏅'}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {cert.is_verified && <span className="badge badge-green">✓ Verified</span>}
          {isExpired && <span className="badge badge-red">Expired</span>}
          {!cert.is_visible && <span className="badge badge-gray">Hidden</span>}
        </div>
      </div>
      <h3 style={{ fontSize: 15, marginBottom: 4, lineHeight: 1.3 }}>{cert.title}</h3>
      <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 8 }}>{cert.issuer}</p>
      {cert.issue_date && (
        <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>
          Issued: {new Date(cert.issue_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
          {cert.expiry_date && ` · Expires: ${new Date(cert.expiry_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}`}
        </p>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 14, borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
        {cert.file_url && (
          <a href={cert.file_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">View</a>
        )}
        {cert.credential_url && (
          <a href={cert.credential_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Verify ↗</a>
        )}
        <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={() => onToggle(cert)}>
          {cert.is_visible ? 'Hide' : 'Show'}
        </button>
        <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b' }} onClick={() => onDelete(cert.id)}>✕</button>
      </div>
    </div>
  );
}
