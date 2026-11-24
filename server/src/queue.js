/**
 * queue.js — Core queue business logic
 *
 * All database writes for the queue go through this module so the EWT
 * recalculation and Socket.IO broadcast happen in one place.
 */

const db   = require('./db')
const { v4: uuidv4 } = require('uuid')

// ─── Token label generation ───────────────────────────────────────────────────

/**
 * Returns the next token label for today, e.g. "A-01".
 * Uses a SQLite transaction so concurrent calls never produce duplicate numbers.
 * Resets to A-01 each calendar day.
 */
function nextTokenLabel() {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const result = db.transaction(() => {
    db.prepare(`
      INSERT INTO daily_counters (date, counter)
      VALUES (?, 1)
      ON CONFLICT(date) DO UPDATE SET counter = counter + 1
    `).run(today)

    const { counter } = db.prepare(
      'SELECT counter FROM daily_counters WHERE date = ?'
    ).get(today)

    return counter
  })()

  if (result > 99) throw new Error('Daily queue limit of 99 tokens reached.')
  return `A-${String(result).padStart(2, '0')}`
}

// ─── EWT calculation ──────────────────────────────────────────────────────────

/**
 * Calculates estimated wait time (minutes) for a customer at a given position.
 *
 * Algorithm (from docs/01-brief.md §4.3):
 *   Build a slot array — one slot per active stylist, initialised to the
 *   remaining service time for busy stylists and 0 for available ones.
 *   Walk through the W customers ahead, assigning each to the earliest-free slot.
 *   EWT = min(slots) after the simulation.
 */
function calculateEWT(customersAhead, busyStylists, availableStylists, avgDurationMin) {
  if (availableStylists + busyStylists === 0) return null // no staff logged in

  const slots = [
    ...Array(availableStylists).fill(0),
    ...busyStylists.map(s => Math.max(0, s.remainingMinutes))
  ]
  slots.sort((a, b) => a - b)

  for (let i = 0; i < customersAhead; i++) {
    const minIdx = slots.indexOf(Math.min(...slots))
    slots[minIdx] += avgDurationMin
  }

  const raw = Math.max(0, Math.min(...slots))
  return Math.ceil(raw / 5) * 5 // round up to nearest 5 min
}

// ─── Recalculate all waiting positions + EWT ──────────────────────────────────

function recalculateQueue(today) {
  const qDate = today || new Date().toISOString().slice(0, 10)

  const waitingTokens = db.prepare(`
    SELECT t.id, t.position, s.duration_min
    FROM tokens t
    JOIN services s ON s.id = t.service_id
    WHERE t.queue_date = ? AND t.status = 'waiting'
    ORDER BY t.position ASC, t.created_at ASC
  `).all(qDate)

  const inServiceTokens = db.prepare(`
    SELECT t.created_at, t.updated_at, s.duration_min
    FROM tokens t
    JOIN services s ON s.id = t.service_id
    WHERE t.queue_date = ? AND t.status = 'in_service'
  `).all(qDate)

  // Calculate remaining service time for each busy stylist
  const now = Date.now()
  const busyStylists = inServiceTokens.map(t => {
    const startedAt = new Date(t.updated_at).getTime()
    const elapsedMin = (now - startedAt) / 60000
    return { remainingMinutes: Math.max(0, t.duration_min - elapsedMin) }
  })

  const avgDuration = db.prepare(`
    SELECT AVG(duration_min) AS avg FROM services WHERE active = 1
  `).get().avg || 30

  const totalStylists    = db.prepare('SELECT COUNT(*) AS n FROM stylists WHERE active = 1').get().n
  const availableStylists = Math.max(0, totalStylists - busyStylists.length)

  const updatePosition = db.prepare(`
    UPDATE tokens SET position = ?, updated_at = datetime('now') WHERE id = ?
  `)

  const updateAll = db.transaction(() => {
    waitingTokens.forEach((t, idx) => {
      updatePosition.run(idx + 1, t.id)
    })
  })
  updateAll()

  // Build EWT map keyed by position
  const ewtByPosition = {}
  waitingTokens.forEach((_, idx) => {
    const position = idx + 1
    const ahead    = idx
    const ewt      = calculateEWT(ahead, busyStylists, availableStylists, avgDuration)
    ewtByPosition[position] = ewt
  })

  return ewtByPosition
}

