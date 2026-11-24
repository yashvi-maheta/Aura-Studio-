/**
 * mockData.ts
 * -----------
 * All static data used while the Express + SQLite backend is not yet connected.
 *
 * MIGRATION NOTE: when the backend is ready, replace each exported constant with
 * an API call (e.g. GET /api/services, GET /api/stylists) and remove this file.
 * The consuming components already accept these types — only the data source changes.
 */

export interface Service {
  id: string
  name: string
  description: string
  durationMinutes: number
  /**
   * Price in whole Indian Rupees (INR).
   * Display using formatPrice(). Do NOT divide by 100.
   * Example: 4500 displays as ₹4,500.
   */
  price: number
  popular?: boolean
}

export interface Stylist {
  id: string
  name: string
  role: string
  avatarInitials: string // used when no photo is available
}

export const SERVICES: Service[] = [
  {
    id: 'svc-1',
    name: 'Signature Haircut',
    description: 'Precision cut tailored to your face shape and style.',
    durationMinutes: 45,
    price: 4500,
    popular: true,
  },
  {
    id: 'svc-2',
    name: 'Colour & Highlights',
    description: 'Sun-kissed highlights or bold transformations.',
    durationMinutes: 90,
    price: 7500,
  },
  {
    id: 'svc-3',
    name: 'Blowout & Style',
    description: 'Luxury shampoo, nourishing treatment and flawless blowout.',
    durationMinutes: 40,
    price: 3500,
  },
  {
    id: 'svc-4',
    name: 'Deep Conditioning',
    description: 'Intensive repair mask for stressed or colour-treated hair.',
    durationMinutes: 30,
    price: 2800,
  },
  {
    id: 'svc-5',
    name: 'Beard Trim & Shape',
    description: 'Expert beard shaping with hot towel finish.',
    durationMinutes: 25,
    price: 2200,
  },
  {
    id: 'svc-6',
    name: 'Scalp Treatment',
    description: 'Relaxing scalp massage with nourishing serum.',
    durationMinutes: 30,
    price: 3000,
  },
]

export const STYLISTS: Stylist[] = [
  { id: 'sty-1', name: 'Elena Vasquez', role: 'Senior Colourist',                avatarInitials: 'EV' },
  { id: 'sty-2', name: 'Marcus Osei',   role: 'Master Stylist',                  avatarInitials: 'MO' },
  { id: 'sty-3', name: 'Priya Nair',    role: 'Wellness & Treatment Specialist',  avatarInitials: 'PN' },
]

// ─── Mock queue helpers ───────────────────────────────────────────────────────

/**
 * Simulates a POST /api/queue/join response.
 * Returns a promise that resolves after a short delay, mimicking a network call.
 *
 * MIGRATION: replace the body with:
 *   return fetch('/api/queue/join', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(payload),
 *   }).then(r => r.json())
 */
export interface JoinQueuePayload {
  customerName: string
  phone: string
  serviceId: string
  stylistId: string | null   // null means "any available"
}

export interface JoinQueueResult {
  tokenId: string            // UUID — used in /track/:id
  tokenLabel: string         // human-readable, e.g. "A-07"
  position: number           // current queue position
  estimatedWaitMinutes: number
  serviceName: string
  stylistName: string        // "Any Available Stylist" if none assigned
}

let _tokenCounter = 7 // start at 7 to look like a real queue mid-day

export async function mockJoinQueue(payload: JoinQueuePayload): Promise<JoinQueueResult> {
  // Simulate network latency
  await new Promise<void>((resolve) => setTimeout(resolve, 1200))

  const service = SERVICES.find((s) => s.id === payload.serviceId)
  if (!service) {
    throw new Error(`Unknown serviceId: "${payload.serviceId}"`)
  }

  const stylist  = STYLISTS.find((s) => s.id === payload.stylistId)
  const position = _tokenCounter
  _tokenCounter += 1

  // Simple EWT: (position - 1) waiting customers × avg 35 min ÷ 2 active stylists,
  // rounded up to the nearest 5 minutes.
  const estimatedWaitMinutes = Math.max(0, Math.ceil(((position - 1) * 35) / 2 / 5) * 5)

  return {
    tokenId:             crypto.randomUUID(),
    tokenLabel:          `A-${String(position).padStart(2, '0')}`,
    position,
    estimatedWaitMinutes,
    serviceName:         service.name,
    stylistName:         stylist?.name ?? 'Any Available Stylist',
  }
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

/**
 * Formats a whole-rupee INR price for display.
 * Input is whole rupees — do NOT pass paise or cents.
 * Examples:  4500 → "₹4,500"   750 → "₹750"   10000 → "₹10,000"
 */
export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`
}

/**
 * Converts a duration in minutes to a readable label.
 * Examples:  25 → "25 min"   60 → "1 hr"   90 → "1 hr 30 min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}
