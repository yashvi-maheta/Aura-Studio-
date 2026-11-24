# 02 — Screens

## Aura Studio — Screen-by-Screen Reference

**Version:** 1.0
**Last updated:** 2025
**Based on:** Actual implemented application

> This document describes the screens as they are implemented. Where a planned feature is not yet complete, it is clearly marked.

---

## Screen 1 — Customer Home and Services (`/`)

### Purpose
The public-facing landing page. Introduces Aura Studio, displays available services, explains the queue process, and directs customers to join the queue.

### Layout

**Navbar (sticky, top)**
- Aura Studio wordmark with a sage-green scissors icon on the left.
- Desktop: "Services" and "Our Team" anchor links in the centre; "Track My Token" (secondary button) and "Join Queue" (primary/sage button) on the right.
- Mobile: wordmark + hamburger icon; a drawer slides down from below the navbar with the same links and buttons stacked vertically.
- Background: ivory `#FAF8F2` at 95% opacity with a backdrop blur; bottom border `1px solid #E7DDCD`.
- Height: 64 px.

**Hero section**
- Two-column grid on desktop; stacked single column on mobile/tablet.
- Left column: champagne eyebrow text ("Premium Salon Experience"), large serif headline ("Look Good. / Feel Amazing."), two lines — "Feel Amazing." in sage green italic. Supporting paragraph. Two CTA buttons: "Join the Queue" (primary/sage) and "Explore Services" (secondary/cream, anchors to `#services`). A trust pill below the buttons with a clock icon and "Real-time queue tracking — no app needed."
- Right column: a warm salon interior photograph in a `rounded-2xl` container; a floating satisfaction card ("4.9 / 5.0 ★★★★★ Customer satisfaction") overlaid at the bottom-left; a small "Est. 2019" pill at the top-right.
- The photo component (`HeroImage.tsx`) tries five ordered Pexels/Unsplash URLs and falls back automatically if any fails.
- Minimum height: 88 vh on desktop; height is 72 (mobile) → 480 px (tablet) → 600 px (desktop).

**Services section (`id="services"`)**
- Eyebrow: "What We Offer". Heading: "Our Services". Subtitle.
- Right side: "View all & join queue" ghost link to `/join`.
- Services loaded from `GET /api/services` on mount.
- Loading state: spinner + "Loading services…".
- Error state: error banner with message.
- Grid: 1 column → 2 columns (sm) → 3 columns (lg).
- Each service card: photograph top (height 192 px, `object-cover`), "Most Popular" or "Add-on" badge overlaid when applicable; name (Cormorant Garamond), description (2-line clamp), duration (Clock icon), price (Cormorant Garamond, sage green, INR).
- Hover: card lifts (`shadow-card-hover`), image scales very slightly.
- Bottom CTA: "Join the Queue Now" primary button to `/join`.

**Why Choose Aura Studio section**
- Two-column grid: image left, four benefit rows right (icon + heading + text).
- Benefits: Premium Craftsmanship, Respect Your Time, Personalised Attention, A Calming Environment.

**Team section (`id="team"`)**
- Eyebrow + heading. Three stylist cards centred in a 3-column grid: circular avatar, name, champagne role label, bio.
- Below: a 4-image atmosphere strip (responsive grid).

**Queue CTA section**
- Dark forest-green background. Two-column grid: headline left, 4-step process + buttons right.
- Steps: 01 Choose service → 02 Register name → 03 Get token → 04 Return when it's time.
- Buttons: "Join the Queue" (sage) + "Track existing token" (ghost/light).

**Footer**
- 4-column layout on desktop, stacked on mobile. Charcoal background.
- Columns: brand description, services list (anchor links), quick links (`/join`, `/track`, `/staff`), contact (address, phone, hours).
- Bottom bar: copyright + "MSc IT Project".

### Responsive behaviour
- Navbar collapses to hamburger below 768 px.
- Hero stacks at <1024 px; image comes after text on mobile.
- Service grid: 1 → 2 → 3 columns.
- Team grid: 1 → 3 columns.
- CTA section: stacked on mobile.
- Footer: 1 → 2 → 4 columns.

