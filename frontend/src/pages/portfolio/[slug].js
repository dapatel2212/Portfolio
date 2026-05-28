import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getPublicProfile, sendContactMessage } from '../../lib/api';
import toast from 'react-hot-toast';

export default function PublicPortfolioPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactForm, setContactForm] = useState({
    sender_name: '', sender_email: '', sender_company: '', subject: '', body: ''
  });

  useEffect(() => {
    if (!slug) return;
    getPublicProfile(slug)
      .then(r => setData(r.data))
      .catch(() => router.push('/404'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleContact = async (e) => {
    e.preventDefault();
    if (!contactForm.sender_name || !contactForm.sender_email || !contactForm.subject || !contactForm.body) {
      return toast.error('Please fill all required fields');
    }
    setSending(true);
    try {
      await sendContactMessage(slug, contactForm);
      toast.success('Message sent! They\'ll receive it in their Gmail inbox.');
      setShowContact(false);
      setContactForm({ sender_name: '', sender_email: '', sender_company: '', subject: '', body: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally { setSending(false); }
  };

  if (loading) return <LoadingScreen />;
  if (!data) return null;

  const { profile, certificates, projects } = data;

  return (
    <div style={{ fontFamily: 'var(--font-body)', minHeight: '100vh', background: '#0b0f1a', color: 'white' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0b0f1a 0%, #1a1f35 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '60px 0 48px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: profile.photo_url ? 'transparent' : 'linear-gradient(135deg, #3b5bdb, #6366f1)',
              overflow: 'hidden',
              border: '3px solid rgba(99,102,241,0.4)',
              flexShrink: 0,
            }}>
              {profile.photo_url
                ? <img src={profile.photo_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                    {profile.name?.[0]}
                  </div>
              }
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontSize: 36, fontFamily: 'var(--font-display)', marginBottom: 6 }}>{profile.name}</h1>
              {profile.headline && <p style={{ fontSize: 17, color: '#818cf8', marginBottom: 10, fontWeight: 500 }}>{profile.headline}</p>}
              {profile.location && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>📍 {profile.location}</p>}

              {/* Skills */}
              {profile.skills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {profile.skills.map(skill => (
                    <span key={skill} style={{
                      padding: '4px 12px', borderRadius: 99,
                      background: 'rgba(99,102,241,0.15)',
                      border: '1px solid rgba(99,102,241,0.3)',
                      fontSize: 13, color: '#a5b4fc',
                    }}>{skill}</span>
                  ))}
                </div>
              )}

              {/* Links */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {profile.linkedin_url && <SocialLink href={profile.linkedin_url} label="LinkedIn" />}
                {profile.github_url && <SocialLink href={profile.github_url} label="GitHub" />}
                {profile.website_url && <SocialLink href={profile.website_url} label="Website" />}
                {profile.resume_url && (
                  <a href={profile.resume_url} target="_blank" rel="noreferrer" style={{
                    padding: '8px 16px', borderRadius: 8,
                    background: 'var(--color-accent)',
                    color: 'white', fontSize: 13, fontWeight: 600,
                    textDecoration: 'none',
                  }}>⬇ Resume</a>
                )}
                <button onClick={() => setShowContact(true)} style={{
                  padding: '8px 16px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}>✉ Contact Me</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>

        {/* Bio */}
        {profile.bio && (
          <Section title="About">
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.75)' }}>{profile.bio}</p>
          </Section>
        )}

        {/* Certificates */}
        {certificates.length > 0 && (
          <Section title={`Certificates (${certificates.length})`}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {certificates.map(cert => <CertCard key={cert.id} cert={cert} />)}
            </div>
          </Section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <Section title="Projects">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {projects.map(proj => <ProjectCard key={proj.id} project={proj} />)}
            </div>
          </Section>
        )}
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 20,
        }}>
          <div style={{
            background: '#1a1f35',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 32,
            width: '100%', maxWidth: 520,
            position: 'relative',
          }}>
            <button onClick={() => setShowContact(false)} style={{
              position: 'absolute', top: 16, right: 16,
              background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)',
              fontSize: 20, cursor: 'pointer',
            }}>✕</button>

            <h2 style={{ fontSize: 20, marginBottom: 6 }}>Contact {profile.name}</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
              Your message will be delivered directly to their Gmail inbox.
            </p>

            <form onSubmit={handleContact} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Your Name *</label>
                  <input value={contactForm.sender_name} onChange={e => setContactForm(p => ({ ...p, sender_name: e.target.value }))}
                    placeholder="John Smith" required
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'white', fontSize: 14, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Your Email *</label>
                  <input type="email" value={contactForm.sender_email} onChange={e => setContactForm(p => ({ ...p, sender_email: e.target.value }))}
                    placeholder="john@company.com" required
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'white', fontSize: 14, outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Company (optional)</label>
                <input value={contactForm.sender_company} onChange={e => setContactForm(p => ({ ...p, sender_company: e.target.value }))}
                  placeholder="Acme Corp"
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'white', fontSize: 14, outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Subject *</label>
                <input value={contactForm.subject} onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Interested in your profile for..." required
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'white', fontSize: 14, outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Message *</label>
                <textarea value={contactForm.body} onChange={e => setContactForm(p => ({ ...p, body: e.target.value }))}
                  placeholder="Hi, I came across your portfolio and..." required rows={5}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'white', fontSize: 14, outline: 'none', resize: 'vertical' }} />
              </div>
              <button type="submit" disabled={sending} style={{
                padding: '12px', background: '#3b5bdb', color: 'white',
                border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
                cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1,
              }}>
                {sending ? 'Sending…' : '✉ Send Message'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 20,
        marginBottom: 20,
        paddingBottom: 12,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.9)',
      }}>{title}</h2>
      {children}
    </div>
  );
}

