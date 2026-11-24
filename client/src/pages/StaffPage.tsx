import { useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, UserX, PhoneCall, Loader2, RefreshCw, ChevronDown, LogIn, LogOut } from 'lucide-react'
import { api } from '@/lib/api'
import { socket } from '@/lib/socket'
import type {
  ApiToken, ApiStylist, QueueSnapshotResponse,
  CallNextResponse, StatusTransitionResponse, StaffLoginResponse,
} from '@/data/apiTypes'
import { TERMINAL_STATUSES, type TokenStatus } from '@/components/ui/StatusBadge'
import StatusBadge from '@/components/ui/StatusBadge'
import { cn } from '@/lib/cn'

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'waiting' | 'called' | 'in_service' | 'completed'

// ─── Login screen ─────────────────────────────────────────────────────────────

function StaffLogin({ stylists, onLogin }: {
  stylists: ApiStylist[]
  onLogin: (stylist: { id: string; name: string; role: string }) => void
}) {
  const [stylistId, setStylistId] = useState(stylists[0]?.id ?? '')
  const [pin, setPin]             = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stylistId) { setError('Please select a stylist.'); return }
    if (!/^\d{4}$/.test(pin)) { setError('PIN must be exactly 4 digits.'); return }
    setLoading(true); setError('')
    try {
      const { stylist } = await api.post<StaffLoginResponse>('/api/auth/staff/login', { stylistId, pin })
      onLogin(stylist)
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
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-champagne mb-2">
            Staff Panel
          </p>
          <h1 className="font-heading text-h1 text-charcoal">Staff Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-cream-dark shadow-elevated p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-sm font-medium text-charcoal-soft">Your name</label>
              <div className="relative">
                <select value={stylistId} onChange={e => setStylistId(e.target.value)}
                  className="w-full appearance-none bg-cream border border-cream-dark rounded-lg
                             pl-4 pr-8 py-3 font-body text-sm text-charcoal
                             focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                >
                  <option value="">Select your name…</option>
                  {stylists.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <ChevronDown size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-sm font-medium text-charcoal-soft">4-digit PIN</label>
              <input type="password" inputMode="numeric" maxLength={4}
                value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full bg-cream border border-cream-dark rounded-lg px-4 py-3
                           font-mono text-lg text-charcoal tracking-widest
                           focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
              />
            </div>

            {error && (
              <p className="font-body text-xs text-error bg-error-light rounded px-3 py-2" role="alert">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                         font-body text-sm font-semibold bg-sage text-white hover:bg-sage-dark
                         transition-colors duration-150
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-sage
                         disabled:opacity-60 disabled:cursor-not-allowed"
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

function StatCard({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={cn(
      'rounded-xl border p-5 flex flex-col gap-1',
      accent ? 'bg-success-light border-sage/30' : 'bg-cream border-cream-dark',
    )}>
      <span className="font-heading text-[2rem] font-medium leading-none text-charcoal">{value}</span>
      <span className="font-body text-sm text-muted">{label}</span>
    </div>
  )
}

// ─── Action button ────────────────────────────────────────────────────────────

function ActionBtn({ onClick, loading, variant = 'ghost', children }: {
  onClick: () => void; loading?: boolean; variant?: 'primary' | 'danger' | 'ghost'; children: ReactNode
}) {
  const cls = {
    primary: 'bg-sage text-white hover:bg-sage-dark',
    danger:  'bg-error text-white hover:bg-[#B3715A]',
    ghost:   'bg-cream text-charcoal-soft border border-cream-dark hover:bg-cream-dark',
  }[variant]
  return (
    <button type="button" onClick={onClick} disabled={loading}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium font-body',
        'transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed', cls,
      )}
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : null}
      {children}
    </button>
  )
}

// ─── Token row ────────────────────────────────────────────────────────────────

function TokenRow({ token, activeStylistId, onAction }: {
  token: ApiToken; activeStylistId: string; onAction: (msg: string, ok: boolean) => void
}) {
  const [busy, setBusy] = useState(false)

  function run(fn: () => Promise<void>) {
    setBusy(true)
    fn().finally(() => setBusy(false))
  }

  function markInService() {
    run(async () => {
      try {
        await api.put<StatusTransitionResponse>(`/api/queue/token/${token.tokenId}/status`, { status: 'in_service' })
        onAction(`${token.tokenLabel} is now in service.`, true)
      } catch (err) {
        onAction(err instanceof Error ? err.message : 'Error', false)
      }
    })
  }
  function markCompleted() {
    run(async () => {
      try {
        await api.put<StatusTransitionResponse>(`/api/queue/token/${token.tokenId}/status`, { status: 'completed' })
        onAction(`${token.tokenLabel} completed.`, true)
      } catch (err) {
        onAction(err instanceof Error ? err.message : 'Error', false)
      }
    })
  }
  function markNoShow() {
    run(async () => {
      try {
        await api.put<StatusTransitionResponse>(`/api/queue/token/${token.tokenId}/status`, { status: 'no_show' })
        onAction(`${token.tokenLabel} marked no show.`, true)
      } catch (err) {
        onAction(err instanceof Error ? err.message : 'Error', false)
      }
    })
  }
  function returnToWaiting() {
    run(async () => {
      try {
        await api.put<StatusTransitionResponse>(`/api/queue/token/${token.tokenId}/status`, { status: 'waiting' })
        onAction(`${token.tokenLabel} returned to waiting.`, true)
      } catch (err) {
        onAction(err instanceof Error ? err.message : 'Error', false)
      }
    })
  }

  const isTerminal = TERMINAL_STATUSES.includes(token.status)
  const isMyToken  = token.assignedStylistId === activeStylistId

  return (
    <tr className="border-b border-cream-dark last:border-0 hover:bg-cream/40 transition-colors">
      <td className="px-4 py-3">
        <span className="font-mono text-sm font-semibold text-sage">{token.tokenLabel}</span>
      </td>
      <td className="px-4 py-3">
        <span className="font-body text-sm text-charcoal">{token.customerName}</span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="font-body text-sm text-charcoal-soft">{token.serviceName}</span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="font-body text-xs text-muted">{token.stylistName}</span>
      </td>
      <td className="px-4 py-3"><StatusBadge status={token.status} /></td>
      <td className="px-4 py-3">
        {!isTerminal && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {token.status === 'called' && isMyToken && (
              <>
                <ActionBtn onClick={markInService} loading={busy} variant="primary">
                  <PhoneCall size={11} /> In Service
                </ActionBtn>
                <ActionBtn onClick={returnToWaiting} loading={busy}>Return</ActionBtn>
              </>
            )}
            {token.status === 'in_service' && isMyToken && (
              <ActionBtn onClick={markCompleted} loading={busy} variant="primary">
                <CheckCircle2 size={11} /> Complete
              </ActionBtn>
            )}
            {(token.status === 'waiting' || token.status === 'called') && isMyToken && (
              <ActionBtn onClick={markNoShow} loading={busy} variant="danger">
                <UserX size={11} /> No Show
              </ActionBtn>
            )}
            {!isMyToken && !isTerminal && token.status === 'waiting' && (
              <span className="font-body text-xs text-muted italic">—</span>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function StaffDashboard({ stylistId, stylistName, onLogout }: {
  stylistId: string; stylistName: string; onLogout: () => void
}) {
  const [tokens, setTokens]   = useState<ApiToken[]>([])
  const [filter, setFilter]   = useState<FilterTab>('all')
  const [toast, setToast]     = useState<{ msg: string; ok: boolean } | null>(null)
  const [calling, setCalling] = useState(false)
  const [loadErr, setLoadErr] = useState('')

  const fetchQueue = useCallback(async () => {
    try {
      const { snapshot } = await api.get<QueueSnapshotResponse>('/api/queue')
      setTokens(snapshot)
      setLoadErr('')
    } catch {
      setLoadErr('Could not load queue. Retrying…')
    }
  }, [])

  useEffect(() => {
    fetchQueue()

    function handleUpdate({ snapshot }: { snapshot: ApiToken[] }) {
      setTokens(snapshot)
    }
    socket.on('queue:updated', handleUpdate)
    return () => { socket.off('queue:updated', handleUpdate) }
  }, [fetchQueue])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  function handleAction(msg: string, ok: boolean) { setToast({ msg, ok }) }

  async function handleCallNext() {
    setCalling(true)
    try {
      await api.post<CallNextResponse>('/api/queue/call-next', {})
      setToast({ msg: 'Next customer called.', ok: true })
    } catch (err) {
      setToast({ msg: err instanceof Error ? err.message : 'Error', ok: false })
    } finally {
      setCalling(false)
    }
  }

  async function handleLogout() {
    await api.post('/api/auth/staff/logout', {}).catch(() => null)
    onLogout()
  }

  const countOf = (s: TokenStatus) => tokens.filter(t => t.status === s).length
  const waiting    = countOf('waiting')
  const called     = countOf('called')
  const inService  = countOf('in_service')
  const completed  = countOf('completed')
  const totalToday = tokens.length

  const filtered = filter === 'all' ? tokens : tokens.filter(t => t.status === filter)

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all',        label: 'All' },
    { key: 'waiting',    label: 'Waiting' },
    { key: 'called',     label: 'Called' },
    { key: 'in_service', label: 'In Service' },
    { key: 'completed',  label: 'Completed' },
  ]

  return (
    <div className="min-h-screen bg-ivory">
      <div className="page-container py-10">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-champagne mb-1">
              Staff Panel
            </p>
            <h1 className="font-heading text-h1 text-charcoal">Queue Dashboard</h1>
            <p className="font-body text-sm text-muted mt-1">Signed in as <strong className="text-charcoal">{stylistName}</strong></p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button type="button" onClick={handleCallNext}
              disabled={calling || waiting === 0}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg',
                'font-body text-sm font-semibold text-white bg-sage hover:bg-sage-dark',
                'transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {calling
                ? <Loader2 size={15} className="animate-spin" />
                : <PhoneCall size={15} strokeWidth={1.5} />
              }
              Call Next
            </button>
            <button type="button" onClick={fetchQueue}
              className="p-2.5 rounded-lg bg-cream border border-cream-dark text-muted hover:bg-cream-dark transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw size={15} strokeWidth={1.5} />
            </button>
            <button type="button" onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg
                         font-body text-sm text-charcoal-soft bg-cream border border-cream-dark
                         hover:bg-cream-dark transition-colors"
            >
              <LogOut size={14} strokeWidth={1.5} /> Sign out
            </button>
          </div>
        </div>

        {loadErr && (
          <div className="mb-6 bg-error-light border border-error/30 rounded-xl px-5 py-3">
            <p className="font-body text-sm text-error">{loadErr}</p>
          </div>
        )}

        {toast && (
          <div className={cn(
            'mb-6 px-5 py-3 rounded-xl border font-body text-sm',
            toast.ok ? 'bg-success-light border-sage/30 text-success' : 'bg-error-light border-error/30 text-error',
          )} role="alert">
            {toast.msg}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total today" value={totalToday} />
          <StatCard label="Waiting"     value={waiting} />
          <StatCard label="Called"      value={called} />
          <StatCard label="In Service"  value={inService} accent />
          <StatCard label="Completed"   value={completed} />
        </div>

        <div className="flex gap-1 mb-5 flex-wrap">
          {TABS.map(tab => (
            <button key={tab.key} type="button" onClick={() => setFilter(tab.key)}
              className={cn(
                'px-4 py-2 rounded-lg font-body text-sm font-medium transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-sage',
                filter === tab.key
                  ? 'bg-sage text-white'
                  : 'bg-cream text-charcoal-soft border border-cream-dark hover:bg-cream-dark',
              )}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({tokens.filter(t => t.status === tab.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-cream-dark shadow-elevated overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-heading text-h3 text-charcoal mb-2">Queue is empty</p>
              <p className="font-body text-sm text-muted">No customers match this filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-cream border-b border-cream-dark">
                    {['Token','Customer','Service','Stylist','Status','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-muted uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(token => (
                    <TokenRow key={token.tokenId} token={token}
                      activeStylistId={stylistId} onAction={handleAction} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// ─── Page root — handles login gate ──────────────────────────────────────────

export default function StaffPage() {
  const [stylists, setStylists] = useState<ApiStylist[]>([])
  const [session, setSession]   = useState<{ id: string; name: string } | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  // Load stylists and check existing session in parallel on mount
  useEffect(() => {
    Promise.all([
      api.get<ApiStylist[]>('/api/stylists'),
      api.get<{ stylistId: string; stylistName: string }>('/api/auth/staff/me').catch(() => null),
    ]).then(([stys, me]) => {
      setStylists(stys)
      if (me) setSession({ id: me.stylistId, name: me.stylistName })
    }).finally(() => setCheckingSession(false))
  }, [])

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-sage" />
      </div>
    )
  }

  if (!session) {
    return (
      <StaffLogin
        stylists={stylists}
        onLogin={s => setSession({ id: s.id, name: s.name })}
      />
    )
  }

  return (
    <StaffDashboard
      stylistId={session.id}
      stylistName={session.name}
      onLogout={() => setSession(null)}
    />
  )
}
