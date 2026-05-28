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
console.log('Loading routes...');
try {
  const authRouter = require('./routes/auth');
  console.log('Auth router loaded:', !!authRouter);
  app.use('/api/auth', authRouter);
  console.log('Auth route mounted');
} catch (err) {
  console.error('Error loading auth routes:', err);
}
try {
  const profileRouter = require('./routes/profile');
  app.use('/api/profile', profileRouter);
  console.log('Profile route mounted');
} catch (err) {
  console.error('Error loading profile routes:', err);
}
try {
  const certificatesRouter = require('./routes/certificates');
  app.use('/api/certificates', certificatesRouter);
  console.log('Certificates route mounted');
} catch (err) {
  console.error('Error loading certificates routes:', err);
}
try {
  const projectsRouter = require('./routes/projects');
  app.use('/api/projects', projectsRouter);
  console.log('Projects route mounted');
} catch (err) {
  console.error('Error loading projects routes:', err);
}
try {
  const contactRouter = require('./routes/contact');
  app.use('/api/contact', contactRouter);
  console.log('Contact route mounted');
} catch (err) {
  console.error('Error loading contact routes:', err);
}
try {
  const adminRouter = require('./routes/admin');
  app.use('/api/admin', adminRouter);
  console.log('Admin route mounted');
} catch (err) {
  console.error('Error loading admin routes:', err);
}

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
