/**
 * routes/stylists.js — Stylist management (public list, admin write)
 */

const express  = require('express')
const router   = express.Router()
const bcrypt   = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const db       = require('../db')
const { requireAdmin } = require('../middleware/auth')

// ── GET /api/stylists  (public – names and IDs only) ─────────────────────────
router.get('/', (req, res) => {
  const includeInactive = req.query.all === '1' && req.session?.isAdmin
  const rows = includeInactive
    ? db.prepare('SELECT id, name, role, avatar_initials, active FROM stylists ORDER BY name').all()
    : db.prepare('SELECT id, name, role, avatar_initials, active FROM stylists WHERE active = 1 ORDER BY name').all()
  return res.json(rows.map(formatStylist))
})

// ── POST /api/stylists  (admin only) ─────────────────────────────────────────
router.post('/', requireAdmin, (req, res) => {
  const { name, role, pin, avatar_initials } = req.body
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required.' })
  if (!role || !role.trim()) return res.status(400).json({ error: 'role is required.' })
  if (!pin || !/^\d{4}$/.test(String(pin))) {
    return res.status(400).json({ error: 'pin must be exactly 4 digits.' })
  }

  const initials = (avatar_initials || name.trim().split(' ').map(w => w[0]).join('').toUpperCase()).slice(0, 3)
  const id       = uuidv4()
  const pinHash  = bcrypt.hashSync(String(pin), 10)

  db.prepare(`
    INSERT INTO stylists (id, name, role, pin_hash, avatar_initials, active)
    VALUES (?,?,?,?,?,1)
  `).run(id, name.trim(), role.trim(), pinHash, initials)

  return res.status(201).json(formatStylist(
    db.prepare('SELECT id, name, role, avatar_initials, active FROM stylists WHERE id = ?').get(id)
  ))
})

// ── PUT /api/stylists/:id  (admin only) ───────────────────────────────────────
router.put('/:id', requireAdmin, (req, res) => {
  const sty = db.prepare('SELECT * FROM stylists WHERE id = ?').get(req.params.id)
  if (!sty) return res.status(404).json({ error: 'Stylist not found.' })

  const { name, role, avatar_initials, active } = req.body
  if (name && !name.trim()) return res.status(400).json({ error: 'name cannot be blank.' })

  db.prepare(`
    UPDATE stylists
    SET name=?, role=?, avatar_initials=?, active=?
    WHERE id=?
  `).run(
    (name || sty.name).trim(),
    (role || sty.role).trim(),
    avatar_initials || sty.avatar_initials,
    active !== undefined ? (active ? 1 : 0) : sty.active,
    req.params.id,
  )

  return res.json(formatStylist(
    db.prepare('SELECT id, name, role, avatar_initials, active FROM stylists WHERE id = ?').get(req.params.id)
  ))
})

// ── PATCH /api/stylists/:id/pin  (admin only) ─────────────────────────────────
router.patch('/:id/pin', requireAdmin, (req, res) => {
  const { pin } = req.body
  if (!pin || !/^\d{4}$/.test(String(pin))) {
    return res.status(400).json({ error: 'pin must be exactly 4 digits.' })
  }
  const hash = bcrypt.hashSync(String(pin), 10)
  const info = db.prepare('UPDATE stylists SET pin_hash = ?, fail_count = 0, locked_until = NULL WHERE id = ?')
    .run(hash, req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: 'Stylist not found.' })
  return res.json({ ok: true })
})

// ── PATCH /api/stylists/:id/toggle  (admin only) ──────────────────────────────
router.patch('/:id/toggle', requireAdmin, (req, res) => {
  const sty = db.prepare('SELECT * FROM stylists WHERE id = ?').get(req.params.id)
  if (!sty) return res.status(404).json({ error: 'Stylist not found.' })
  db.prepare('UPDATE stylists SET active = ? WHERE id = ?').run(sty.active ? 0 : 1, sty.id)
  return res.json(formatStylist(
    db.prepare('SELECT id, name, role, avatar_initials, active FROM stylists WHERE id = ?').get(sty.id)
  ))
})

function formatStylist(row) {
  return {
    id:             row.id,
    name:           row.name,
    role:           row.role,
    avatarInitials: row.avatar_initials,
    active:         row.active === 1,
  }
}

module.exports = router
