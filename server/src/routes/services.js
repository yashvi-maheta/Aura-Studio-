/**
 * routes/services.js — Service catalogue (public read, admin write)
 */

const express  = require('express')
const router   = express.Router()
const { v4: uuidv4 } = require('uuid')
const db       = require('../db')
const { requireAdmin } = require('../middleware/auth')

// ── GET /api/services  (public) ───────────────────────────────────────────────
router.get('/', (req, res) => {
  const includeInactive = req.query.all === '1' && req.session?.isAdmin
  const rows = includeInactive
    ? db.prepare('SELECT * FROM services ORDER BY name').all()
    : db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY name').all()

  return res.json(rows.map(formatService))
})

// ── POST /api/services  (admin only) ─────────────────────────────────────────
router.post('/', requireAdmin, (req, res) => {
  const { name, description, price_inr, duration_min, popular } = req.body
  const err = validateService({ name, price_inr, duration_min })
  if (err) return res.status(400).json({ error: err })

  const id = uuidv4()
  db.prepare(`
    INSERT INTO services (id, name, description, price_inr, duration_min, popular, active)
    VALUES (?,?,?,?,?,?,1)
  `).run(id, name.trim(), (description || '').trim(),
         Number(price_inr), Number(duration_min), popular ? 1 : 0)

  return res.status(201).json(formatService(db.prepare('SELECT * FROM services WHERE id = ?').get(id)))
})

// ── PUT /api/services/:id  (admin only) ───────────────────────────────────────
router.put('/:id', requireAdmin, (req, res) => {
  const svc = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id)
  if (!svc) return res.status(404).json({ error: 'Service not found.' })

  const { name, description, price_inr, duration_min, popular, active } = req.body
  const err = validateService({ name, price_inr, duration_min })
  if (err) return res.status(400).json({ error: err })

  db.prepare(`
    UPDATE services
    SET name=?, description=?, price_inr=?, duration_min=?, popular=?, active=?
    WHERE id=?
  `).run(name.trim(), (description || '').trim(),
         Number(price_inr), Number(duration_min),
         popular ? 1 : 0, active !== undefined ? (active ? 1 : 0) : svc.active,
         req.params.id)

  return res.json(formatService(db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id)))
})

// ── PATCH /api/services/:id/toggle  (admin only) ──────────────────────────────
router.patch('/:id/toggle', requireAdmin, (req, res) => {
  const svc = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id)
  if (!svc) return res.status(404).json({ error: 'Service not found.' })
  db.prepare('UPDATE services SET active = ? WHERE id = ?').run(svc.active ? 0 : 1, svc.id)
  return res.json(formatService(db.prepare('SELECT * FROM services WHERE id = ?').get(svc.id)))
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validateService({ name, price_inr, duration_min }) {
  if (!name || !name.trim()) return 'name is required.'
  if (!Number.isInteger(Number(price_inr)) || Number(price_inr) <= 0)
    return 'price_inr must be a positive integer (whole rupees).'
  if (!Number.isInteger(Number(duration_min)) || Number(duration_min) <= 0)
    return 'duration_min must be a positive integer.'
  return null
}

function formatService(row) {
  return {
    id:           row.id,
    name:         row.name,
    description:  row.description,
    priceInr:     row.price_inr,
    durationMinutes: row.duration_min,
    popular:      row.popular === 1,
    active:       row.active  === 1,
  }
}

module.exports = router