// ─── Full queue snapshot (for broadcast + API response) ───────────────────────

function getQueueSnapshot(today) {
  const qDate = today || new Date().toISOString().slice(0, 10)

  const tokens = db.prepare(`
    SELECT
      t.id,
      t.token_label,
      t.customer_name,
      t.phone,
      t.status,
      t.position,
      t.cancelled_reason,
      t.created_at,
      t.updated_at,
      s.id      AS service_id,
      s.name    AS service_name,
      s.duration_min,
      s.price_inr,
      st.id     AS assigned_stylist_id,
      st.name   AS stylist_name
    FROM tokens t
    JOIN services s ON s.id = t.service_id
    LEFT JOIN stylists st ON st.id = t.assigned_stylist_id
    WHERE t.queue_date = ?
    ORDER BY
      CASE t.status
        WHEN 'waiting'    THEN 0
        WHEN 'called'     THEN 0
        WHEN 'in_service' THEN 0
        ELSE 1
      END,
      t.position ASC,
      t.created_at ASC
  `).all(qDate)

  // Recalculate positions + EWT fresh
  const ewtMap = recalculateQueue(qDate)

  return tokens.map(t => ({
    tokenId:              t.id,
    tokenLabel:           t.token_label,
    customerName:         t.customer_name,
    status:               t.status,
    position:             t.position,
    customersAhead:       Math.max(0, t.position - 1),
    estimatedWaitMinutes: ewtMap[t.position] ?? 0,
    serviceName:          t.service_name,
    serviceDurationMinutes: t.duration_min,
    priceInr:             t.price_inr,
    serviceId:            t.service_id,
    stylistName:          t.stylist_name ?? 'Any Available Stylist',
    assignedStylistId:    t.assigned_stylist_id ?? null,
    cancelledReason:      t.cancelled_reason ?? undefined,
    createdAt:            t.created_at,
  }))
}

// ─── Join queue ───────────────────────────────────────────────────────────────

function joinQueue({ customerName, phone, serviceId, stylistId }) {
  const service = db.prepare('SELECT * FROM services WHERE id = ? AND active = 1').get(serviceId)
  if (!service) throw new Error('Service not found or inactive.')

  if (stylistId) {
    const stylist = db.prepare('SELECT * FROM stylists WHERE id = ? AND active = 1').get(stylistId)
    if (!stylist) throw new Error('Stylist not found or inactive.')
  }

  const today      = new Date().toISOString().slice(0, 10)
  const tokenLabel = nextTokenLabel()
  const tokenId    = uuidv4()

  // Position = number of waiting tokens today + 1
  const { n } = db.prepare(`
    SELECT COUNT(*) AS n FROM tokens
    WHERE queue_date = ? AND status = 'waiting'
  `).get(today)

  db.prepare(`
    INSERT INTO tokens
      (id, token_label, customer_name, phone, service_id, stylist_id,
       assigned_stylist_id, status, queue_date, position)
    VALUES (?,?,?,?,?,?,?,  'waiting', ?, ?)
  `).run(tokenId, tokenLabel, customerName.trim(), (phone || '').trim(),
         serviceId, stylistId || null, stylistId || null, today, n + 1)

  recalculateQueue(today)
  const snapshot = getQueueSnapshot(today)
  const mine     = snapshot.find(t => t.tokenId === tokenId)

  return { token: mine, snapshot }
}

// ─── Call next ────────────────────────────────────────────────────────────────