### States
- **Loading (services):** Spinner shown in the services section while `GET /api/services` is in flight.
- **Error (services):** Red banner with error message if the API call fails; the rest of the page renders normally.
- **Empty services:** If the API returns an empty array, the services grid renders nothing (no explicit empty-state message).

---

## Screen 2 — Queue Registration (`/join`)

### Purpose
Allows a walk-in customer to register for the queue by entering their name and phone number, selecting a service, and optionally choosing a preferred stylist.

### Layout (form state)

**Page header**
Champagne eyebrow ("Walk-in Queue"), `h1` ("Reserve Your Spot"), lead paragraph.

**Two-column layout on desktop (`lg:grid-cols-[1fr_380px]`)**

Left column (fields + selections):

1. **Your Details card** (cream background, rounded-xl)
   - Full name (required): text input with validation.
   - Phone number (required): tel input with validation. Hint: "Used only to contact you if needed."

2. **Choose a Service card**
   - Services loaded from `GET /api/services` at mount.
   - Loading state: spinner.
   - Error state: red banner.
   - Selectable button cards, one per service: name, popular badge if applicable, description, INR price, duration with Clock icon. Selected state: sage border + success-light background + filled radio dot.

3. **Stylist Preference card**
   - "Any Available Stylist" option (always first, default selected).
   - One button card per active stylist (from `GET /api/stylists`): initials avatar, name, role. Same selected styling.

Right column (sticky on desktop):

4. **Summary card** (white elevated background)
   - Rows: Name, Phone, (divider), Service, Price, Duration, Stylist. Muted italic placeholder when a field is empty.

5. **Error banner** (shown only after a failed submission attempt).

6. **Join the Queue button** (full-width, primary/sage, `py-4`).
   - Loading state: "Joining queue…" with spinner; button disabled.

7. **Disclaimer** ("By joining you agree…").

**Validation rules**
- Name: required, 2–60 characters.
- Phone: required, 7–15 digits (spaces, dashes, brackets, `+` stripped before testing).
- Service: required (validation message shown near the section heading).
- Errors shown inline below each field; re-validated on change once an error has been shown.

**On successful submission**
- Calls `POST /api/queue/join` with `{ customerName, phone, serviceId, stylistId }`.
- The form is replaced by a **Confirmation view** (see below).
- `window.scrollTo({ top: 0 })`.

### Confirmation view (same route, state machine)

Centred card, max-width 448 px.

- Success circle (CheckCircle2, success-light background).
- "You're in the queue" eyebrow + "Welcome, [name]!" heading.
- Token card:
  - Large monospace token label (e.g. `A-01`) in sage green, 3.5 rem.
  - Two rows: Queue position + Est. wait; Service + Stylist.
- Amber info banner: "Keep this page open to receive live updates…".
- "Track My Position" primary button → `/track/:tokenId`.
- "Back to Home" secondary button → `/`.

### Responsive behaviour
- Single column on mobile; sticky right column unfolds to bottom of left column.
- Service and stylist cards are full-width at all breakpoints.
- Form inputs: full-width.

### States
- **Loading (data fetch):** Spinner in service section.
- **API error (data fetch):** Error banner at top of page.
- **Validation errors:** Inline per field; service-level error near heading.
- **Submitting:** Button shows spinner + "Joining queue…"; form disabled.
- **Submit error:** Error banner below summary card; page state returns to `form`.
- **Confirmed:** Form replaced by confirmation view.

---

## Screen 3 — Customer Queue Tracking (`/track/:id`)

### Purpose
Allows a customer to monitor their real-time queue position, estimated wait time, and status after registration.

Visiting `/track` without an ID shows a **Token Lookup** form. `/track/:id` shows the **Tracking view**.

### Token Lookup form (`/track`)

