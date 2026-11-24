# 01 — Project Brief

## Aura Studio — Salon Queue Management System

**Version:** 1.2
**Last updated:** 2025
**Project type:** MSc IT — Vibe Coding Project

---

## 1. The Problem

Walk-in salons lose customers and revenue to two compounding problems.

**Customers** arrive, see a full waiting area, have no idea how long the wait will be, and leave. Those who stay sit idle with no feedback on their position or expected wait. The anxiety of "am I next?" degrades the experience before the service even begins.

**Staff** manage the queue verbally or with paper tokens, which breaks down under busy conditions. There is no single source of truth: a stylist finishing a service must track down who is next, customers miss their turn when they step away, and no one has numbers to review at the end of the day.

---

## 2. The Solution

Aura Studio is a web-based queue management system with three distinct user roles: **Customer**, **Staff**, and **Admin**.

- A customer visits the site, browses services, and joins the digital queue with a few taps. They receive a unique token and a live view of their position and estimated wait time.
- Staff members (stylists) each work from a shared dashboard. They pull the next waiting customer from the central queue and serve them independently. Multiple stylists can serve customers simultaneously.
- An admin maintains the service catalogue, manages stylist accounts, and reviews daily business metrics.

A public display screen (intended for a wall-mounted tablet or TV in the salon) shows who is currently being served, without requiring any login.

---

## 3. Users

### 3.1 Customer
A walk-in customer arriving at the salon. They may use their own phone or a kiosk tablet provided by the salon. They are assumed to be non-technical and must face minimum friction: no account required, no app download.

**Goals:**
- Know how long they will wait.
- Keep their place in the queue without sitting in the waiting area the whole time.
- See a clear visual cue when they are about to be called.

### 3.2 Staff (Stylist)
A salon employee logged in on the shared staff tablet or their own device. Each stylist has their own PIN-protected account. Multiple stylists are active at the same time during busy hours.

**Goals:**
- See the full central waiting queue in real time.
- Call the next available customer and claim them so no two stylists call the same person.
- Record which service is being performed and mark it complete cleanly.
- Handle no-shows and cancellations without breaking queue order.

### 3.3 Admin
The salon owner or manager. Accesses the admin panel from any device.

**Goals:**
- Keep the service catalogue and pricing accurate.
- Add, deactivate, or reassign stylists.
- Review today's completed services, revenue, and peak-time patterns.

---

## 4. Queue Architecture

### 4.1 Single Central Queue, Multiple Stylists

The system maintains **one central waiting queue** for the salon. Customers are not pre-assigned to a specific stylist when they join. Instead:

1. A customer joins the queue and waits in position order.
2. When a stylist finishes a service and is free, they tap **"Call Next"** on the staff dashboard.
3. The system assigns the **next waiting customer** (lowest queue position) to that stylist and moves the token to `serving` status.
4. That token is immediately locked to the calling stylist. No other stylist can claim it.
5. Multiple stylists can each have one customer in `serving` status simultaneously.

This model is simple to implement, fair to customers, and matches how most walk-in salons actually operate.

### 4.2 Stylist Availability States

A stylist's availability is derived from live queue data, not stored as a separate field.

| State | Meaning |
|-------|---------|
| `available` | No token in `serving` status assigned to this stylist |
| `busy` | Exactly one token in `serving` status is assigned to this stylist |

A stylist becomes `available` the moment they mark their current service `completed` or `no_show`.

### 4.3 Estimated Wait Time Calculation

#### Overview

Estimated wait time (EWT) is recalculated on **every queue state change**: a customer joins, is called, completes a service, cancels, or is marked no-show. The result is broadcast to all connected clients immediately after recalculation.

Because service durations vary and stylists work at different speeds, an exact prediction is not possible. EWT is therefore a **labelled approximation**, displayed in the UI as *"approx. X min"*. The UI never presents it as a guaranteed time.

---

#### Inputs to the Calculation