function CertCard({ cert }) {
  const isExpired = cert.expiry_date && new Date(cert.expiry_date) < new Date();
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12, padding: 18,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: 24 }}>{cert.file_type === 'pdf' ? '📄' : '🏅'}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {cert.is_verified && (
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>✓ Verified</span>
          )}
          {isExpired && (
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>Expired</span>
          )}
        </div>
      </div>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{cert.title}</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>{cert.issuer}</div>
      {cert.issue_date && (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          {new Date(cert.issue_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {cert.file_url && (
          <a href={cert.file_url} target="_blank" rel="noreferrer" style={{
            fontSize: 12, padding: '5px 12px', borderRadius: 6,
            background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)',
            textDecoration: 'none',
          }}>View</a>
        )}
        {cert.credential_url && (
          <a href={cert.credential_url} target="_blank" rel="noreferrer" style={{
            fontSize: 12, padding: '5px 12px', borderRadius: 6,
            background: 'rgba(99,102,241,0.2)', color: '#a5b4fc',
            textDecoration: 'none',
          }}>Verify ↗</a>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12, overflow: 'hidden',
    }}>
      {project.image_url && (
        <img src={project.image_url} alt={project.title}
          style={{ width: '100%', height: 140, objectFit: 'cover' }} />
      )}
      <div style={{ padding: 18 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{project.title}</div>
        {project.description && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 12 }}>
            {project.description.substring(0, 120)}{project.description.length > 120 ? '…' : ''}
          </p>
        )}
        {project.tech_stack?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {project.tech_stack.slice(0, 4).map(t => (
              <span key={t} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>{t}</span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#818cf8', textDecoration: 'none' }}>Live ↗</a>
          )}
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>GitHub</a>
          )}
        </div>
      </div>
    </div>
  );
}

function SocialLink({ href, label }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{
      padding: '6px 14px', borderRadius: 8,
      border: '1px solid rgba(255,255,255,0.15)',
      color: 'rgba(255,255,255,0.7)', fontSize: 13,
      textDecoration: 'none',
      transition: 'all 0.15s',
    }}>{label}</a>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: '#0b0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>
      Loading portfolio…
    </div>
  );
}
