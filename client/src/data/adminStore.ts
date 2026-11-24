/**
 * adminStore.ts
 * -------------
 * Mutable in-memory collections for services and stylists.
 * Initialised from the read-only constants in mockData.ts.
 *
 * All three screens (staff, display, admin) read from here so changes
 * made via the admin panel are reflected everywhere immediately.
 *
 * LIMITATION: Changes are lost on page refresh (no backend yet).
 *
 * MIGRATION: replace each exported function body with an API call.
 */

import { SERVICES, STYLISTS, type Service, type Stylist } from '@/data/mockData'

// ─── Mutable service collection ───────────────────────────────────────────────

export interface ManagedService extends Service {
  active: boolean
}

export interface ManagedStylist extends Stylist {
  active: boolean
}

// Deep-copy the seed data so we never mutate the imported constants
let _services: ManagedService[] = SERVICES.map((s) => ({ ...s, active: true }))
let _stylists: ManagedStylist[] = STYLISTS.map((s) => ({ ...s, active: true }))

type StoreListener = () => void
const _listeners = new Set<StoreListener>()
function _notify() { _listeners.forEach((fn) => fn()) }

export function subscribeToAdminStore(listener: StoreListener): () => void {
  _listeners.add(listener)
  return () => _listeners.delete(listener)
}

// ─── Service helpers ──────────────────────────────────────────────────────────

export function getServices(): ManagedService[] { return [..._services] }
export function getActiveServices(): ManagedService[] { return _services.filter((s) => s.active) }

export function addService(data: Omit<ManagedService, 'id'>): ManagedService {
  const id = `svc-${Date.now()}`
  const svc: ManagedService = { id, ...data }
  _services = [..._services, svc]
  _notify()
  return svc
}

export function updateService(id: string, patch: Partial<Omit<ManagedService, 'id'>>): boolean {
  const idx = _services.findIndex((s) => s.id === id)
  if (idx === -1) return false
  const updated = { ..._services[idx], ...patch } as ManagedService
  _services = _services.map((s) => s.id === id ? updated : s)
  _notify()
  return true
}

/** Disables a service. Never deletes — existing queue records may reference it. */
export function disableService(id: string): boolean {
  return updateService(id, { active: false })
}

export function enableService(id: string): boolean {
  return updateService(id, { active: true })
}

// ─── Stylist helpers ──────────────────────────────────────────────────────────

export function getStylists(): ManagedStylist[] { return [..._stylists] }
export function getActiveStylists(): ManagedStylist[] { return _stylists.filter((s) => s.active) }

export function addStylist(data: Omit<ManagedStylist, 'id'>): ManagedStylist {
  const id = `sty-${Date.now()}`
  const sty: ManagedStylist = { id, ...data }
  _stylists = [..._stylists, sty]
  _notify()
  return sty
}

export function updateStylist(id: string, patch: Partial<Omit<ManagedStylist, 'id'>>): boolean {
  const idx = _stylists.findIndex((s) => s.id === id)
  if (idx === -1) return false
  const updated = { ..._stylists[idx], ...patch } as ManagedStylist
  _stylists = _stylists.map((s) => s.id === id ? updated : s)
  _notify()
  return true
}

export function disableStylist(id: string): boolean {
  return updateStylist(id, { active: false })
}

export function enableStylist(id: string): boolean {
  return updateStylist(id, { active: true })
}
