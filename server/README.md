# Aura Studio — Backend Server

Node.js + Express + SQLite + Socket.IO

## Quick start

```bash
# 1. Enter the server folder
cd server

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Edit .env if you want a custom port, session secret, or admin credentials.

# 4. Start the development server (auto-restarts on file changes)
npm run dev

# Or start without nodemon:
npm start
```

The server starts on **http://localhost:4000** by default.

Verify it is running:

```
GET http://localhost:4000/api/health
```

Expected response: `{ "status": "ok", "time": "..." }`

---

## API reference

### Authentication

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/auth/staff/login` | `{ stylistId, pin }` | Log a stylist in (4-digit PIN) |
| POST | `/api/auth/staff/logout` | — | Log out |
| GET | `/api/auth/staff/me` | — | Current session info |
| POST | `/api/auth/admin/login` | `{ username, password }` | Admin login |
| POST | `/api/auth/admin/logout` | — | Admin logout |

### Queue

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/queue/join` | Public | Register a new customer |
| GET | `/api/queue` | Public | Full queue snapshot for today |
| GET | `/api/queue/token/:id` | Public | Single token status (UUID) |
| POST | `/api/queue/call-next` | Staff | Atomically call the next waiting customer |
| PUT | `/api/queue/token/:id/status` | Staff | Transition a token's status |
| DELETE | `/api/queue/token/:id` | Public | Customer self-cancel |
| GET | `/api/queue/stats` | Staff | Daily statistics |

### Services

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/services` | Public | Active services |
| GET | `/api/services?all=1` | Admin | All services including inactive |
| POST | `/api/services` | Admin | Add a service |
| PUT | `/api/services/:id` | Admin | Update a service |
| PATCH | `/api/services/:id/toggle` | Admin | Enable/disable |

### Stylists

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/stylists` | Public | Active stylists |
| POST | `/api/stylists` | Admin | Add a stylist |
| PUT | `/api/stylists/:id` | Admin | Update stylist info |
| PATCH | `/api/stylists/:id/pin` | Admin | Reset PIN |
| PATCH | `/api/stylists/:id/toggle` | Admin | Enable/disable |

---

## Socket.IO events

| Event | Direction | Payload | Trigger |
|-------|-----------|---------|---------|
| `queue:updated` | Server → all clients | `{ snapshot: TrackingToken[] }` | Any queue state change |
| `track:join` | Client → Server | `tokenId` | Customer opens tracking page |
| `track:leave` | Client → Server | `tokenId` | Customer leaves tracking page |

---

## Database

SQLite file is created at `server/data/aura.db` on first run. The file is excluded from git via `.gitignore`.

### Tables
- `services` — service catalogue
- `stylists` — stylist accounts (PINs are bcrypt-hashed)
- `admin` — single admin account
- `tokens` — queue records
- `daily_counters` — per-day token label counter (resets at midnight)

### Default credentials after first run
- **Admin**: `admin` / `admin1234` (change via `/api/auth/admin/change-password`)
- **Stylists**: PIN `1234` for all three sample stylists (change via admin panel)

---

## Token status transitions

```
waiting → called → in_service → completed
called  → waiting   (return to queue)
waiting | called → no_show | cancelled
```
