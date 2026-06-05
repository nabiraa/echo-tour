require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

const app = express();

// ── CONNECT DATABASE ──────────────────────────────────────────────────────────
connectDB();

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting — security best practice (also shows concurrency awareness)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter limit on ticket booking to prevent abuse
const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, error: 'Too many booking attempts. Please wait.' },
});
app.use('/api/tickets/book', bookingLimiter);

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use('/api/artists', require('./routes/artists'));
app.use('/api/venues', require('./routes/venues'));
app.use('/api/concerts', require('./routes/concerts'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/staff', require('./routes/staff'));

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ECHO Tour API is running 🎵', timestamp: new Date() });
});

// ── 404 HANDLER ───────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// ── START SERVER ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ECHO Tour API running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
