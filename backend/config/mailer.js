const nodemailer = require('nodemailer');

// Uses Gmail App Password (not your real password)
// Setup: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send contact form message to user's registered email
 * @param {Object} opts
 * @param {string} opts.toEmail      - user's Gmail address
 * @param {string} opts.toName       - user's name
 * @param {string} opts.senderName   - interviewer's name
 * @param {string} opts.senderEmail  - interviewer's email
 * @param {string} opts.senderCompany
 * @param {string} opts.subject
 * @param {string} opts.body
 */
async function sendContactEmail(opts) {
  const { toEmail, toName, senderName, senderEmail, senderCompany, subject, body } = opts;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .card { background: white; max-width: 600px; margin: auto; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        .header { background: #0f172a; color: white; padding: 28px 32px; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
        .header p { margin: 6px 0 0; color: #94a3b8; font-size: 14px; }
        .body { padding: 28px 32px; }
        .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
        .value { font-size: 15px; color: #0f172a; margin-bottom: 20px; font-weight: 500; }
        .message-box { background: #f8fafc; border-left: 3px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
        .message-box p { margin: 0; color: #334155; line-height: 1.7; font-size: 15px; }
        .reply-btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 16px; }
        .footer { background: #f8fafc; padding: 16px 32px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>📬 New Message on Your Portfolio</h1>
          <p>Someone reached out through your public portfolio page</p>
        </div>
        <div class="body">
          <div class="label">From</div>
          <div class="value">${senderName}${senderCompany ? ` · ${senderCompany}` : ''}</div>
          <div class="label">Their Email</div>
          <div class="value"><a href="mailto:${senderEmail}" style="color:#3b82f6">${senderEmail}</a></div>
          <div class="label">Subject</div>
          <div class="value">${subject}</div>
          <div class="label">Message</div>
          <div class="message-box"><p>${body.replace(/\n/g, '<br>')}</p></div>
          <a href="mailto:${senderEmail}?subject=Re: ${encodeURIComponent(subject)}" class="reply-btn">
            Reply to ${senderName}
          </a>
        </div>
        <div class="footer">
          This message was sent via your portfolio on Portfolio Platform. 
          The sender's email is ${senderEmail} — click Reply to respond directly.
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"Portfolio Platform" <${process.env.GMAIL_USER}>`,
    to: `"${toName}" <${toEmail}>`,
    replyTo: `"${senderName}" <${senderEmail}>`,
    subject: `[Portfolio Contact] ${subject}`,
    html,
  });
}

/**
 * Send a welcome email to new users
 */
async function sendWelcomeEmail(toEmail, toName) {
  return transporter.sendMail({
    from: `"Portfolio Platform" <${process.env.GMAIL_USER}>`,
    to: `"${toName}" <${toEmail}>`,
    subject: 'Welcome to Portfolio Platform! 🎉',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: auto; padding: 40px 20px;">
        <h1 style="color: #0f172a">Welcome, ${toName}! 👋</h1>
        <p style="color: #475569; line-height: 1.7;">Your account is ready. Start building your portfolio by:</p>
        <ul style="color: #475569; line-height: 2;">
          <li>Adding your bio and profile photo</li>
          <li>Uploading your certificates</li>
          <li>Adding your projects</li>
          <li>Sharing your unique portfolio link with interviewers</li>
        </ul>
        <a href="${process.env.FRONTEND_URL}/dashboard" 
           style="display:inline-block; background:#0f172a; color:white; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600; margin-top:16px;">
          Go to Dashboard →
        </a>
      </div>
    `,
  });
}

module.exports = { sendContactEmail, sendWelcomeEmail };
