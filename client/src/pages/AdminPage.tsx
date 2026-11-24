import { useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { Plus, Pencil, ToggleLeft, ToggleRight, Check, X, LogIn, LogOut, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { socket } from '@/lib/socket'
import type {
  ApiToken, ApiService, ApiStylist,
  QueueSnapshotResponse, DailyStatsResponse,
} from '@/data/apiTypes'
import { type TokenStatus } from '@/components/ui/StatusBadge'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatPrice, formatDuration } from '@/data/mockData'
import { cn } from '@/lib/cn'

type AdminTab = 'overview' | 'services' | 'stylists' | 'queue'

// ─── Admin login ──────────────────────────────────────────────────────────────

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password) { setError('Username and password are required.'); return }
    setLoading(true); setError('')
    try {
      await api.post('/api/auth/admin/login', { username, password })
      onLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-champagne mb-2">Admin</p>
          <h1 className="font-heading text-h1 text-charcoal">Admin Login</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-cream-dark shadow-elevated p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-sm font-medium text-charcoal-soft">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="admin" autoComplete="username"
                className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-sm font-medium text-charcoal-soft">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className={inputCls} />
            </div>
            {error && (
              <p className="font-body text-xs text-error bg-error-light rounded px-3 py-2" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                         font-body text-sm font-semibold bg-sage text-white hover:bg-sage-dark
                         transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={15} strokeWidth={1.5} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-cream rounded-xl border border-cream-dark shadow-card p-5">
      <span className="font-heading text-[2rem] font-medium leading-none text-charcoal block">{value}</span>
      <span className="font-body text-sm text-muted mt-1 block">{label}</span>
    </div>
  )
}

// ─── Service form ─────────────────────────────────────────────────────────────

interface SvcForm { name: string; description: string; price: string; durationMinutes: string; popular: boolean }
const emptySvcForm = (): SvcForm => ({ name: '', description: '', price: '', durationMinutes: '', popular: false })

function ServiceForm({ initial, onSave, onCancel }: {
  initial?: Partial<SvcForm>; onSave: (d: SvcForm) => void; onCancel: () => void
}) {
  const [form, setForm] = useState<SvcForm>({ ...emptySvcForm(), ...initial })
  const [err, setErr]   = useState('')

  function validate() {
    if (!form.name.trim()) { setErr('Name is required.'); return false }
    if (!Number.isInteger(Number(form.price)) || Number(form.price) <= 0) {
      setErr('Price must be a positive whole number (₹).'); return false
    }
    if (!Number.isInteger(Number(form.durationMinutes)) || Number(form.durationMinutes) <= 0) {
      setErr('Duration must be a positive integer (minutes).'); return false
    }
    return true
  }

  return (
    <div className="bg-white rounded-xl border border-cream-dark shadow-elevated p-6 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Service name *">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className={inputCls} placeholder="e.g. Signature Haircut" />
        </Field>
        <Field label="Price (₹) *">
          <input type="number" min={1} value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            className={inputCls} placeholder="e.g. 4500" />
        </Field>
        <Field label="Duration (min) *">
          <input type="number" min={1} value={form.durationMinutes}
            onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))}
            className={inputCls} placeholder="e.g. 45" />
        </Field>
        <Field label="Description">
          <input value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className={inputCls} placeholder="Short description" />
        </Field>
      </div>
      {err && <p className="font-body text-xs text-error mt-3">{err}</p>}
      <div className="flex gap-3 mt-4">
        <Btn variant="primary" onClick={() => { if (validate()) onSave(form) }}><Check size={14} /> Save</Btn>
        <Btn variant="ghost" onClick={onCancel}><X size={14} /> Cancel</Btn>
      </div>
    </div>
  )
}

// ─── Stylist form ─────────────────────────────────────────────────────────────

interface StyForm { name: string; role: string; avatarInitials: string; pin: string }
const emptyStyForm = (): StyForm => ({ name: '', role: '', avatarInitials: '', pin: '' })