Centred layout, max-width 448 px.
- Ticket icon in a success-light circle.
- Heading: "Track Your Token".
- Input labelled "Token number or tracking ID". Monospace font. Placeholder "e.g. A-01".
- Hint: "Enter your token number or paste the full tracking ID from your confirmation."
- "Find My Token" button (primary/sage).
- Divider + "Haven't joined the queue yet?" + "Join the Queue" secondary button → `/join`.

**Lookup logic**
1. Try `GET /api/queue/token/{value}` (UUID path — the confirmation link).
2. If not found, fetch `GET /api/queue` and scan `tokenLabel` case-insensitively.
3. Navigate to `/track/:tokenId` on success.
4. Show inline error if neither lookup succeeds or the server is unreachable.

**States:** checking spinner, error message.

### Tracking view (`/track/:id`)

**Back link:** "Look up a different token" → `/track`.

**Page header:** "Queue Tracker" eyebrow + "Track Your Position" heading.

**Two-column layout on desktop (`lg:grid-cols-[1fr_380px]`)**

Left column:
1. **StatusBanner** — contextual message based on current status (see statuses below). No banner while `waiting`.
2. **QueuePositionPanel** — visual dot strip showing customers ahead + "You" dot; summary sentence ("You are position #N — X customers ahead."). Hidden when status is terminal.
3. **Info note** — "Live updates: This page receives real-time updates via Socket.IO…" + last-updated timestamp.
4. **Terminal-state actions** — shown when status is `completed`, `no_show`, or `cancelled`: "Join queue again" (primary) + "Back to home" (secondary).

Right column (sticky):
5. **TokenStatusCard** — white elevated card.
   - Hero area: large token label (4 rem, monospace) on a tinted background (warning-light when `called`, success-light when `in_service`, cream otherwise). Animated pulse overlay when `called` or `in_service`. StatusBadge below label.
   - Detail rows: Customer, (divider), Service + duration sub-label, Stylist, (divider), Est. wait, Customers ahead.
   - Footer note ("Keep this page open…") shown while non-terminal.
6. **Refresh now** button (secondary) — manual re-fetch; hidden when terminal.

**Real-time updates**
- On load: `socket.emit('track:join', tokenId)`.
- Subscription: `socket.on('queue:updated', handler)` — finds the matching token in the snapshot and updates state.
- Cleanup: `socket.emit('track:leave', tokenId)` + `socket.off(...)` on unmount.

**StatusBanner messages per status**

| Status | Banner colour | Heading | Body |
|--------|--------------|---------|------|
| `waiting` | — | (none) | — |
| `called` | Amber / warning-light | "You're almost up — get ready!" | Please make your way to the reception desk. |
| `in_service` | Green / success-light | "It's your turn!" | Your stylist is ready for you. |
| `completed` | Cream / muted | "Service completed" | Thank you for visiting Aura Studio. |
| `no_show` | Red / error-light | "Marked as no show" | Your token was closed. |
| `cancelled` | Red / error-light | "Your token has been cancelled" | Reason shown if provided. |

**Sub-components and their state machines**
- `TokenStatusCard` uses `TERMINAL_STATUSES` from `StatusBadge.tsx` (computed, not duplicated).
- `QueuePositionPanel` returns `null` for terminal statuses.

### Load states
- **Loading:** Animated pulse skeleton (two cream-dark rounded rectangles left, one tall right).
- **Not found:** Ticket icon, "Token not found" heading, token ID displayed in monospace, links to try a different ID or join.
- **Error:** RefreshCw icon, "Something went wrong", retry button.
- **Found:** Full tracking view.

### Responsive behaviour
- Stacked single column on mobile; sticky right column unfolds below left on tablet and mobile.
- TokenStatusCard is full-width on mobile.

---

## Screen 4 — Staff Queue Dashboard (`/staff`)

### Purpose
Protected staff-only screen. Stylists log in with a 4-digit PIN, view the live queue, call the next customer, progress customers through service statuses, and log out.

### Login gate

The page checks `GET /api/auth/staff/me` on mount to detect an existing session.

