/**
 * routes/auth.js — Staff PIN login + Admin login/logout
 */

const express    = require('express')
const router     = express.Router()
const bcrypt     = require('bcryptjs')
const rateLimit  = require('express-rate-limit')
const db         = require('../db')
const { requireAdmin } = require('../middleware/auth')

const MAX_FAIL    = 5
const LOCKOUT_MIN = 10

// Rate limiter: 10 attempts per minute per IP (outer limit before account lock)
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait a minute.' },
})

// ── POST /api/auth/staff/login ────────────────────────────────────────────────
router.post('/staff/login', loginLimiter, (req, res) => {
  const { stylistId, pin } = req.body
  if (!stylistId || !pin) {
    return res.status(400).json({ error: 'stylistId and pin are required.' })
  }

  const stylist = db.prepare('SELECT * FROM stylists WHERE id = ? AND active = 1').get(stylistId)
  if (!stylist) return res.status(401).json({ error: 'Invalid credentials.' })

  // Check lockout
  if (stylist.locked_until) {
    const lockedUntil = new Date(stylist.locked_until)
    if (new Date() < lockedUntil) {
      const remaining = Math.ceil((lockedUntil - new Date()) / 60000)
      return res.status(429).json({
        error: `Account locked. Try again in ${remaining} minute${remaining > 1 ? 's' : ''}.`
      })
    }
  }

  const valid = bcrypt.compareSync(String(pin), stylist.pin_hash)
  if (!valid) {
    const newFail = stylist.fail_count + 1
    if (newFail >= MAX_FAIL) {
      const until = new Date(Date.now() + LOCKOUT_MIN * 60000).toISOString()
      db.prepare('UPDATE stylists SET fail_count = ?, locked_until = ? WHERE id = ?')
        .run(newFail, until, stylistId)
      return res.status(429).json({
        error: `Too many failed attempts. Account locked for ${LOCKOUT_MIN} minutes.`
      })
    }
    db.prepare('UPDATE stylists SET fail_count = ?, locked_until = NULL WHERE id = ?')
      .run(newFail, stylistId)
    return res.status(401).json({
      error: `Incorrect PIN. ${MAX_FAIL - newFail} attempt${MAX_FAIL - newFail !== 1 ? 's' : ''} remaining.`
    })
  }

  // Success
  db.prepare('UPDATE stylists SET fail_count = 0, locked_until = NULL WHERE id = ?').run(stylistId)
  req.session.stylistId   = stylist.id
  req.session.stylistName = stylist.name
  return res.json({
    ok: true,
    stylist: { id: stylist.id, name: stylist.name, role: stylist.role }
  })
})

// ── POST /api/auth/staff/logout ───────────────────────────────────────────────
router.post('/staff/logout', (req, res) => {
  req.session.destroy()
  res.json({ ok: true })
})

// ── GET /api/auth/staff/me ────────────────────────────────────────────────────
router.get('/staff/me', (req, res) => {
  if (!req.session.stylistId) return res.status(401).json({ error: 'Not logged in.' })
  return res.json({ stylistId: req.session.stylistId, stylistName: req.session.stylistName })
})

// ── POST /api/auth/admin/login ────────────────────────────────────────────────
router.post('/admin/login', loginLimiter, (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required.' })
  }

  const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(username)
  if (!admin) return res.status(401).json({ error: 'Invalid credentials.' })

  if (admin.locked_until) {
    const lockedUntil = new Date(admin.locked_until)
    if (new Date() < lockedUntil) {
      return res.status(429).json({ error: 'Account temporarily locked.' })
    }
  }

  const valid = bcrypt.compareSync(password, admin.password_hash)
  if (!valid) {
    const newFail = admin.fail_count + 1
    const updateLock = newFail >= MAX_FAIL
      ? db.prepare('UPDATE admin SET fail_count = ?, locked_until = ? WHERE id = ?')
            .run(newFail, new Date(Date.now() + LOCKOUT_MIN * 60000).toISOString(), 'admin')
      : db.prepare('UPDATE admin SET fail_count = ? WHERE id = ?').run(newFail, 'admin')
    return res.status(401).json({ error: 'Invalid credentials.' })
  }

  db.prepare('UPDATE admin SET fail_count = 0, locked_until = NULL WHERE id = ?').run('admin')
  req.session.isAdmin = true
  return res.json({ ok: true })
})


// ── GET /api/auth/admin/me ────────────────────────────────────────────────────
router.get('/admin/me', requireAdmin, (req, res) => {
  return res.json({ ok: true })
})
// ── POST /api/auth/admin/logout ───────────────────────────────────────────────
router.post('/admin/logout', (req, res) => {
  req.session.destroy()
  res.json({ ok: true })
})

// ── POST /api/auth/admin/change-password  (admin only) ───────────────────────
router.post('/admin/change-password', requireAdmin, (req, res) => {
  const { newPassword } = req.body
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' })
  }
  const hash = require('bcryptjs').hashSync(newPassword, 12)
  db.prepare('UPDATE admin SET password_hash = ? WHERE id = ?').run(hash, 'admin')
  return res.json({ ok: true })
})

module.exports = router
