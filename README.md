# Aura Studio — Salon Queue Management System

**Live application:** https://aura-studio-lake.vercel.app

**GitHub repository:** https://github.com/yashvi-maheta/Aura-Studio-

---

## Project overview

Aura Studio is a full-stack walk-in salon queue management system built as an MSc IT Vibe Coding project. Customers explore salon services, join a digital queue, receive a unique token and track their position in real time. Staff manage the waiting queue from a live dashboard. An admin maintains services, stylists and views daily statistics.

The application replaces paper tokens and verbal queue management with a web-based system that works on any device — no app download required.

---

## Deployment

| Layer | Platform | URL |
|-------|----------|-----|
| Frontend | Vercel | https://aura-studio-lake.vercel.app |
| Backend | Render | Configured via `VITE_API_URL` environment variable |
| Database | SQLite (file on Render disk) | Managed by the backend |

> **Note:** The Render free tier does not provide persistent disk storage by default. SQLite data may not survive a Render service restart unless a persistent disk is configured. This is a known deployment limitation.

---

## Features

### Customer
- Browse active salon services with name, duration and price (INR)
- Join the walk-in queue by entering name, phone and selecting a service
- Optionally request a preferred stylist
- Receive a unique queue token (e.g. `A-01`) and a shareable tracking link
- Track real-time queue position and estimated wait time
- See live status updates — Waiting, Called, In Service, Completed

### Staff
- Secure PIN login (4-digit, rate-limited, bcrypt-hashed)
- View the full live waiting queue
- Call the next customer atomically (no double-assignment)
- Mark customers as Called → In Service → Completed or No Show
- Return a called customer to Waiting if needed
- Real-time dashboard updates via Socket.IO

### Admin
- Secure username/password login
- Daily statistics: total tokens, waiting, completed, no-shows, revenue
- Add, edit, enable and disable salon services
- Add, edit, enable and disable stylists
- View today's full queue with status filters

### Public display
- Full-screen now-serving display for a salon TV or tablet
- Shows current token, customer name, service and stylist
- Lists next 5 waiting customers
- Updates automatically via Socket.IO — no page refresh needed

---

## Technology stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Real-time (client) | socket.io-client v4 |
| Icons | Lucide React |
| Backend | Node.js, Express 4 |
| Database | SQLite (better-sqlite3) |
| Real-time (server) | Socket.IO v4 |
| Authentication | express-session, bcryptjs |
| Rate limiting | express-rate-limit |

---

## Project structure

```
Salon Queue Management Project/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── pages/           # HomePage, JoinPage, TrackPage, StaffPage, DisplayPage, AdminPage
│   │   ├── components/      # Shared UI components, home sections, track/join components
│   │   ├── data/            # API types, mock data helpers (formatPrice, formatDuration)
│   │   └── lib/             # api.ts (fetch wrapper), socket.ts (Socket.IO client), cn.ts
│   ├── .env.example
│   └── package.json
├── server/                  # Node.js + Express backend
│   ├── src/
│   │   ├── index.js         # Server entry point
│   │   ├── db.js            # SQLite setup and schema
│   │   ├── queue.js         # Core queue business logic and EWT calculation
│   │   ├── seed.js          # First-run database seeding
│   │   ├── middleware/
│   │   │   └── auth.js      # requireStaff, requireAdmin middleware
│   │   └── routes/
│   │       ├── auth.js      # Staff PIN login, admin login/logout
│   │       ├── queue.js     # Queue endpoints
│   │       ├── services.js  # Service catalogue CRUD
│   │       └── stylists.js  # Stylist management CRUD
│   ├── data/                # SQLite database file created here on first run
│   ├── .env.example
│   └── package.json
├── docs/                    # Project documentation
│   ├── 01-brief.md
│   ├── 02-screens.md
│   ├── 03-flows-rules.md
│   └── 04-design-system.md
├── AGENTS.md                # Instructions for AI coding agents
└── prompts.md               # Kiro prompt history
```

---

## Application routes

| URL | Description | Auth required |
|-----|-------------|---------------|
| `/` | Customer home page and services | None |
| `/join` | Queue registration | None |
| `/track` | Token lookup form | None |
| `/track/:id` | Customer queue tracking | None (UUID required) |
| `/staff` | Staff queue dashboard | Staff PIN |
| `/display` | Now Serving public display | None |
| `/admin` | Admin dashboard | Admin credentials |

---

## Local setup

### Prerequisites
- Node.js 18 or later
- npm

### 1. Clone the repository

```bash
git clone https://github.com/yashvi-maheta/Aura-Studio-
cd "Aura Studio" # or the folder name after cloning
```

### 2. Set up the backend

```bash
cd server
npm install
copy .env.example .env     # Windows
# cp .env.example .env     # macOS / Linux
```

Edit `.env` with your values (see Environment variables below), then:

```bash
npm run dev
```

The server starts on **http://localhost:4000**.

Verify: `GET http://localhost:4000/api/health` → `{ "status": "ok" }`

