import { useEffect, useState, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Ticket, Search } from 'lucide-react'
import { api } from '@/lib/api'
import { socket } from '@/lib/socket'
import type { ApiToken, QueueSnapshotResponse } from '@/data/apiTypes'
import TokenStatusCard    from '@/components/track/TokenStatusCard'
import QueuePositionPanel from '@/components/track/QueuePositionPanel'
import StatusBanner       from '@/components/track/StatusBanner'
import { TERMINAL_STATUSES } from '@/components/ui/StatusBadge'
import { cn } from '@/lib/cn'

// ApiToken is compatible with TrackingToken for the sub-components
// (same field names, same status values).

type LoadState = 'loading' | 'found' | 'not_found' | 'error'

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function TrackPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return <TokenLookup />
  return <TrackingView tokenId={id} />
}

// ─── Token lookup ─────────────────────────────────────────────────────────────

function TokenLookup() {
  const navigate = useNavigate()
  const [input, setInput]       = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError]       = useState('')

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    const value = input.trim()
    if (!value) { setError('Please enter your token number or tracking ID.'); return }

    setChecking(true)
    setError('')

    try {
      // 1. Try as UUID (direct token ID from confirmation link)
      let found: ApiToken | null = null
      try {
        found = await api.get<ApiToken>(`/api/queue/token/${value}`)
      } catch {
        found = null
      }

      // 2. Fall back to label search — fetch today's queue and scan tokenLabel
      if (!found) {
        const { snapshot } = await api.get<QueueSnapshotResponse>('/api/queue')
        const upper = value.toUpperCase()
        found = snapshot.find(t => t.tokenLabel.toUpperCase() === upper) ?? null
      }

      if (found) {
        navigate(`/track/${found.tokenId}`)
      } else {
        setError('No token found. Check your token number (e.g. A-01) or the tracking link from your confirmation.')
      }
    } catch {
      setError('Could not reach the server. Please check your connection.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="page-container py-12 md:py-16">
        <Link to="/" className="inline-flex items-center gap-2 font-body text-sm text-charcoal-soft
                                hover:text-charcoal transition-colors duration-150 mb-8">
          <ArrowLeft size={15} strokeWidth={1.5} />
          Back to home
        </Link>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-full bg-success-light flex items-center justify-center mx-auto mb-5">
              <Ticket size={26} strokeWidth={1.5} className="text-sage" />
            </div>
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-champagne mb-3">
              Queue Tracker
            </p>
            <h1 className="font-heading text-h1 text-charcoal leading-tight mb-3">Track Your Token</h1>
            <p className="font-body text-sm text-charcoal-soft leading-relaxed">
              Enter your token number (e.g. <span className="font-mono">A-01</span>) or
              paste the full tracking ID from your confirmation page.
            </p>
          </div>

          <form onSubmit={handleLookup} noValidate>
            <div className="bg-white rounded-xl border border-cream-dark shadow-elevated p-6">
              <div className="flex flex-col gap-1.5 mb-5">
                <label htmlFor="token-lookup-id" className="font-body text-sm font-medium text-charcoal-soft">
                  Token number or tracking ID
                </label>
                <input
                  id="token-lookup-id" type="text" value={input}
                  onChange={(e) => { setInput(e.target.value); setError('') }}
                  placeholder="e.g. A-01"
                  autoComplete="off" spellCheck={false} disabled={checking}
                  aria-describedby={error ? 'lookup-error' : 'lookup-hint'}
                  aria-invalid={!!error}
                  className={cn(
                    'w-full bg-cream border rounded-lg px-4 py-3',
                    'font-mono text-sm text-charcoal placeholder:text-muted placeholder:font-body',
                    'shadow-inset transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage disabled:opacity-50',
                    error ? 'border-error' : 'border-cream-dark',
                  )}
                />
                {error
                  ? <p id="lookup-error" role="alert" className="font-body text-xs text-error">{error}</p>
                  : <p id="lookup-hint" className="font-body text-xs text-muted">
                      Enter your token number or paste the full tracking ID from your confirmation.
                    </p>
                }
              </div>

              <button type="submit" disabled={checking}
                className={cn(
                  'w-full inline-flex items-center justify-center gap-2',
                  'px-6 py-3 rounded-lg font-body text-sm font-semibold',
                  'bg-sage text-white hover:bg-sage-dark transition-colors duration-150',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                )}
              >
                {checking
                  ? <RefreshCw size={15} className="animate-spin" aria-hidden="true" />
                  : <Search size={15} strokeWidth={1.5} aria-hidden="true" />
                }
                {checking ? 'Looking up…' : 'Find My Token'}
              </button>
            </div>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-cream-dark" />
            <span className="font-body text-xs text-muted">or</span>
            <div className="flex-1 h-px bg-cream-dark" />
          </div>

          <div className="text-center">
            <p className="font-body text-sm text-charcoal-soft mb-4">Haven't joined the queue yet?</p>
            <Link to="/join"
              className="inline-flex items-center justify-center gap-2
                         px-6 py-3 rounded-lg font-body text-sm font-semibold
                         bg-cream text-charcoal border border-cream-dark hover:bg-cream-dark
                         transition-colors duration-150
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
            >
              <Ticket size={15} strokeWidth={1.5} />
              Join the Queue
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tracking view ────────────────────────────────────────────────────────────

function TrackingView({ tokenId }: { tokenId: string }) {
  const [loadState, setLoadState]     = useState<LoadState>('loading')
  const [token, setToken]             = useState<ApiToken | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchToken = useCallback(() => {
    return api.get<ApiToken>(`/api/queue/token/${tokenId}`)
  }, [tokenId])

  // Initial load
  useEffect(() => {
    setLoadState('loading')
    setToken(null)
    fetchToken()
      .then(t => { setToken(t); setLastUpdated(new Date()); setLoadState('found') })
      .catch((err: Error) => {
        if (err.message?.includes('404') || err.message?.toLowerCase().includes('not found')) {
          setLoadState('not_found')
        } else {
          setLoadState('error')
        }
      })
  }, [fetchToken])

  // Socket.IO subscription — join token room, listen for queue:updated
  useEffect(() => {
    if (loadState !== 'found') return

    socket.emit('track:join', tokenId)

    function handleUpdate({ snapshot }: { snapshot: ApiToken[] }) {
      const updated = snapshot.find(t => t.tokenId === tokenId)
      if (updated) {
        setToken(updated)
        setLastUpdated(new Date())
      }
    }

    socket.on('queue:updated', handleUpdate)
    return () => {
      socket.off('queue:updated', handleUpdate)
      socket.emit('track:leave', tokenId)
    }
  }, [loadState, tokenId])

  function handleRefresh() {
    setLoadState('loading')
    fetchToken()
      .then(t => { setToken(t); setLastUpdated(new Date()); setLoadState('found') })
      .catch(() => setLoadState('error'))
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="page-container py-12 md:py-16">
        <Link to="/track"
          className="inline-flex items-center gap-2 font-body text-sm text-charcoal-soft
                     hover:text-charcoal transition-colors duration-150 mb-8"
        >
          <ArrowLeft size={15} strokeWidth={1.5} />
          Look up a different token
        </Link>

        <div className="mb-8">
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-champagne mb-2">
            Queue Tracker
          </p>
          <h1 className="font-heading text-h1 text-charcoal leading-tight">Track Your Position</h1>
        </div>

        {loadState === 'loading' && <LoadingSkeleton />}
        {loadState === 'not_found' && <NotFoundState tokenId={tokenId} />}
        {loadState === 'error' && <ErrorState onRetry={handleRefresh} />}

        {loadState === 'found' && token !== null && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
            <div className="flex flex-col gap-5">
              <StatusBanner status={token.status} cancelledReason={token.cancelledReason} />
              <QueuePositionPanel token={token} />

              <div className="bg-cream rounded-lg border border-cream-dark px-4 py-3">
                <p className="font-body text-xs text-muted leading-relaxed">
                  <span className="font-semibold text-charcoal-soft">Live updates: </span>
                  This page receives real-time updates via Socket.IO when your queue position changes.
                </p>
                {lastUpdated && (
                  <p className="font-body text-xs text-muted mt-1">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>

              {TERMINAL_STATUSES.includes(token.status) && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/join"
                    className="flex-1 inline-flex items-center justify-center gap-2
                               px-6 py-3 rounded-lg font-body text-sm font-semibold
                               bg-sage text-white hover:bg-sage-dark transition-colors duration-150
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
                  >
                    <Ticket size={15} strokeWidth={1.5} />
                    Join queue again
                  </Link>
                  <Link to="/"
                    className="flex-1 inline-flex items-center justify-center gap-2
                               px-6 py-3 rounded-lg font-body text-sm font-semibold
                               bg-cream text-charcoal border border-cream-dark hover:bg-cream-dark
                               transition-colors duration-150
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
                  >
                    Back to home
                  </Link>
                </div>
              )}
            </div>

            <div className="lg:sticky lg:top-24 flex flex-col gap-4">
              <TokenStatusCard token={token} />
              {!TERMINAL_STATUSES.includes(token.status) && (
                <button type="button" onClick={handleRefresh}
                  className="w-full inline-flex items-center justify-center gap-2
                             px-5 py-2.5 rounded-lg font-body text-sm font-medium
                             bg-cream text-charcoal-soft border border-cream-dark hover:bg-cream-dark
                             transition-colors duration-150
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
                >
                  <RefreshCw size={14} strokeWidth={1.5} />
                  Refresh now
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 animate-pulse">
      <div className="flex flex-col gap-5">
        <div className="h-20 rounded-xl bg-cream-dark" />
        <div className="h-36 rounded-xl bg-cream-dark" />
      </div>
      <div className="h-96 rounded-2xl bg-cream-dark" />
    </div>
  )
}

function NotFoundState({ tokenId }: { tokenId: string }) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="w-16 h-16 rounded-full bg-cream-dark flex items-center justify-center mx-auto mb-6">
        <Ticket size={28} strokeWidth={1.5} className="text-muted" />
      </div>
      <h2 className="font-heading text-h2 text-charcoal mb-3">Token not found</h2>
      <p className="font-body text-sm text-charcoal-soft leading-relaxed mb-2">
        We couldn't find a queue token matching this link.
      </p>
      <p className="font-mono text-xs text-muted bg-cream rounded px-3 py-1.5 inline-block mb-6 break-all">
        {tokenId}
      </p>
      <p className="font-body text-sm text-charcoal-soft leading-relaxed mb-8">
        The token may have expired or the link may be incorrect.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/track"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                     font-body text-sm font-semibold bg-cream text-charcoal border border-cream-dark
                     hover:bg-cream-dark transition-colors duration-150
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
        >
          Try a different ID
        </Link>
        <Link to="/join"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                     font-body text-sm font-semibold bg-sage text-white hover:bg-sage-dark
                     transition-colors duration-150
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
        >
          <Ticket size={15} strokeWidth={1.5} />
          Join the queue
        </Link>
      </div>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="w-16 h-16 rounded-full bg-error-light flex items-center justify-center mx-auto mb-6">
        <RefreshCw size={28} strokeWidth={1.5} className="text-error" />
      </div>
      <h2 className="font-heading text-h2 text-charcoal mb-3">Something went wrong</h2>
      <p className="font-body text-sm text-charcoal-soft leading-relaxed mb-8">
        We couldn't load your queue information. Please check your connection and try again.
      </p>
      <button type="button" onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                   font-body text-sm font-semibold bg-sage text-white hover:bg-sage-dark
                   transition-colors duration-150
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
      >
        <RefreshCw size={15} strokeWidth={1.5} />
        Try again
      </button>
    </div>
  )
}
