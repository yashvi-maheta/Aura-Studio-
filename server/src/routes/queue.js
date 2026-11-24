/**
 * routes/queue.js — Customer-facing and staff queue endpoints
 */

const express  = require('express')
const router   = express.Router()
const db       = require('../db')
const {
  joinQueue,
  callNext,
  transitionToken,
  getQueueSnapshot,
  getDailyStats,
} = require('../queue')
const { requireStaff } = require('../middleware/auth')

// Helper — broadcast the updated queue to all Socket.IO clients
function broadcast(req, snapshot) {
  req.app.get('io').emit('queue:updated', { snapshot })
}

// ── POST /api/queue/join ──────────────────────────────────────────────────────
router.post('/join', (req, res) => {
  const { customerName, phone, serviceId, stylistId } = req.body

  if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
    return res.status(400).json({ error: 'customerName is required.' })
  }
  if (!serviceId || typeof serviceId !== 'string') {
    return res.status(400).json({ error: 'serviceId is required.' })
  }

  try {
    const { token, snapshot } = joinQueue({ customerName, phone, serviceId, stylistId })
    broadcast(req, snapshot)
    return res.status(201).json({ token })
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})

// ── GET /api/queue ────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const date = req.query.date // optional YYYY-MM-DD
  try {
    const snapshot = getQueueSnapshot(date)
    return res.json({ snapshot })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── GET /api/queue/token/:id ──────────────────────────────────────────────────
router.get('/token/:id', (req, res) => {
  const row = db.prepare(`
    SELECT
      t.id, t.token_label, t.customer_name, t.status,
      t.position, t.cancelled_reason, t.created_at,
      s.name AS service_name, s.duration_min,
      st.name AS stylist_name,
      t.assigned_stylist_id
    FROM tokens t
    JOIN services s ON s.id = t.service_id
    LEFT JOIN stylists st ON st.id = t.assigned_stylist_id
    WHERE t.id = ?
  `).get(req.params.id)

  if (!row) return res.status(404).json({ error: 'Token not found.' })

  // Count waiting tokens ahead
  const aheadCount = row.status === 'waiting'
    ? db.prepare(`
        SELECT COUNT(*) AS n FROM tokens
        WHERE queue_date = (SELECT queue_date FROM tokens WHERE id = ?)
          AND status = 'waiting'
          AND position < ?
      `).get(req.params.id, row.position).n
    : 0

  return res.json({
    tokenId:              row.id,
    tokenLabel:           row.token_label,
    customerName:         row.customer_name,
    status:               row.status,
    position:             row.position,
    customersAhead:       aheadCount,
    estimatedWaitMinutes: 0,   // recalculated on the client via snapshot
    serviceName:          row.service_name,
    serviceDurationMinutes: row.duration_min,
    stylistName:          row.stylist_name ?? 'Any Available Stylist',
    assignedStylistId:    row.assigned_stylist_id ?? null,
    cancelledReason:      row.cancelled_reason ?? undefined,
    createdAt:            row.created_at,
  })
})

// ── POST /api/queue/call-next  (staff only) ───────────────────────────────────
router.post('/call-next', requireStaff, (req, res) => {
  try {
    const { calledTokenId, snapshot } = callNext(req.session.stylistId)
    broadcast(req, snapshot)
    return res.json({ calledTokenId, snapshot })
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})

// ── PUT /api/queue/token/:id/status  (staff only) ─────────────────────────────
router.put('/token/:id/status', requireStaff, (req, res) => {
  const { status, reason } = req.body
  const VALID = ['called','in_service','completed','no_show','cancelled','waiting']
  if (!VALID.includes(status)) {
    return res.status(400).json({ error: `Invalid status "${status}".` })
  }
  try {
    const { snapshot } = transitionToken(req.params.id, status, reason)
    broadcast(req, snapshot)
    return res.json({ snapshot })
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})

// ── DELETE /api/queue/token/:id  (customer self-cancel) ───────────────────────
router.delete('/token/:id', (req, res) => {
  try {
    const { snapshot } = transitionToken(req.params.id, 'cancelled', 'Customer cancelled')
    broadcast(req, snapshot)
    return res.json({ ok: true })
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})

// ── GET /api/queue/stats ──────────────────────────────────────────────────────
router.get('/stats', requireStaff, (req, res) => {
  try {
    const stats = getDailyStats(req.query.date)
    return res.json(stats)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

module.exports = router
