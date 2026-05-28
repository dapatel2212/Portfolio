import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0b0f1a 0%, #1a1f35 50%, #0b0f1a 100%)',
      fontFamily: 'var(--font-body)',
      color: 'white',
    }}>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>
          Portfolio<span style={{ color: '#6366f1' }}>Hub</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>
            Sign In
          </Link>
          <Link href="/register" style={{ padding: '9px 20px', borderRadius: 8, background: '#6366f1', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '100px 24px 80px' }}>
        <div style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 99, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', fontSize: 13, color: '#a5b4fc', marginBottom: 24 }}>
          ✦ Your professional story, one link away
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.03em', maxWidth: 800, margin: '0 auto 20px' }}>
          Build a Portfolio That<br />
          <span style={{ color: '#818cf8' }}>Wins Interviews</span>
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Upload certificates, showcase projects, and share your unique link with any interviewer — in seconds.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ padding: '14px 32px', borderRadius: 10, background: '#6366f1', color: 'white', textDecoration: 'none', fontSize: 16, fontWeight: 700 }}>
            Create Free Portfolio →
          </Link>
          <Link href="/portfolio/demo" style={{ padding: '14px 32px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 16 }}>
            See Example
          </Link>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 100px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        {[
          { icon: '◈', title: 'Upload Certificates', desc: 'PDF or image — all your certifications in one place. Interviewers can verify them instantly.' },
          { icon: '↗', title: 'Shareable Link', desc: 'One URL, shareable anywhere — email, WhatsApp, LinkedIn, or printed as a QR code.' },
          { icon: '✉', title: 'Direct Contact', desc: 'Interviewers message you through your portfolio. Their message lands straight in your Gmail.' },
          { icon: '◉', title: 'Admin Verified', desc: 'Platform admins can verify your certificates, adding a trust badge to your profile.' },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ padding: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
            <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 10 }}>{title}</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
        PortfolioHub · Built with Next.js, Node.js & PostgreSQL
      </div>
    </div>
  );
}
