import { Users } from 'lucide-react'
import { type TrackingToken } from '@/data/mockTrackingData'

interface QueuePositionPanelProps {
  token: TrackingToken
}

export default function QueuePositionPanel({ token }: QueuePositionPanelProps) {
  const isTerminal = ['completed', 'no_show', 'cancelled'].includes(token.status)
  if (isTerminal) return null

  // Build a small visual queue strip: show up to 5 dots
  const visibleAhead = Math.min(token.customersAhead, 4)
  const hasMore      = token.customersAhead > 4

  return (
    <div className="bg-cream rounded-xl border border-cream-dark shadow-card px-6 py-5">
      <div className="flex items-center gap-2 mb-4">
        <Users size={16} strokeWidth={1.5} className="text-sage" />
        <h3 className="font-body text-sm font-semibold text-charcoal">Queue position</h3>
      </div>

      {/* Visual queue strip */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Customers ahead */}
        {Array.from({ length: visibleAhead }).map((_, i) => (
          <div
            key={i}
            className="w-9 h-9 rounded-full bg-cream-dark border border-taupe/30 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="font-body text-xs text-muted">{i + 1}</span>
          </div>
        ))}

        {/* Overflow indicator */}
        {hasMore && (
          <div
            className="w-9 h-9 rounded-full bg-cream-dark border border-taupe/30 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="font-body text-xs text-muted">+{token.customersAhead - 4}</span>
          </div>
        )}

        {/* This customer — always last */}
        <div
          className="w-9 h-9 rounded-full bg-sage border-2 border-sage-dark flex items-center justify-center"
          aria-label="Your position"
        >
          <span className="font-body text-xs font-semibold text-white">You</span>
        </div>
      </div>

      {/* Position summary text */}
      <p className="font-body text-sm text-charcoal-soft mt-4 leading-relaxed">
        {token.customersAhead === 0
          ? "You're at the front of the queue."
          : `You are position #${token.position} — ${token.customersAhead} customer${token.customersAhead > 1 ? 's' : ''} ahead of you.`}
      </p>
    </div>
  )
}
