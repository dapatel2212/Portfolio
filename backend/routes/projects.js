const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { uploadProjectImage } = require('../config/cloudinary');

router.get('/', authenticate, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM projects WHERE user_id = $1 ORDER BY display_order ASC, created_at DESC',
    [req.user.id]
  );
  res.json(result.rows);
});

router.post('/', authenticate, uploadProjectImage.single('image'), async (req, res) => {
  const { title, description, live_url, github_url, tech_stack, display_order } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const image_url = req.file ? req.file.path : null;
  const techArray = tech_stack ? (Array.isArray(tech_stack) ? tech_stack : tech_stack.split(',').map(t => t.trim())) : [];

  const result = await pool.query(
    `INSERT INTO projects (user_id, title, description, live_url, github_url, image_url, tech_stack, display_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [req.user.id, title, description || null, live_url || null, github_url || null, image_url, techArray, display_order || 0]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', authenticate, uploadProjectImage.single('image'), async (req, res) => {
  const { title, description, live_url, github_url, tech_stack, display_order } = req.body;
  const image_url = req.file ? req.file.path : undefined;
  const techArray = tech_stack ? (Array.isArray(tech_stack) ? tech_stack : tech_stack.split(',').map(t => t.trim())) : undefined;

  const result = await pool.query(
    `UPDATE projects SET
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       live_url = COALESCE($3, live_url),
       github_url = COALESCE($4, github_url),
       image_url = COALESCE($5, image_url),
       tech_stack = COALESCE($6, tech_stack),
       display_order = COALESCE($7, display_order)
     WHERE id = $8 AND user_id = $9 RETURNING *`,
    [title, description, live_url, github_url, image_url, techArray, display_order, req.params.id, req.user.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Project not found' });
  res.json(result.rows[0]);
});

router.delete('/:id', authenticate, async (req, res) => {
  await pool.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
  res.json({ message: 'Project deleted' });
});

module.exports = router;