function StylistForm({ initial, isNew, onSave, onCancel }: {
  initial?: Partial<StyForm>; isNew: boolean; onSave: (d: StyForm) => void; onCancel: () => void
}) {
  const [form, setForm] = useState<StyForm>({ ...emptyStyForm(), ...initial })
  const [err, setErr]   = useState('')

  function validate() {
    if (!form.name.trim()) { setErr('Name is required.'); return false }
    if (!form.role.trim()) { setErr('Role is required.'); return false }
    if (isNew && !/^\d{4}$/.test(form.pin)) { setErr('PIN must be exactly 4 digits.'); return false }
    return true
  }

  return (
    <div className="bg-white rounded-xl border border-cream-dark shadow-elevated p-6 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full name *">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className={inputCls} placeholder="e.g. Elena Vasquez" />
        </Field>
        <Field label="Role *">
          <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            className={inputCls} placeholder="e.g. Senior Colourist" />
        </Field>
        {isNew && (
          <Field label="PIN (4 digits) *">
            <input type="password" inputMode="numeric" maxLength={4}
              value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '') }))}
              className={inputCls} placeholder="••••" />
          </Field>
        )}
        <Field label="Initials (auto if blank)">
          <input value={form.avatarInitials}
            onChange={e => setForm(f => ({ ...f, avatarInitials: e.target.value }))}
            className={inputCls} placeholder="e.g. EV" maxLength={3} />
        </Field>
      </div>
      {err && <p className="font-body text-xs text-error mt-3">{err}</p>}
      <div className="flex gap-3 mt-4">
        <Btn variant="primary" onClick={() => { if (validate()) onSave(form) }}><Check size={14} /> Save</Btn>
        <Btn variant="ghost" onClick={onCancel}><X size={14} /> Cancel</Btn>
      </div>
    </div>
  )
}