| Symbol | Meaning | Source |
|--------|---------|--------|
| `S` | Total number of stylists currently logged in and active | Staff session data |
| `B` | Number of stylists currently `busy` (have a token in `serving` status) | Live queue |
| `A` | Number of stylists currently `available` (`A = S − B`) | Derived |
| `W` | Number of tokens in `waiting` status ahead of this customer in queue order | Live queue |
| `D_i` | Duration (minutes) of the service selected by the customer at position `i` | Services table |
| `D_avg` | Average duration of all currently active services | Services table |
| `elapsed_j` | Minutes already elapsed for busy stylist `j` (now − `serving_started_at`) | Token record |
| `D_serving_j` | Duration of the service being performed by busy stylist `j` | Token + services join |
| `remaining_j` | Estimated remaining time for busy stylist `j` = `max(0, D_serving_j − elapsed_j)` | Derived |

---

#### Step-by-Step Formula

**Step 1 — Remaining time for each busy stylist**

For each of the `B` busy stylists, compute how much time they likely have left:

```
remaining_j = max(0, D_serving_j − elapsed_j)   for j = 1 … B
```

If `D_serving_j` is unknown (service was deleted), substitute `D_avg`.

Sort these values ascending: `remaining[0] ≤ remaining[1] ≤ … ≤ remaining[B−1]`.

**Step 2 — Build a release schedule**

Model each stylist as a slot that becomes free at a known future time. Start with the `B` busy stylists' remaining times. Available stylists (`A`) contribute slots that are free right now (remaining time = 0).

```
slots = [0, 0, … (A times)] + [remaining_0, remaining_1, … remaining_{B-1}]
slots.sort()   // ascending
```

This gives `S` slots in total.

**Step 3 — Simulate the queue draining**

Walk through the `W` customers ahead, assigning each one to the earliest-free slot:

```
for i = 0 to W − 1:
    earliest_slot = index of minimum value in slots
    slots[earliest_slot] += D_i          // that slot is now busy for D_i more minutes
```

After this loop, every slot holds the time at which that stylist will next become free after clearing the W customers ahead.

**Step 4 — EWT for this customer**

```
EWT = min(slots)   // the earliest a stylist will be free after all W customers ahead are served
EWT = max(0, EWT)  // clamp to zero (never negative)
```

**Step 5 — Round and label**

```
EWT_display = ceil(EWT / 5) × 5   // round up to nearest 5 minutes
```

Display as: **"approx. `EWT_display` min"**

If `EWT_display` is 0, display: **"You're next!"** (and trigger the amber "almost up" banner if the customer is literally first in the waiting list).

---

#### Worked Example

Salon has **3 stylists**. Stylist A is busy with 8 min remaining, Stylist B is busy with 3 min remaining, Stylist C is available. Average service duration = 20 min.

Customer X is at position 4 (3 customers ahead: positions 1, 2, 3, all with 20-min services).

```
slots = [0, 3, 8]            // C=free, B=3min left, A=8min left

i=0 (customer ahead #1, D=20): earliest slot = index 0 (value 0)
  slots = [20, 3, 8]

i=1 (customer ahead #2, D=20): earliest slot = index 1 (value 3)
  slots = [20, 23, 8]

i=2 (customer ahead #3, D=20): earliest slot = index 2 (value 8)
  slots = [20, 23, 28]

EWT for customer X = min(slots) = 20 min
EWT_display = ceil(20/5) × 5 = 20 min
Displayed: "approx. 20 min"
```

---

#### Edge Cases

| Condition | Handling |
|-----------|---------|
| No stylists logged in | Display "Queue paused — no staff available" instead of a time |
| All stylists busy, no one waiting ahead | `EWT = min(remaining_j)` — the customer will be served when the first stylist is free |
| A service has been deleted after a customer joined | Substitute `D_avg` for that customer's duration |
| `D_avg` cannot be computed (no active services) | Use a hardcoded fallback of 20 minutes |
| Customer is first in queue and a stylist is available | `EWT = 0`; show "You're next!" |

---

#### Implementation Contract

The server-side function signature must match this logic exactly:

```ts
function calculateEWT(
  customersAhead: Array<{ serviceDuration: number }>,
  busyStylists: Array<{ remainingMinutes: number }>,
  availableStylists: number,
): number  // returns raw EWT in minutes (unrounded)
```

