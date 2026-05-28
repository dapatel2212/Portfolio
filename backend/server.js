require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Force redeploy - timestamp: 2026-05-28T06:51:00Z
const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/profile',      require('./routes/profile'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/projects',     require('./routes/projects'));
app.use('/api/contact',      require('./routes/contact'));
app.use('/api/admin',        require('./routes/admin'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────────┐
  │  🚀 Portfolio Platform API                  │
  │  Running at: http://localhost:${PORT}           │
  │  Environment: ${process.env.NODE_ENV || 'development'}              │
  └─────────────────────────────────────────────┘
  `);
});
