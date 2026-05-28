import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import Sidebar from '../../components/user/Sidebar';
import { getProjects, createProject, deleteProject } from '../../lib/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', live_url: '', github_url: '', tech_stack: '' });

  useEffect(() => { getProjects().then(r => setProjects(r.data)); }, []);

  const onDrop = useCallback(files => {
    const file = files[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1, maxSize: 5 * 1024 * 1024,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Title is required');
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);
    try {
      const r = await createProject(fd);
      setProjects(prev => [r.data, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', live_url: '', github_url: '', tech_stack: '' });
      setImageFile(null); setImagePreview(null);
      toast.success('Project added!');
    } catch { toast.error('Failed to add project'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    toast.success('Deleted');
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content animate-fadeUp">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, marginBottom: 4 }}>Projects</h1>
            <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>{projects.length} project{projects.length !== 1 ? 's' : ''} showcased</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Project'}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ padding: 28, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 20 }}>New Project</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label">Project Title *</label>
                  <input className="input" placeholder="My Awesome App" value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label">Description</label>
                  <textarea className="input" rows={3} placeholder="What does this project do? What problem does it solve?"
                    value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    style={{ resize: 'vertical' }} />
                </div>
                <div>
                  <label className="label">Live URL</label>
                  <input className="input" type="url" placeholder="https://myapp.vercel.app"
                    value={form.live_url} onChange={e => setForm(p => ({ ...p, live_url: e.target.value }))} />
                </div>
                <div>
                  <label className="label">GitHub URL</label>
                  <input className="input" type="url" placeholder="https://github.com/user/repo"
                    value={form.github_url} onChange={e => setForm(p => ({ ...p, github_url: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label">Tech Stack (comma-separated)</label>
                  <input className="input" placeholder="React, Node.js, PostgreSQL, Tailwind CSS"
                    value={form.tech_stack} onChange={e => setForm(p => ({ ...p, tech_stack: e.target.value }))} />
                </div>
              </div>

              {/* Image drop */}
              <div>
                <label className="label">Screenshot / Preview Image</label>
                <div {...getRootProps()} style={{
                  border: `2px dashed ${isDragActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                  background: isDragActive ? 'var(--color-accent-light)' : 'var(--color-surface)',
                  transition: 'all 0.2s',
                }}>
                  <input {...getInputProps()} />
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ padding: 24, textAlign: 'center' }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>🖼</div>
                      <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>Drop a screenshot here · Max 5MB</div>
                    </div>
                  )}
                </div>
              </div>

              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Adding…' : 'Add Project'}
              </button>
            </form>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--color-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>◇</div>
            <h3>No projects yet</h3>
            <p style={{ fontSize: 14, marginTop: 8 }}>Add your first project to showcase your work</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {projects.map(proj => (
              <div key={proj.id} className="card" style={{ overflow: 'hidden' }}>
                {proj.image_url && (
                  <img src={proj.image_url} alt={proj.title}
                    style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
                )}
                <div style={{ padding: 18 }}>
                  <h3 style={{ fontSize: 15, marginBottom: 6 }}>{proj.title}</h3>
                  {proj.description && (
                    <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: 10 }}>
                      {proj.description.substring(0, 100)}{proj.description.length > 100 ? '…' : ''}
                    </p>
                  )}
                  {proj.tech_stack?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                      {proj.tech_stack.slice(0, 4).map(t => (
                        <span key={t} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>{t}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                    {proj.live_url && <a href={proj.live_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Live ↗</a>}
                    {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">GitHub</a>}
                    <button className="btn btn-sm" style={{ marginLeft: 'auto', background: '#fee2e2', color: '#991b1b' }} onClick={() => handleDelete(proj.id)}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