**Login form** (shown when not authenticated):
- Centred card, max-width 352 px.
- Select dropdown populated from `GET /api/stylists`.
- 4-digit PIN field (password input, numeric, maxLength 4).
- "Sign In" button with Loader2 spinner while in flight.
- Inline error message on failure (shows remaining attempts, lockout duration).
- Calls `POST /api/auth/staff/login` with `{ stylistId, pin }`.

**Loading state:** Full-screen spinner while session check is in flight.

### Dashboard (shown after authentication)

**Header**
- "Staff Panel" eyebrow + "Queue Dashboard" `h1` + "Signed in as [name]".
- Right side: "Call Next" primary button (disabled when `waiting === 0`), Refresh icon button, "Sign out" ghost button.

**Toast notification**
- Appears below the header after each action.
- Green (success) or red (error) pill banner; auto-dismisses after 3.5 s.

**Stats row**
- Five stat cards: Total today / Waiting / Called / In Service / Completed.
- In Service card uses `success-light` background.

**Filter tabs**
- All / Waiting / Called / In Service / Completed.
- Selected tab: sage background + white text. Each non-"All" tab shows the count in parentheses.

**Queue table**
- Columns: Token (monospace, sage) / Customer / Service (hidden <768 px) / Stylist (hidden <1024 px) / Status (StatusBadge) / Actions.
- Row hover: cream/40 background.