This function is called inside the `recalculateQueue()` procedure, which runs after every token state transition and emits a `queue:updated` Socket.IO event to all clients.

---

## 5. Main Features

### 5.1 Customer-Facing

| # | Feature | Notes |
|---|---------|-------|
| C1 | Browse services with name, duration, and price | No login required |
| C2 | Join the queue by selecting a service and entering a name | Phone number is optional |
| C3 | Receive a unique alphanumeric token (e.g. `A-07`) | Displayed prominently after joining |
| C4 | Shareable tracking URL (`/track/:tokenUUID`) | Uses an unguessable UUID; bookmark-friendly |
| C5 | Real-time queue position and estimated wait time on the tracking page | Updated via Socket.IO push |
| C6 | Visual status indicator: `waiting`, `you're next`, `now serving`, `done` | Colour-coded |
| C7 | Leave the queue voluntarily (cancel token) | Requires a confirmation step |

### 5.2 Staff-Facing

| # | Feature | Notes |
|---|---------|-------|
| S1 | PIN login (4-digit) per stylist account | Rate-limited; see Section 7 |
| S2 | View full central waiting queue sorted by position | Shows name, service, elapsed wait, token |
| S3 | "Call Next" — claims the next waiting customer and assigns them to this stylist | Atomic operation; prevents double-assignment |
| S4 | View own current customer (name, service, start time) | |
| S5 | Mark current service as `completed` | Frees stylist; EWT recalculated |
| S6 | Mark current customer as `no_show` | Frees stylist; token flagged |
| S7 | Cancel a waiting customer's token | Optional reason; EWT recalculated |
| S8 | View all stylists' current status (available / busy) in a sidebar | |

### 5.3 Admin-Facing

| # | Feature | Notes |
|---|---------|-------|
| A1 | Username + password login | Hashed password; see Section 7 |
| A2 | Create, edit, and deactivate services (name, price, duration in minutes) | Deactivated services hidden from customers |
| A3 | Create and deactivate stylist accounts; set or reset PIN | |
| A4 | Daily stats: tokens issued, completed, cancelled, no-shows, estimated revenue, average wait | |
| A5 | Filter stats by date | |
| A6 | View full token history for any selected day | |

### 5.4 System

| # | Feature | Notes |
|---|---------|-------|
| SY1 | Real-time queue updates pushed to all connected clients | Socket.IO; shared `queue` room |
| SY2 | Token generation with daily reset | Format `A-01` through `A-99`; counter resets at midnight |
| SY3 | EWT recalculated and broadcast on every queue state change | Uses the formula in Section 4.3 |
| SY4 | Public display screen auto-refreshes without login | Shows `serving` tokens only |
| SY5 | "You're next" indicator on tracking page | Triggered when the customer reaches position 1 |

---

## 6. Token Status State Machine

Each queue token moves through a strict set of statuses. No transition outside this list is valid.

```
         ┌─────────────────────────────────────────┐
         │                                         │
        join                                       │
         │                                         │
         ▼                                         │
     [ waiting ] ──── staff calls next ──► [ serving ] ──► [ completed ]
         │                                         │
         │                                         └──► [ no_show ]
         │
         └──── customer or staff cancels ──► [ cancelled ]
```

| Transition | Triggered by | Notes |
|-----------|-------------|-------|
| `waiting → serving` | Staff taps "Call Next" | Atomic; assigned to calling stylist |
| `serving → completed` | Staff taps "Complete" | Service revenue counted |
| `serving → no_show` | Staff taps "No Show" | Not counted as revenue |
| `waiting → cancelled` | Customer or staff cancels | EWT recalculated for all behind |

---

## 7. Security

Security is proportionate to a college project while reflecting real-world practices.

### 7.1 Staff PIN Login
- PINs are 4 digits, stored as a **bcrypt hash** (cost factor 10). Plain-text PINs are never stored.
- The PIN entry endpoint is **rate-limited**: maximum 5 failed attempts per stylist account per 10-minute window. After 5 failures the account is locked for 10 minutes.
- Staff sessions use a **signed HTTP-only session cookie** (express-session). Session expires after 8 hours.