The database is created automatically at `server/data/aura.db` on first run. Services, stylists and an admin account are seeded if the database is empty.

### 3. Set up the frontend

Open a second terminal:

```bash
cd client
npm install
copy .env.example .env     # Windows
# cp .env.example .env     # macOS / Linux
npm run dev
```

The frontend starts on **http://localhost:5173**.

The Vite dev server proxies `/api` and `/socket.io` requests to `http://localhost:4000` automatically — no CORS configuration needed for local development.

### 4. Production build (frontend)

```bash
cd client
npm run build
```

Output is in `client/dist/`. On Vercel this build runs automatically on deploy.

---

## Environment variables

### Backend (`server/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `4000` | Port the server listens on |
| `SESSION_SECRET` | **Yes** | `dev_secret_change_me` | Secret for signing session cookies — change to a long random string in production |
| `ADMIN_USERNAME` | No | `admin` | Admin username seeded on first run |
| `ADMIN_PASSWORD` | No | `admin1234` | Admin password seeded on first run — stored as a bcrypt hash |
| `CLIENT_ORIGIN` | **Yes (production)** | `http://localhost:5173` | Frontend origin allowed by CORS — set to your Vercel URL in production |
| `DB_DIR` | No | `server/data` | Directory for the SQLite database file — set to a persistent disk path on Render |

> **Security:** Never commit `.env` to version control. The file is listed in `.gitignore`. `SESSION_SECRET` must be a long random string in any shared or deployed environment.

### Frontend (`client/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | **Yes (production)** | `http://localhost:4000` | Full URL of the backend server — set to your Render service URL in production |

In development, `VITE_API_URL` can be left as `http://localhost:4000`; the Vite proxy handles requests automatically. In production on Vercel, set this to the deployed Render backend URL in the Vercel project environment variables.

---

## Default login credentials

These credentials are seeded automatically on first run from the `.env` values.

### Admin
- **Username:** `admin` (or the value of `ADMIN_USERNAME` in `.env`)
- **Password:** `admin1234` (or the value of `ADMIN_PASSWORD` in `.env`)
- **URL:** `/admin`

> Change the admin password in production via `POST /api/auth/admin/change-password` after first login, or set a strong password in `.env` before first run.

### Staff stylists
Three sample stylists are seeded with **PIN: `1234`** each.

| Name | Role |
|------|------|
| Elena Vasquez | Senior Colourist |
| Marcus Osei | Master Stylist |
| Priya Nair | Wellness & Treatment Specialist |

Staff log in at `/staff` by selecting their name and entering their PIN. PINs can be reset via `PATCH /api/stylists/:id/pin` (admin authentication required).

> These are test credentials for a college project. In a real deployment, PINs must be changed and the admin password must be replaced before the system goes live.

---

## API reference (summary)

Full details in `docs/03-flows-rules.md` and `server/README.md`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | None | Health check |
| GET | `/api/services` | None | Active services |
| GET | `/api/stylists` | None | Active stylists |
| POST | `/api/queue/join` | None | Register customer |
| GET | `/api/queue` | None | Today's queue snapshot |
| GET | `/api/queue/token/:id` | None | Single token status |
| POST | `/api/queue/call-next` | Staff | Call next customer |
| PUT | `/api/queue/token/:id/status` | Staff | Transition token status |
| DELETE | `/api/queue/token/:id` | None | Customer self-cancel |
| GET | `/api/queue/stats` | Staff | Daily statistics |
| POST | `/api/auth/staff/login` | — | Staff PIN login |
| POST | `/api/auth/admin/login` | — | Admin login |

---

## Known limitations

- **SQLite persistence on Render:** Data is lost on service restart unless a persistent disk (`DB_DIR`) is configured. This is a Render free-tier constraint.
- **Customer self-cancel:** The backend `DELETE /api/queue/token/:id` endpoint exists, but no cancel button is currently shown on the customer tracking page.
- **PIN reset UI:** The backend `PATCH /api/stylists/:id/pin` endpoint exists, but pin reset is not exposed in the admin dashboard UI.
- **Staff synchronisation:** Queue updates propagate via Socket.IO. If a client disconnects and reconnects, it re-fetches the queue on mount. Brief state inconsistency is possible in the reconnection window.
- **No appointment booking:** The system is walk-in only. Pre-scheduled appointments are out of scope.
- **Single salon:** The system is not multi-tenant.
- **Daily token limit:** 99 tokens per day (`A-01` to `A-99`).

---

## Documentation

| File | Contents |
|------|----------|
| `docs/01-brief.md` | Problem statement, users, features, scope |
| `docs/02-screens.md` | All six screens — layouts, states, responsive behaviour |
| `docs/03-flows-rules.md` | Queue flows, business rules, testing checklist |
| `docs/04-design-system.md` | Visual identity, tokens, components |
| `AGENTS.md` | Instructions for AI coding agents |
| `prompts.md` | Kiro prompt history |
