const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { sendContactEmail } = require('../config/mailer');

// ─────────────────────────────────────────
// POST /api/contact/:slug — PUBLIC: send message to portfolio owner
// No auth required — anyone (interviewer) can send a message
// ─────────────────────────────────────────
router.post('/:slug', [
  body('sender_name').trim().isLength({ min: 2, max: 100 }),
  body('sender_email').isEmail().normalizeEmail(),
  body('sender_company').optional().trim().isLength({ max: 200 }),
  body('subject').trim().isLength({ min: 3, max: 300 }),
  body('body').trim().isLength({ min: 10, max: 3000 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { sender_name, sender_email, sender_company, subject, body: msgBody } = req.body;

  try {
    // Find the user by portfolio slug
    const profileResult = await pool.query(
      `SELECT p.user_id, p.contact_email, u.name, u.email
       FROM profiles p JOIN users u ON u.id = p.user_id
       WHERE p.slug = $1 AND p.is_public = true AND u.is_active = true`,
      [req.params.slug]
    );

    if (!profileResult.rows[0]) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const { user_id, contact_email, name, email } = profileResult.rows[0];
    const recipientEmail = contact_email || email; // Use custom contact email if set

    // Save message in database
    await pool.query(
      `INSERT INTO messages (recipient_user_id, sender_name, sender_email, sender_company, subject, body)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user_id, sender_name, sender_email, sender_company || null, subject, msgBody]
    );

    // Send email to user's Gmail
    await sendContactEmail({
      toEmail: recipientEmail,
      toName: name,
      senderName: sender_name,
      senderEmail: sender_email,
      senderCompany: sender_company,
      subject,
      body: msgBody,
    });

    res.json({ message: 'Message sent successfully! The portfolio owner will receive it in their inbox.' });
  } catch (err) {
    console.error('Contact email error:', err);
    res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
});

// ─────────────────────────────────────────
// GET /api/contact/inbox — get own messages
// ─────────────────────────────────────────
router.get('/inbox', authenticate, async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM messages
     WHERE recipient_user_id = $1
     ORDER BY sent_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
});

// ─────────────────────────────────────────
// PATCH /api/contact/inbox/:id/read — mark message as read
// ─────────────────────────────────────────
router.patch('/inbox/:id/read', authenticate, async (req, res) => {
  await pool.query(
    'UPDATE messages SET is_read = true WHERE id = $1 AND recipient_user_id = $2',
    [req.params.id, req.user.id]
  );
  res.json({ message: 'Marked as read' });
});

module.exports = router;