### 7.2 Admin Login
- Admin uses **username + bcrypt-hashed password** (cost factor 12).
- Same rate limiting as staff (5 attempts / 10 minutes), applied per IP address.
- Admin session uses a separate signed HTTP-only cookie with an 8-hour expiry.
- Admin API routes (`/api/admin/*`) are protected by server-side session middleware; unauthenticated requests receive `401`.

### 7.3 Customer Tracking Privacy
- Tokens are identified by a **UUID v4**. The tracking URL is `/track/<uuid>`.
- `GET /api/token/:id` returns **only the data for that specific token**: position, status, service name, EWT. No other customer's data is exposed.
- UUIDs are never listed publicly and cannot be guessed by incrementing a counter.

### 7.4 General
- All secrets (session secret, admin seed credentials) live in a `.env` file excluded from version control via `.gitignore`.
- Input is validated server-side on all POST/PUT endpoints (name length, service ID existence, PIN format).
- All SQL queries use **parameterised statements**; no string concatenation in queries.

---

## 8. Notifications (In-App Only)

Paid third-party SMS services are **not included** in this version. Notifications are delivered through the existing Socket.IO connection and are visible only while the tracking page is open.

| Trigger | What the customer sees |
|---------|----------------------|
| Customer reaches position 1 (one person ahead or they are next) | Amber banner: "You're almost up — get ready!" |
| Token moves to `serving` | Green banner with pulse animation: "It's your turn! Please go to your stylist." |
| Token cancelled by staff | Red banner: "Your token has been cancelled." with reason if provided |

The tracking page displays a persistent note: *"Keep this page open to receive updates."*

**Future consideration (out of scope now):** Web Push Notifications via the browser Push API would allow background alerts without an SMS provider.

---

## 9. Out of Scope

| # | Excluded Feature | Reason |
|---|-----------------|--------|
| OOS1 | SMS or push notifications via paid APIs | Not suitable for initial version |
| OOS2 | Online appointment booking | Separate paradigm from walk-in queue |
| OOS3 | Customer accounts / loyalty programmes | Walk-ins are anonymous by design |
| OOS4 | Payment processing | Not a POS system |
| OOS5 | Multi-branch support | Single-salon deployment only |
| OOS6 | Native mobile app | Web app covers the use case |
| OOS7 | Staff-to-customer chat | |
| OOS8 | Inventory management | |
| OOS9 | Customer ratings or feedback | |
| OOS10 | Data export (CSV, PDF) | In-app stats only |
| OOS11 | Per-stylist queue assignment at join time | Customers join the central pool; stylists call next |

---

## 10. Assumptions and Constraints

- **One salon, one queue.** The system is not multi-tenant.
- **SQLite** is used for storage. The "Call Next" operation uses a single `UPDATE … WHERE status = 'waiting'` with `ORDER BY position LIMIT 1`, preventing double-assignment at the database level.
- **Single Node.js process.** Socket.IO operates in-process; no Redis adapter is needed.
- **Daily reset.** At midnight server time, any remaining `waiting` tokens are automatically moved to `cancelled` (reason: `day_ended`) and the token counter resets. Historical records are retained indefinitely.
- **All times stored in UTC**, displayed in the user's local browser timezone.
- **No stylist specialisation.** All stylists are assumed capable of all services.
- **Maximum 99 tokens per day** (`A-01` to `A-99`), enforced server-side.

---

## 11. Success Criteria

The build is complete when all of the following hold:

1. A customer can join from a phone browser, receive a token, and see live position and EWT without refreshing.
2. Two stylists tapping "Call Next" simultaneously never receive the same customer.
3. All connected clients reflect a queue change within two seconds of it occurring.
4. EWT updates for all remaining customers immediately after any state transition.
5. Five wrong PIN attempts lock the stylist account for 10 minutes.
6. An admin can add a service and a stylist and see those changes immediately in the customer flow and staff login.
7. Daily stats show accurate token counts and revenue totals for a completed test session.
8. The tracking page URL for token X reveals no information about any other token.
