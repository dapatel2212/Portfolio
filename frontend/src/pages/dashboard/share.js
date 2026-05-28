import { useAuth } from '../../lib/auth';
import Sidebar from '../../components/user/Sidebar';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SharePage() {
  const { user } = useAuth();
  const portfolioUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portfolio/${user?.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(portfolioUrl);
    toast.success('Link copied to clipboard!');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out my portfolio — ${user?.name}`);
    const body = encodeURIComponent(`Hi,\n\nI'd love for you to check out my professional portfolio:\n\n${portfolioUrl}\n\nIt includes my certifications, projects, and background.\n\nBest regards,\n${user?.name}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const downloadQR = () => {
    const svg = document.getElementById('portfolio-qr');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 300; canvas.height = 300;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 0, 0, 300, 300);
      const a = document.createElement('a');
      a.download = `${user?.slug}-qr.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content animate-fadeUp">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Share Your Portfolio</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
            Share your portfolio link with recruiters, interviewers, or on your resume.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 800 }}>
          {/* Link card */}
          <div className="card" style={{ padding: 28, gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: 16, fontSize: 15 }}>Your Portfolio URL</h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--color-accent-light)',
              border: '1px solid #c7d2fe',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 16,
            }}>
              <span style={{ flex: 1, fontSize: 14, color: 'var(--color-accent)', fontWeight: 600, wordBreak: 'break-all' }}>
                {portfolioUrl}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={copyLink}>📋 Copy Link</button>
              <button className="btn btn-outline" onClick={shareViaEmail}>✉ Share via Email</button>
              <button className="btn btn-outline" onClick={shareOnLinkedIn}>in Share on LinkedIn</button>
              <Link href={portfolioUrl} target="_blank" className="btn btn-outline">↗ Open Portfolio</Link>
            </div>
          </div>

          {/* QR Code */}
          <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h3 style={{ marginBottom: 20, fontSize: 15, alignSelf: 'flex-start' }}>QR Code</h3>
            <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid var(--color-border)', marginBottom: 16 }}>
              {user?.slug && (
                <QRCodeSVG
                  id="portfolio-qr"
                  value={portfolioUrl}
                  size={180}
                  level="M"
                  includeMargin={false}
                />
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 12 }}>
              Print on your resume or business card
            </p>
            <button className="btn btn-outline btn-sm" onClick={downloadQR}>⬇ Download QR</button>
          </div>

          {/* Tips */}
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 15, marginBottom: 16 }}>💡 Sharing Tips</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Add the link to your LinkedIn profile',
                'Include it in your email signature',
                'Put the QR code on your resume',
                'Share before every interview',
                'Keep your certificates up to date',
              ].map((tip, i) => (
                <li key={i} style={{ fontSize: 14, color: 'var(--color-muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
