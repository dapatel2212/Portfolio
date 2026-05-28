const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { uploadCertificate } = require('../config/cloudinary');

// ─────────────────────────────────────────
// GET /api/certificates — get own certificates
// ─────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM certificates WHERE user_id = $1 ORDER BY issue_date DESC NULLS LAST, created_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
});

// ─────────────────────────────────────────
// POST /api/certificates — upload a certificate
// ─────────────────────────────────────────
router.post('/', authenticate, uploadCertificate.single('file'), async (req, res) => {
  const { title, issuer, issue_date, expiry_date, credential_id, credential_url } = req.body;

  if (!title || !issuer) {
    return res.status(400).json({ error: 'Title and issuer are required' });
  }

  try {
    const file_url = req.file ? req.file.path : null;
    const file_type = req.file
      ? (req.file.mimetype === 'application/pdf' ? 'pdf' : 'image')
      : null;

    const result = await pool.query(
      `INSERT INTO certificates
         (user_id, title, issuer, issue_date, expiry_date, credential_id, credential_url, file_url, file_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [req.user.id, title, issuer,
       issue_date || null, expiry_date || null,
       credential_id || null, credential_url || null,
       file_url, file_type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Certificate upload failed' });
  }
});

// ─────────────────────────────────────────
// PUT /api/certificates/:id — update cert metadata
// ─────────────────────────────────────────
router.put('/:id', authenticate, async (req, res) => {
  const { title, issuer, issue_date, expiry_date, credential_id, credential_url, is_visible } = req.body;

  const result = await pool.query(
    `UPDATE certificates SET
       title = COALESCE($1, title),
       issuer = COALESCE($2, issuer),
       issue_date = COALESCE($3, issue_date),
       expiry_date = COALESCE($4, expiry_date),
       credential_id = COALESCE($5, credential_id),
       credential_url = COALESCE($6, credential_url),
       is_visible = COALESCE($7, is_visible)
     WHERE id = $8 AND user_id = $9
     RETURNING *`,
    [title, issuer, issue_date, expiry_date, credential_id, credential_url, is_visible, req.params.id, req.user.id]
  );

  if (!result.rows[0]) return res.status(404).json({ error: 'Certificate not found' });
  res.json(result.rows[0]);
});

// ─────────────────────────────────────────
// DELETE /api/certificates/:id
// ─────────────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  const result = await pool.query(
    'DELETE FROM certificates WHERE id = $1 AND user_id = $2 RETURNING file_url',
    [req.params.id, req.user.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Certificate not found' });

  // Optionally delete from Cloudinary
  // const publicId = extractPublicId(result.rows[0].file_url);
  // await cloudinary.uploader.destroy(publicId);

  res.json({ message: 'Certificate deleted' });
});

module.exports = router;