/**
 * Atomically assigns the next waiting customer to a stylist.
 * Uses a SQLite transaction with a row-level UPDATE so two concurrent
 * "Call Next" presses never claim the same customer.
 */
function callNext(stylistId) {
  const stylist = db.prepare('SELECT * FROM stylists WHERE id = ? AND active = 1').get(stylistId)
  if (!stylist) throw new Error('Stylist not found.')

  // Check the stylist doesn't already have an active token
  const existing = db.prepare(`
    SELECT id, token_label FROM tokens
    WHERE assigned_stylist_id = ? AND status IN ('called','in_service')
  `).get(stylistId)
  if (existing) {
    throw new Error(`You already have customer ${existing.token_label} active.`)
  }

  const today  = new Date().toISOString().slice(0, 10)
  let calledId = null

  db.transaction(() => {
    // Pick the next waiting token (lowest position) and claim it atomically
    const next = db.prepare(`
      SELECT id FROM tokens
      WHERE queue_date = ? AND status = 'waiting'
      ORDER BY position ASC, created_at ASC
      LIMIT 1
    `).get(today)

    if (!next) return

    db.prepare(`
      UPDATE tokens
      SET status = 'called',
          assigned_stylist_id = ?,
          position = 0,
          updated_at = datetime('now')
      WHERE id = ? AND status = 'waiting'
    `).run(stylistId, next.id)

    calledId = next.id
  })()

  if (!calledId) throw new Error('No customers are currently waiting.')

  recalculateQueue(today)
  return { calledTokenId: calledId, snapshot: getQueueSnapshot(today) }
}

// ─── Transition token status ──────────────────────────────────────────────────

const ALLOWED_TRANSITIONS = {
  waiting:    ['called', 'cancelled', 'no_show'],
  called:     ['in_service', 'waiting', 'no_show', 'cancelled'],
  in_service: ['completed', 'no_show'],
}

function transitionToken(tokenId, newStatus, reason) {
  const token = db.prepare('SELECT * FROM tokens WHERE id = ?').get(tokenId)
  if (!token) throw new Error('Token not found.')

  const allowed = ALLOWED_TRANSITIONS[token.status] || []
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot move from ${token.status} to ${newStatus}.`)
  }

  db.prepare(`
    UPDATE tokens
    SET status = ?,
        cancelled_reason = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(newStatus, reason || null, tokenId)

  const today = new Date().toISOString().slice(0, 10)
  recalculateQueue(today)
  return { snapshot: getQueueSnapshot(today) }
}

// ─── Daily stats ──────────────────────────────────────────────────────────────

function getDailyStats(date) {
  const qDate = date || new Date().toISOString().slice(0, 10)

  const row = db.prepare(`
    SELECT
      COUNT(*)                                             AS total,
      SUM(CASE WHEN status = 'waiting'    THEN 1 ELSE 0 END) AS waiting,
      SUM(CASE WHEN status = 'called'     THEN 1 ELSE 0 END) AS called,
      SUM(CASE WHEN status = 'in_service' THEN 1 ELSE 0 END) AS in_service,
      SUM(CASE WHEN status = 'completed'  THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN status = 'no_show'    THEN 1 ELSE 0 END) AS no_show,
      SUM(CASE WHEN status = 'cancelled'  THEN 1 ELSE 0 END) AS cancelled
    FROM tokens WHERE queue_date = ?
  `).get(qDate)

  const revenue = db.prepare(`
    SELECT COALESCE(SUM(s.price_inr), 0) AS total_inr
    FROM tokens t
    JOIN services s ON s.id = t.service_id
    WHERE t.queue_date = ? AND t.status = 'completed'
  `).get(qDate)

  return { date: qDate, ...row, revenueInr: revenue.total_inr }
}

module.exports = {
  joinQueue,
  callNext,
  transitionToken,
  getQueueSnapshot,
  getDailyStats,
  recalculateQueue,
}
