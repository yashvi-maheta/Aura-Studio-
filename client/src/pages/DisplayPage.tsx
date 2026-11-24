import { useEffect, useState, useCallback } from 'react'
import { Scissors } from 'lucide-react'
import { api } from '@/lib/api'
import { socket } from '@/lib/socket'
import type { ApiToken, QueueSnapshotResponse } from '@/data/apiTypes'
import { cn } from '@/lib/cn'

export default function DisplayPage() {
  const [tokens, setTokens]   = useState<ApiToken[]>([])
  const [clock, setClock]     = useState(() => new Date())

  const fetchQueue = useCallback(async () => {
    try {
      const { snapshot } = await api.get<QueueSnapshotResponse>('/api/queue')
      setTokens(snapshot)
    } catch {
      // silent — display retries via socket or manual refresh
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

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  const serving  = tokens.filter(t => t.status === 'in_service')
  const called   = tokens.filter(t => t.status === 'called')
  const waiting  = tokens.filter(t => t.status === 'waiting')
  const upcoming = [...called, ...waiting].slice(0, 5)
  const primary  = serving[0] ?? called[0] ?? null

  return (
    <div className="min-h-screen bg-forest text-white flex flex-col">

      {/* Top bar */}
      <header className="border-b border-white/10 px-8 py-4 flex items-center gap-3">
        <span className="w-9 h-9 rounded-full bg-sage flex items-center justify-center flex-shrink-0">
          <Scissors size={16} className="text-white" strokeWidth={1.5} />
        </span>
        <span className="font-heading text-[1.375rem] font-medium text-white tracking-wide">
          Aura Studio
        </span>
        <span className="ml-auto font-body text-sm text-white/50">
          {clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col lg:flex-row gap-0">

        {/* Now serving */}
        <section className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-sage-light/70 mb-6">
            Now Serving
          </p>

          {primary ? (
            <>
              <div
                className="font-mono leading-none font-semibold tracking-tight text-sage-light"
                style={{ fontSize: 'clamp(5rem, 18vw, 11rem)' }}
              >
                {primary.tokenLabel}
              </div>

              <p className="font-heading mt-6 text-white/90"
                 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                {primary.customerName}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-white/60">
                <span className="font-body text-lg">{primary.serviceName}</span>
                <span className="w-1 h-1 rounded-full bg-white/30" aria-hidden="true" />
                <span className="font-body text-lg">{primary.stylistName}</span>
              </div>

              <div className="mt-5 inline-flex items-center gap-2 bg-white/10 rounded-full px-5 py-2">
                <span className="w-2 h-2 rounded-full bg-sage animate-pulse" aria-hidden="true" />
                <span className="font-body text-sm text-white/80">
                  {primary.status === 'in_service' ? 'In Service' : 'Called — please come to the desk'}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="font-heading font-light text-white/30"
                   style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}>
                Welcome
              </div>
              <p className="font-body text-white/50 text-lg max-w-xs leading-relaxed text-center">
                No customers are currently being served.
              </p>
              {waiting.length > 0 && (
                <p className="font-body text-white/40 text-sm mt-2">
                  {waiting.length} customer{waiting.length > 1 ? 's' : ''} waiting
                </p>
              )}
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-white/10 my-8" aria-hidden="true" />
        <div className="lg:hidden h-px bg-white/10 mx-8" aria-hidden="true" />

        {/* Up next */}
        <section className="lg:w-80 xl:w-96 px-8 py-10 flex flex-col">
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-white/40 mb-6">
            Up Next
          </p>

          {upcoming.length === 0 ? (
            <p className="font-body text-white/30 text-sm">No one waiting.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map((t, i) => (
                <div key={t.tokenId}
                  className={cn(
                    'flex items-center gap-4 rounded-xl px-5 py-4',
                    i === 0 ? 'bg-white/10' : 'bg-white/5',
                  )}
                >
                  <span className="font-mono text-2xl font-semibold text-sage-light w-16 flex-shrink-0">
                    {t.tokenLabel}
                  </span>
                  <div className="min-w-0">
                    <p className="font-body text-sm font-medium text-white/90 truncate">
                      {t.customerName}
                    </p>
                    <p className="font-body text-xs text-white/40 truncate mt-0.5">
                      {t.serviceName}
                    </p>
                  </div>
                  {t.status === 'called' && (
                    <span className="ml-auto flex-shrink-0 text-champagne font-body text-xs font-semibold uppercase">
                      Called
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto pt-10">
            <p className="font-body text-xs text-white/20 text-center leading-relaxed">
              Thank you for choosing Aura Studio.
            </p>
          </div>
        </section>

      </main>
    </div>
  )
}