// ─── Main admin dashboard ─────────────────────────────────────────────────────

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab]           = useState<AdminTab>('overview')
  const [tokens, setTokens]     = useState<ApiToken[]>([])
  const [services, setServices] = useState<ApiService[]>([])
  const [stylists, setStylists] = useState<ApiStylist[]>([])
  const [stats, setStats]       = useState<DailyStatsResponse | null>(null)
  const [queueFilter, setQueueFilter] = useState<TokenStatus | 'all'>('all')
  const [editingSvcId, setEditingSvcId] = useState<string | null>(null)
  const [addingSvc, setAddingSvc]       = useState(false)
  const [editingStyId, setEditingStyId] = useState<string | null>(null)
  const [addingSty, setAddingSty]       = useState(false)
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      const [snap, svcs, stys, st] = await Promise.all([
        api.get<QueueSnapshotResponse>('/api/queue'),
        api.get<ApiService[]>('/api/services?all=1'),
        api.get<ApiStylist[]>('/api/stylists?all=1'),
        api.get<DailyStatsResponse>('/api/queue/stats'),
      ])
      setTokens(snap.snapshot)
      setServices(svcs)
      setStylists(stys)
      setStats(st)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchAll()
    function handleUpdate({ snapshot }: { snapshot: ApiToken[] }) {
      setTokens(snapshot)
    }
    socket.on('queue:updated', handleUpdate)
    return () => { socket.off('queue:updated', handleUpdate) }
  }, [fetchAll])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  function showToast(msg: string, ok: boolean) { setToast({ msg, ok }) }

  async function handleLogout() {
    await api.post('/api/auth/admin/logout', {}).catch(() => null)
    onLogout()
  }

  // ── Service handlers ────────────────────────────────────────────────────────

  async function handleAddService(d: SvcForm) {
    try {
      await api.post<ApiService>('/api/services', {
        name: d.name.trim(), description: d.description.trim(),
        price_inr: Number(d.price), duration_min: Number(d.durationMinutes), popular: d.popular,
      })
      setAddingSvc(false)
      showToast('Service added.', true)
      fetchAll()
    } catch (err) { showToast(err instanceof Error ? err.message : 'Error', false) }
  }

  async function handleUpdateService(id: string, d: SvcForm) {
    try {
      await api.put<ApiService>(`/api/services/${id}`, {
        name: d.name.trim(), description: d.description.trim(),
        price_inr: Number(d.price), duration_min: Number(d.durationMinutes), popular: d.popular, active: true,
      })
      setEditingSvcId(null)
      showToast('Service updated.', true)
      fetchAll()
    } catch (err) { showToast(err instanceof Error ? err.message : 'Error', false) }
  }

  async function handleToggleService(id: string) {
    try {
      await api.patch(`/api/services/${id}/toggle`)
      showToast('Service updated.', true)
      fetchAll()
    } catch (err) { showToast(err instanceof Error ? err.message : 'Error', false) }
  }

  // ── Stylist handlers ────────────────────────────────────────────────────────

  async function handleAddStylist(d: StyForm) {
    try {
      await api.post<ApiStylist>('/api/stylists', {
        name: d.name.trim(), role: d.role.trim(),
        pin: d.pin, avatar_initials: d.avatarInitials.trim() || undefined,
      })
      setAddingSty(false)
      showToast('Stylist added.', true)
      fetchAll()
    } catch (err) { showToast(err instanceof Error ? err.message : 'Error', false) }
  }

  async function handleUpdateStylist(id: string, d: StyForm) {
    try {
      await api.put<ApiStylist>(`/api/stylists/${id}`, {
        name: d.name.trim(), role: d.role.trim(), avatar_initials: d.avatarInitials.trim() || undefined,
      })
      setEditingStyId(null)
      showToast('Stylist updated.', true)
      fetchAll()
    } catch (err) { showToast(err instanceof Error ? err.message : 'Error', false) }
  }

  async function handleToggleStylist(id: string) {
    try {
      await api.patch(`/api/stylists/${id}/toggle`)
      showToast('Stylist updated.', true)
      fetchAll()
    } catch (err) { showToast(err instanceof Error ? err.message : 'Error', false) }
  }

  const filteredTokens = queueFilter === 'all' ? tokens : tokens.filter(t => t.status === queueFilter)

  const TABS: { key: AdminTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'services', label: 'Services' },
    { key: 'stylists', label: 'Stylists' },
    { key: 'queue',    label: 'Queue' },
  ]

  return (
    <div className="min-h-screen bg-ivory">
      <div className="page-container py-10">

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-champagne mb-1">
              Admin Panel
            </p>
            <h1 className="font-heading text-h1 text-charcoal">Dashboard</h1>
          </div>
          <button type="button" onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg
                       font-body text-sm text-charcoal-soft bg-cream border border-cream-dark
                       hover:bg-cream-dark transition-colors"
          >
            <LogOut size={14} strokeWidth={1.5} /> Sign out
          </button>
        </div>

        {toast && (
          <div className={cn(
            'mb-6 px-5 py-3 rounded-xl border font-body text-sm',
            toast.ok ? 'bg-success-light border-sage/30 text-success' : 'bg-error-light border-error/30 text-error',
          )} role="alert">
            {toast.msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={cn(
                'px-5 py-2.5 rounded-lg font-body text-sm font-medium transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-sage',
                tab === t.key ? 'bg-sage text-white' : 'bg-cream text-charcoal-soft border border-cream-dark hover:bg-cream-dark',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Total today" value={stats.total} />
            <StatCard label="Waiting"     value={stats.waiting} />
            <StatCard label="Completed"   value={stats.completed} />
            <StatCard label="No shows"    value={stats.no_show} />
            <StatCard label={`Revenue (₹)`} value={formatPrice(stats.revenueInr)} />
          </div>
        )}

        {/* Services */}
        {tab === 'services' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-h2 text-charcoal">Services</h2>
              {!addingSvc && (
                <Btn variant="primary" onClick={() => { setAddingSvc(true); setEditingSvcId(null) }}>
                  <Plus size={14} /> Add Service
                </Btn>
              )}
            </div>
            {addingSvc && <ServiceForm onSave={handleAddService} onCancel={() => setAddingSvc(false)} />}
            <div className="flex flex-col gap-3">
              {services.map(svc => (
                <div key={svc.id}>
                  {editingSvcId === svc.id ? (
                    <ServiceForm
                      initial={{ name: svc.name, description: svc.description, price: String(svc.priceInr), durationMinutes: String(svc.durationMinutes), popular: svc.popular }}
                      onSave={d => handleUpdateService(svc.id, d)}
                      onCancel={() => setEditingSvcId(null)}
                    />
                  ) : (
                    <div className={cn(
                      'bg-cream rounded-xl border border-cream-dark p-5 flex items-start justify-between gap-4',
                      !svc.active && 'opacity-50',
                    )}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-heading text-h3 text-charcoal">{svc.name}</span>
                          {!svc.active && <span className="font-body text-xs text-muted bg-cream-dark rounded-full px-2 py-0.5">Disabled</span>}
                          {svc.popular && <span className="font-body text-xs text-champagne bg-warning-light rounded-full px-2 py-0.5">Popular</span>}
                        </div>
                        <p className="font-body text-sm text-charcoal-soft mb-2 line-clamp-1">{svc.description}</p>
                        <div className="flex items-center gap-4">
                          <span className="font-heading text-[1.0625rem] text-sage">{formatPrice(svc.priceInr)}</span>
                          <span className="font-body text-sm text-muted">{formatDuration(svc.durationMinutes)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Btn variant="ghost" onClick={() => { setEditingSvcId(svc.id); setAddingSvc(false) }}>
                          <Pencil size={13} /> Edit
                        </Btn>
                        {svc.active
                          ? <Btn variant="ghost" onClick={() => handleToggleService(svc.id)}><ToggleRight size={13} className="text-sage" /> Disable</Btn>
                          : <Btn variant="ghost" onClick={() => handleToggleService(svc.id)}><ToggleLeft size={13} /> Enable</Btn>
                        }
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stylists */}
        {tab === 'stylists' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-h2 text-charcoal">Stylists</h2>
              {!addingSty && (
                <Btn variant="primary" onClick={() => { setAddingSty(true); setEditingStyId(null) }}>
                  <Plus size={14} /> Add Stylist
                </Btn>
              )}
            </div>
            {addingSty && (
              <StylistForm isNew onSave={handleAddStylist} onCancel={() => setAddingSty(false)} />
            )}
            <div className="flex flex-col gap-3">
              {stylists.map(sty => (
                <div key={sty.id}>
                  {editingStyId === sty.id ? (
                    <StylistForm isNew={false}
                      initial={{ name: sty.name, role: sty.role, avatarInitials: sty.avatarInitials, pin: '' }}
                      onSave={d => handleUpdateStylist(sty.id, d)}
                      onCancel={() => setEditingStyId(null)}
                    />
                  ) : (
                    <div className={cn(
                      'bg-cream rounded-xl border border-cream-dark p-5 flex items-center justify-between gap-4',
                      !sty.active && 'opacity-50',
                    )}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-sage-light flex items-center justify-center flex-shrink-0">
                          <span className="font-body text-sm font-semibold text-sage-dark">{sty.avatarInitials}</span>
                        </div>
                        <div>
                          <p className="font-body text-sm font-semibold text-charcoal">
                            {sty.name}
                            {!sty.active && <span className="ml-2 font-normal text-xs text-muted">(disabled)</span>}
                          </p>
                          <p className="font-body text-xs text-muted mt-0.5">{sty.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Btn variant="ghost" onClick={() => { setEditingStyId(sty.id); setAddingSty(false) }}>
                          <Pencil size={13} /> Edit
                        </Btn>
                        {sty.active
                          ? <Btn variant="ghost" onClick={() => handleToggleStylist(sty.id)}><ToggleRight size={13} className="text-sage" /> Disable</Btn>
                          : <Btn variant="ghost" onClick={() => handleToggleStylist(sty.id)}><ToggleLeft size={13} /> Enable</Btn>
                        }
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Queue */}
        {tab === 'queue' && (
          <div>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <h2 className="font-heading text-h2 text-charcoal">Today's Queue</h2>
              <div className="flex gap-1 flex-wrap">
                {(['all','waiting','called','in_service','completed','no_show','cancelled'] as const).map(f => (
                  <button key={f} type="button" onClick={() => setQueueFilter(f)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg font-body text-xs font-medium transition-colors',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-sage',
                      queueFilter === f ? 'bg-sage text-white' : 'bg-cream text-charcoal-soft border border-cream-dark hover:bg-cream-dark',
                    )}
                  >
                    {f === 'all' ? 'All' : f.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-cream-dark shadow-elevated overflow-hidden">
              {filteredTokens.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-heading text-h3 text-charcoal mb-2">No records</p>
                  <p className="font-body text-sm text-muted">No queue entries match this filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px]">
                    <thead>
                      <tr className="bg-cream border-b border-cream-dark">
                        {['Token','Customer','Service','Stylist','Status'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-muted uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTokens.map(t => (
                        <tr key={t.tokenId} className="border-b border-cream-dark last:border-0 hover:bg-cream/30 transition-colors">
                          <td className="px-4 py-3"><span className="font-mono text-sm font-semibold text-sage">{t.tokenLabel}</span></td>
                          <td className="px-4 py-3"><span className="font-body text-sm text-charcoal">{t.customerName}</span></td>
                          <td className="px-4 py-3"><span className="font-body text-sm text-charcoal-soft">{t.serviceName}</span></td>
                          <td className="px-4 py-3"><span className="font-body text-xs text-muted">{t.stylistName}</span></td>
                          <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Page root — handles login gate ──────────────────────────────────────────

export default function AdminPage() {
  const [loggedIn, setLoggedIn]       = useState(false)
  const [checking, setChecking]       = useState(true)

  useEffect(() => {
  api.get('/api/auth/admin/me')
    .then(() => setLoggedIn(true))
    .catch(() => setLoggedIn(false))
    .finally(() => setChecking(false))
}, [])

  if (checking) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-sage" />
      </div>
    )
  }

  if (!loggedIn) {
    return <AdminLogin onLogin={() => setLoggedIn(true)} />
  }

  return <AdminDashboard onLogout={() => setLoggedIn(false)} />
}

// ─── File-local helpers ───────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-sm font-medium text-charcoal-soft">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full bg-cream border border-cream-dark rounded-lg px-4 py-2.5 font-body text-sm text-charcoal ' +
  'placeholder:text-muted shadow-inset transition-colors ' +
  'focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage'

function Btn({ variant = 'ghost', onClick, children }: {
  variant?: 'primary' | 'ghost' | 'danger'; onClick: () => void; children: ReactNode
}) {
  const cls = {
    primary: 'bg-sage text-white hover:bg-sage-dark',
    danger:  'bg-error text-white hover:bg-[#B3715A]',
    ghost:   'bg-cream text-charcoal-soft border border-cream-dark hover:bg-cream-dark',
  }[variant]
  return (
    <button type="button" onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-body text-sm font-medium',
        'transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-1',
        cls,
      )}
    >
      {children}
    </button>
  )
}
