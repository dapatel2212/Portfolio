import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import Sidebar from '../../components/user/Sidebar';
import { getProfile, updateProfile, uploadPhoto } from '../../lib/api';
import { useAuth } from '../../lib/auth';

const SKILL_SUGGESTIONS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'SQL',
  'Machine Learning', 'Data Analysis', 'UI/UX Design', 'DevOps',
  'AWS', 'Docker', 'Git', 'TypeScript', 'Next.js', 'MongoDB',
];

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    getProfile().then(r => {
      setProfile(r.data);
      setForm({
        headline: r.data.headline || '',
        bio: r.data.bio || '',
        phone: r.data.phone || '',
        location: r.data.location || '',
        linkedin_url: r.data.linkedin_url || '',
        github_url: r.data.github_url || '',
        website_url: r.data.website_url || '',
        resume_url: r.data.resume_url || '',
        contact_email: r.data.contact_email || '',
        is_public: r.data.is_public ?? true,
      });
      setSkills(r.data.skills || []);
      setPhotoPreview(r.data.photo_url || null);
    });
  }, []);

  const onPhotoDrop = useCallback(files => {
    const file = files[0];
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps: getPhotoProps, getInputProps: getPhotoInput } = useDropzone({
    onDrop: onPhotoDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setUploadingPhoto(true);
    const fd = new FormData();
    fd.append('photo', photoFile);
    try {
      const r = await uploadPhoto(fd);
      setPhotoPreview(r.data.photo_url);
      setPhotoFile(null);
      toast.success('Photo updated!');
    } catch { toast.error('Photo upload failed'); }
    finally { setUploadingPhoto(false); }
  };

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !skills.includes(s) && skills.length < 20) {
      setSkills(prev => [...prev, s]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setSkills(prev => prev.filter(s => s !== skill));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ ...form, skills });
      toast.success('Profile saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1px solid var(--color-border)',
    borderRadius: 8, fontSize: 14,
    fontFamily: 'var(--font-body)',
    color: 'var(--color-ink)',
    background: 'white', outline: 'none',
    boxSizing: 'border-box',
  };

  if (!profile) return <div style={{ padding: 40, color: 'var(--color-muted)' }}>Loading…</div>;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content animate-fadeUp">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, marginBottom: 4 }}>Edit Profile</h1>
            <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
              Your portfolio URL: <strong style={{ color: 'var(--color-accent)' }}>
                {process.env.NEXT_PUBLIC_APP_URL}/portfolio/{profile.slug}
              </strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_public}
                onChange={e => setForm(p => ({ ...p, is_public: e.target.checked }))} />
              Public
            </label>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
            {/* Photo section */}
            <div>
              <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                <div {...getPhotoProps()} style={{ cursor: 'pointer' }}>
                  <input {...getPhotoInput()} />
                  <div style={{
                    width: 110, height: 110, borderRadius: '50%',
                    margin: '0 auto 14px',
                    background: photoPreview ? 'transparent' : 'linear-gradient(135deg, #3b5bdb, #6366f1)',
                    overflow: 'hidden',
                    border: '3px solid var(--color-border)',
                    cursor: 'pointer',
                    position: 'relative',
                  }}>
                    {photoPreview
                      ? <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: 'white', fontFamily: 'var(--font-display)' }}>
                          {user?.name?.[0]}
                        </div>
                    }
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 12 }}>
                    {photoFile ? photoFile.name : 'Click or drop to change photo'}
                  </p>
                </div>
                {photoFile && (
                  <button type="button" className="btn btn-primary btn-sm" onClick={handlePhotoUpload} disabled={uploadingPhoto}>
                    {uploadingPhoto ? 'Uploading…' : 'Upload Photo'}
                  </button>
                )}
              </div>
            </div>

            {/* Main fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, marginBottom: 18 }}>Basic Info</h3>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div>
                    <label className="label">Professional Headline</label>
                    <input style={inputStyle} placeholder="e.g. Full Stack Developer | React & Node.js"
                      value={form.headline} onChange={e => setForm(p => ({ ...p, headline: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Bio</label>
                    <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                      placeholder="Tell interviewers about yourself, your experience, and what you're looking for…"
                      value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="label">Location</label>
                      <input style={inputStyle} placeholder="Mumbai, India"
                        value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input style={inputStyle} placeholder="+91 98765 43210"
                        value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Contact Email (shown on portfolio)</label>
                    <input style={inputStyle} type="email" placeholder="your@gmail.com"
                      value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, marginBottom: 18 }}>Links</h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    { key: 'linkedin_url', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/yourname' },
                    { key: 'github_url', label: 'GitHub URL', placeholder: 'https://github.com/yourname' },
                    { key: 'website_url', label: 'Personal Website', placeholder: 'https://yoursite.com' },
                    { key: 'resume_url', label: 'Resume URL (Google Drive / Dropbox)', placeholder: 'https://drive.google.com/...' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="label">{label}</label>
                      <input style={inputStyle} type="url" placeholder={placeholder}
                        value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, marginBottom: 18 }}>Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                  {skills.map(skill => (
                    <span key={skill} style={{
                      padding: '5px 12px', borderRadius: 99,
                      background: 'var(--color-accent-light)',
                      color: 'var(--color-accent)',
                      fontSize: 13, fontWeight: 500,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                    </span>
                  ))}
                  {skills.length === 0 && <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>No skills added yet</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input style={{ ...inputStyle, flex: 1 }}
                    placeholder="Type a skill and press Enter"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
                  />
                  <button type="button" className="btn btn-outline" onClick={() => addSkill(skillInput)}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 10).map(s => (
                    <button key={s} type="button" onClick={() => addSkill(s)} style={{
                      padding: '4px 10px', borderRadius: 99, fontSize: 12,
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      cursor: 'pointer', color: 'var(--color-muted)',
                    }}>+ {s}</button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
