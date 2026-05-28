const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { uploadPhoto } = require('../config/cloudinary');

// ─────────────────────────────────────────
// GET /api/profile — get own profile
// ─────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM profiles WHERE user_id = $1',
    [req.user.id]
  );
  res.json(result.rows[0] || {});
});

// ─────────────────────────────────────────
// PUT /api/profile — update own profile
// ─────────────────────────────────────────
router.put('/', authenticate, async (req, res) => {
  const {
    headline, bio, phone, location,
    linkedin_url, github_url, website_url, resume_url,
    skills, contact_email, is_public
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE profiles SET
        headline = COALESCE($1, headline),
        bio = COALESCE($2, bio),
        phone = COALESCE($3, phone),
        location = COALESCE($4, location),
        linkedin_url = COALESCE($5, linkedin_url),
        github_url = COALESCE($6, github_url),
        website_url = COALESCE($7, website_url),
        resume_url = COALESCE($8, resume_url),
        skills = COALESCE($9, skills),
        contact_email = COALESCE($10, contact_email),
        is_public = COALESCE($11, is_public),
        updated_at = NOW()
       WHERE user_id = $12
       RETURNING *`,
      [headline, bio, phone, location, linkedin_url, github_url,
       website_url, resume_url, skills, contact_email, is_public, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// ─────────────────────────────────────────
// POST /api/profile/photo — upload profile photo
// ─────────────────────────────────────────
router.post('/photo', authenticate, uploadPhoto.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const photo_url = req.file.path;
  await pool.query(
    'UPDATE profiles SET photo_url = $1, updated_at = NOW() WHERE user_id = $2',
    [photo_url, req.user.id]
  );
  res.json({ photo_url });
});

// ─────────────────────────────────────────
// GET /api/profile/public/:slug — PUBLIC: no auth required
// ─────────────────────────────────────────
router.get('/public/:slug', async (req, res) => {
  try {
    // Get profile + user name
    const profileResult = await pool.query(
      `SELECT p.*, u.name
       FROM profiles p JOIN users u ON u.id = p.user_id
       WHERE p.slug = $1 AND p.is_public = true AND u.is_active = true`,
      [req.params.slug]
    );

    if (!profileResult.rows[0]) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const profile = profileResult.rows[0];

    // Get certificates (visible ones)
    const certs = await pool.query(
      `SELECT id, title, issuer, issue_date, expiry_date, credential_id,
              credential_url, file_url, file_type, is_verified
       FROM certificates WHERE user_id = $1 AND is_visible = true
       ORDER BY issue_date DESC NULLS LAST`,
      [profile.user_id]
    );

    // Get projects
    const projects = await pool.query(
      `SELECT * FROM projects WHERE user_id = $1 ORDER BY display_order ASC, created_at DESC`,
      [profile.user_id]
    );

    // Log view (non-blocking)
    pool.query(
      `INSERT INTO profile_views (profile_id, viewer_ip, viewer_agent) VALUES ($1, $2, $3)`,
      [profile.id, req.ip, req.headers['user-agent']]
    ).catch(() => {});

    // Increment view count
    pool.query(
      'UPDATE profiles SET view_count = view_count + 1 WHERE id = $1',
      [profile.id]
    ).catch(() => {});

    res.json({
      profile,
      certificates: certs.rows,
      projects: projects.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load portfolio' });
  }
});

// ─────────────────────────────────────────
// GET /api/profile/stats — own profile stats
// ─────────────────────────────────────────
router.get('/stats', authenticate, async (req, res) => {
  const profileResult = await pool.query(
    'SELECT id, view_count, slug FROM profiles WHERE user_id = $1',
    [req.user.id]
  );
  if (!profileResult.rows[0]) return res.json({ views: 0, certs: 0, messages: 0 });

  const { id, view_count } = profileResult.rows[0];

  const [certCount, msgCount] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM certificates WHERE user_id = $1', [req.user.id]),
    pool.query('SELECT COUNT(*) FROM messages WHERE recipient_user_id = $1 AND is_read = false', [req.user.id]),
  ]);

  res.json({
    views: view_count,
    certs: parseInt(certCount.rows[0].count),
    unread_messages: parseInt(msgCount.rows[0].count),
  });
});

module.exports = router;