**Actions per row (shown only for the signed-in stylist's tokens)**

| Token status | Actions shown |
|-------------|--------------|
| `waiting` | — (dash) — only "Call Next" at top applies |
| `called` (mine) | "In Service" (primary) + "Return" + "No Show" (danger) |
| `in_service` (mine) | "Complete" (primary) |
| terminal | — (no actions) |

Each row action calls `PUT /api/queue/token/:id/status` with the new status. Spinner shown during the request; toast shown on completion.

**Call Next** calls `POST /api/queue/call-next`. The backend atomically assigns the next waiting customer to the calling stylist.

**Real-time updates**
- `socket.on('queue:updated', handler)` — replaces the entire `tokens` state with the new snapshot.
- Subscribed on mount; cleaned up on unmount.

**Sign out** calls `POST /api/auth/staff/logout` then clears session state (shows the login form again).

### Empty queue state
- "Queue is empty" heading + "No customers match this filter." in a padded centred block inside the table container.

### Error state
- Red banner at top of dashboard if the queue fetch fails.

### Responsive behaviour
- Header stacks vertically on mobile (column layout).
- Table scrolls horizontally below 640 px; Service and Stylist columns hidden on small screens.
- Stat cards: 2-column on mobile, 5-column on md+.

---

## Screen 5 — Now Serving Display (`/display`)

### Purpose
A public full-screen display intended for a wall-mounted screen in the salon. No navbar. Shows the currently served/called customer and the next five waiting customers.

### Layout

**Header bar** (top, `border-b border-white/10`)
- Aura Studio wordmark (white) on dark forest green background.
- Current time (HH:MM) on the right, updated every 30 seconds.

**Main area** — two-panel flex layout

**Left / top panel (primary display)**
- "Now Serving" eyebrow label (sage-light/70, uppercase tracking).
- If a customer is `in_service` or `called`:
  - Very large token label — clamps between 5 rem and 11 rem using `clamp()`.
  - Customer name (1.5–2.5 rem).
  - Service name · stylist name (separated by a dot).
  - Live status pill with animated sage dot: "In Service" or "Called — please come to the desk".
- If no active customer:
  - "Welcome" in large faded heading.
  - "No customers are currently being served."
  - Waiting count if any.

**Right / bottom panel (Up Next)**
- "Up Next" eyebrow.
- Up to 5 entries (called then waiting): token label (monospace sage-light), customer name, service name. First entry uses `bg-white/10`; others use `bg-white/5`.
- Called entries show a "Called" label in champagne.
- If empty: "No one waiting."
- Bottom: "Thank you for choosing Aura Studio."

**Real-time updates**
- `GET /api/queue` on mount.
- `socket.on('queue:updated', handler)` — replaces tokens state; display updates instantly.

**Data rules**
- Shows only `in_service` and `called` tokens in the primary panel.
- Phone numbers are never displayed.
- Completed/cancelled tokens are excluded.

### Empty state
- Primary panel: "Welcome" text with no token information.

### Responsive behaviour
- Side-by-side panels on desktop (`lg:flex-row`).
- Stacked panels (primary above, up-next below) on mobile.
- Vertical divider visible only on `lg+`.
- Font sizes use `clamp()` so the token label scales to screen width.

---

## Screen 6 — Admin Dashboard (`/admin`)

### Purpose
Protected admin screen for managing salon services, stylists, viewing queue records and reviewing daily statistics.

### Login gate

On mount the page calls `GET /api/queue/stats` (a staff-auth-required endpoint). If it fails with 401, the admin login form is shown.

**Admin login form** (centred, max-width 352 px):
- Username (text) + Password (password) inputs.
- "Sign In" button.
- Error banner on failure.
- Calls `POST /api/auth/admin/login`.

**Loading state:** full-screen spinner while the session check is in flight.

### Dashboard (four tabs)

**Header:** "Admin Panel" eyebrow + "Dashboard" h1 + "Sign out" ghost button (calls `POST /api/auth/admin/logout`).

**Toast:** same pattern as staff dashboard (auto-dismiss, green/red).

**Tab nav:** Overview / Services / Stylists / Queue.

---

#### Tab 1 — Overview

Five stat cards loaded from `GET /api/queue/stats`:
- Total today / Waiting / Completed / No shows / Revenue (₹, using `formatPrice`).

---

#### Tab 2 — Services

Header: "Services" + "Add Service" primary button.

**Add form** (white elevated card, shown above list):
- Fields: Service name\*, Price (₹, whole integer)\*, Duration (minutes, integer)\*, Description.
- Validation: name required; price must be a positive integer; duration must be a positive integer.
- Save calls `POST /api/services`; Cancel hides the form.
- Toast on success/failure; list refreshed.

**Service list:** One card per service.
- Name (Cormorant Garamond), Disabled / Popular badge if applicable.
- Description (1-line clamp), price (sage, Cormorant Garamond), duration.
- "Edit" button — shows inline edit form (pre-filled, calls `PUT /api/services/:id`).
- "Disable" / "Enable" toggle — calls `PATCH /api/services/:id/toggle`.

Inactive services shown at 50% opacity with "Disabled" label.

**Loaded via** `GET /api/services?all=1` (admin session required to get inactive services too).

---

#### Tab 3 — Stylists

Same pattern as Services.

**Add form:** Name\*, Role\*, PIN (4 digits, required when adding)\*, Initials (auto-generated if blank).
- Calls `POST /api/stylists`.

**Stylist list:** Avatar (sage-light circle with initials), name, role.
- "Edit" button — name, role, initials (no PIN change here); calls `PUT /api/stylists/:id`.
- "Disable" / "Enable" — calls `PATCH /api/stylists/:id/toggle`.

**Loaded via** `GET /api/stylists?all=1`.

---

#### Tab 4 — Queue

Header: "Today's Queue" + status filter buttons (All / waiting / called / in_service / completed / no_show / cancelled).

Read-only table:
- Columns: Token (monospace sage), Customer, Service, Stylist, Status (StatusBadge).
- Loaded from `GET /api/queue`; updated via `socket.on('queue:updated')`.

**Empty state:** "No records / No queue entries match this filter."

---

### Responsive behaviour
- Tabs wrap on mobile.
- Service and stylist cards stack on mobile.
- Queue table scrolls horizontally below 560 px.
- Forms use 1-column layout on mobile, 2-column on sm+.

### Known limitations
- The admin session-check currently uses `GET /api/queue/stats` (a staff-only endpoint). If a staff session is active but no admin session exists, the admin dashboard may briefly show a loading state before redirecting to login. A dedicated `GET /api/auth/admin/me` endpoint would make this more reliable.
- PIN reset for existing stylists is available via `PATCH /api/stylists/:id/pin` (backend) but is not exposed in the current admin UI.
