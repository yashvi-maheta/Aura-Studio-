/**
 * apiTypes.ts — TypeScript types that match the Express server's JSON responses.
 *
 * Keep these in sync with server/src/routes/*.js and server/src/queue.js.
 * None of these are mock types — they describe real backend payloads.
 */

import type { TokenStatus } from '@/components/ui/StatusBadge'

// ─── Queue token (matches getQueueSnapshot output) ───────────────────────────

export interface ApiToken {
  tokenId:               string
  tokenLabel:            string
  customerName:          string
  status:                TokenStatus
  position:              number
  customersAhead:        number
  estimatedWaitMinutes:  number
  serviceName:           string
  serviceDurationMinutes: number
  priceInr:              number
  serviceId:             string
  stylistName:           string
  assignedStylistId:     string | null
  cancelledReason?:      string
  createdAt:             string
}

// ─── Service (matches formatService output) ──────────────────────────────────

export interface ApiService {
  id:              string
  name:            string
  description:     string
  priceInr:        number
  durationMinutes: number
  popular:         boolean
  active:          boolean
}

// ─── Stylist (matches formatStylist output) ──────────────────────────────────

export interface ApiStylist {
  id:             string
  name:           string
  role:           string
  avatarInitials: string
  active:         boolean
}

// ─── Response envelopes ───────────────────────────────────────────────────────

export interface QueueSnapshotResponse {
  snapshot: ApiToken[]
}

export interface JoinQueueResponse {
  token: ApiToken
}

export interface CallNextResponse {
  calledTokenId: string
  snapshot:      ApiToken[]
}

export interface StatusTransitionResponse {
  snapshot: ApiToken[]
}

export interface DailyStatsResponse {
  date:       string
  total:      number
  waiting:    number
  called:     number
  in_service: number
  completed:  number
  no_show:    number
  cancelled:  number
  revenueInr: number
}

export interface StaffLoginResponse {
  ok:      boolean
  stylist: { id: string; name: string; role: string }
}

export interface StaffMeResponse {
  stylistId:   string
  stylistName: string
}
