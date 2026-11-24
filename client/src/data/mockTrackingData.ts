/**
 * mockTrackingData.ts — compatibility shim
 *
 * This file previously contained an in-memory + localStorage queue store.
 * It is now a thin re-export layer so components that import TrackingToken
 * or formatWait continue to compile without changes.
 *
 * All live queue data now comes from the Express backend via:
 *   src/lib/api.ts   (HTTP)
 *   src/lib/socket.ts (Socket.IO)
 *
 * Do not add new mock state here.
 */

export type { ApiToken as TrackingToken } from '@/data/apiTypes'

import { formatDuration } from '@/data/mockData'

/** Human-readable wait string used by TokenStatusCard. */
export function formatWait(minutes: number): string {
  if (minutes === 0) return "You're next!"
  return `approx. ${formatDuration(minutes)}`
}
