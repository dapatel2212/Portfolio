const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, isAdmin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(authenticate, isAdmin);

// ─────────────────────────────────────────
// GET /api/admin/dashboard — overview stats
// ─────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  const [users, certs, messages, views] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['user']),
    pool.query('SELECT COUNT(*) FROM certificates'),
    pool.query('SELECT COUNT(*) FROM messages'),
    pool.query('SELECT COALESCE(SUM(view_count),0) FROM profiles'),
  ]);

  const recentUsers = await pool.query(
    `SELECT u.id, u.name, u.email, u.is_active, u.created_at, p.slug, p.view_count
     FROM users u LEFT JOIN profiles p ON u.id = p.user_id
     WHERE u.role = 'user'
     ORDER BY u.created_at DESC LIMIT 10`
  );

  res.json({
    stats: {
      total_users: parseInt(users.rows[0].count),
      total_certificates: parseInt(certs.rows[0].count),
      total_messages: parseInt(messages.rows[0].count),
      total_views: parseInt(views.rows[0].coalesce),
    },
    recent_users: recentUsers.rows,
  });
});

// ─────────────────────────────────────────
// GET /api/admin/users — list all users (paginated)
// ─────────────────────────────────────────
router.get('/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
            p.slug, p.headline, p.view_count,
            COUNT(c.id) AS cert_count
     FROM users u
     LEFT JOIN profiles p ON u.id = p.user_id
     LEFT JOIN certificates c ON u.id = c.user_id
     WHERE (u.name ILIKE $1 OR u.email ILIKE $1)
     GROUP BY u.id, p.id
     ORDER BY u.created_at DESC
     LIMIT $2 OFFSET $3`,
    [`%${search}%`, limit, offset]
  );

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM users WHERE name ILIKE $1 OR email ILIKE $1',
    [`%${search}%`]
  );

  res.json({
    users: result.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    pages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
  });
});

// ─────────────────────────────────────────
// PATCH /api/admin/users/:id/status — suspend or activate user
// ─────────────────────────────────────────
router.patch('/users/:id/status', async (req, res) => {
  const { is_active } = req.body;
  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active must be boolean' });
  }

  const result = await pool.query(
    'UPDATE users SET is_active = $1 WHERE id = $2 AND role != $3 RETURNING id, name, is_active',
    [is_active, req.params.id, 'admin']
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
  res.json(result.rows[0]);
});

// ─────────────────────────────────────────
// GET /api/admin/certificates — list all certificates (pending verification)
// ─────────────────────────────────────────
router.get('/certificates', async (req, res) => {
  const verified = req.query.verified; // 'true', 'false', or undefined = all
  const whereClause = verified !== undefined ? 'AND c.is_verified = $1' : '';
  const params = verified !== undefined ? [verified === 'true'] : [];

  const result = await pool.query(
    `SELECT c.*, u.name AS user_name, u.email AS user_email, p.slug
     FROM certificates c
     JOIN users u ON u.id = c.user_id
     LEFT JOIN profiles p ON p.user_id = u.id
     WHERE 1=1 ${whereClause}
     ORDER BY c.created_at DESC`,
    params
  );
  res.json(result.rows);
});

// ─────────────────────────────────────────
// PATCH /api/admin/certificates/:id/verify — verify or unverify a certificate
// ─────────────────────────────────────────
router.patch('/certificates/:id/verify', async (req, res) => {
  const { is_verified } = req.body;
  const result = await pool.query(
    'UPDATE certificates SET is_verified = $1 WHERE id = $2 RETURNING *',
    [is_verified, req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Certificate not found' });
  res.json(result.rows[0]);
});

// ─────────────────────────────────────────
// DELETE /api/admin/users/:id — delete a user and all their data
// ─────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  // CASCADE on foreign keys will delete profile, certs, projects, messages
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 AND role != $2 RETURNING id, name',
    [req.params.id, 'admin']
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
  res.json({ message: `User "${result.rows[0].name}" deleted` });
});

module.exports = router;
