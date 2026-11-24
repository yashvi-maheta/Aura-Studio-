/**
 * index.js — Aura Studio API server entry point
 *
 * Starts Express + Socket.IO on the configured PORT.
 * Socket.IO is attached to the same HTTP server so both share one port.
 */

require('dotenv').config()

const express        = require('express')
const http           = require('http')
const { Server }     = require('socket.io')
const cors           = require('cors')
const session        = require('express-session')
const seed           = require('./seed')

// ─── App setup ────────────────────────────────────────────────────────────────

const app    = express()
const server = http.createServer(app)

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

// Socket.IO
const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, credentials: true },
})

// Make `io` available to route handlers via app.get('io')
app.set('io', io)

// ─── Express middleware ───────────────────────────────────────────────────────

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }))
app.use(express.json())
app.use(session({
  secret:            process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   false,   // set to true behind HTTPS in production
    maxAge:   8 * 60 * 60 * 1000,  // 8 hours
  },
}))

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth',     require('./routes/auth'))
app.use('/api/queue',    require('./routes/queue'))
app.use('/api/services', require('./routes/services'))
app.use('/api/stylists', require('./routes/stylists'))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// 404 for unmatched API routes
app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found.' }))

// ─── Socket.IO events ─────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[socket] client connected   id=${socket.id}`)

  // Customer joins their token's room to receive targeted updates
  socket.on('track:join', (tokenId) => {
    socket.join(`token:${tokenId}`)
    console.log(`[socket] ${socket.id} joined room token:${tokenId}`)
  })

  socket.on('track:leave', (tokenId) => {
    socket.leave(`token:${tokenId}`)
  })

  socket.on('disconnect', () => {
    console.log(`[socket] client disconnected id=${socket.id}`)
  })
})

// ─── Midnight reset ───────────────────────────────────────────────────────────
// Auto-cancel any remaining 'waiting' tokens at midnight so the next day starts clean.

function scheduleReset() {
  const now      = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 1, 0)                     // 00:00:01 next day
  const msUntilMidnight = midnight.getTime() - now.getTime()

  setTimeout(() => {
    const today = new Date().toISOString().slice(0, 10)
    // Use yesterday's date for the tokens we're closing out
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

    const db = require('./db')
    const { changes } = db.prepare(`
      UPDATE tokens SET status = 'cancelled', cancelled_reason = 'day_ended',
                        updated_at = datetime('now')
      WHERE queue_date = ? AND status = 'waiting'
    `).run(yesterday)

    if (changes > 0) {
      console.log(`[reset] Midnight reset: ${changes} waiting token(s) cancelled for ${yesterday}`)
      const { getQueueSnapshot } = require('./queue')
      io.emit('queue:updated', { snapshot: getQueueSnapshot(today) })
    }

    scheduleReset() // reschedule for next midnight
  }, msUntilMidnight)
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

seed()           // create admin + services + stylists if DB is empty
scheduleReset()  // schedule midnight queue reset

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`\n✔  Aura Studio server running on http://localhost:${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/api/health`)
  console.log(`   Client origin: ${CLIENT_ORIGIN}\n`)
})
