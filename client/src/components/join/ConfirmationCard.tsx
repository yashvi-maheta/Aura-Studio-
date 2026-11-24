import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, ArrowRight, User } from 'lucide-react'
import { type JoinQueueResult } from '@/data/mockData'

interface ConfirmationCardProps {
  result: JoinQueueResult
  customerName: string
}

export default function ConfirmationCard({ result, customerName }: ConfirmationCardProps) {
  const waitLabel =
    result.estimatedWaitMinutes === 0
      ? "You're next!"
      : `approx. ${result.estimatedWaitMinutes} min`

  return (
    <div className="w-full max-w-md mx-auto">

      {/* Success header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-success-light flex items-center justify-center mb-4">
          <CheckCircle2 size={28} className="text-success" strokeWidth={1.5} />
        </div>
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-champagne mb-2">
          You're in the queue
        </p>
        <h2 className="font-heading text-h1 text-charcoal">Welcome, {customerName}!</h2>
        <p className="font-body text-sm text-charcoal-soft mt-2">
          Your spot is reserved. Keep this page open to track your position.
        </p>
      </div>

      {/* Token card */}
      <div className="bg-white rounded-xl border border-cream-dark shadow-elevated p-6 mb-5">

        {/* Token number — large mono */}
        <div className="flex flex-col items-center py-6 border-b border-cream-dark mb-6">
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-muted mb-3">
            Your Token
          </p>
          <span
            className="font-mono text-[3.5rem] font-semibold leading-none tracking-tight"
            style={{ color: '#849477' }}   /* sage */
          >
            {result.tokenLabel}
          </span>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-body text-xs text-muted uppercase tracking-wide mb-1">Queue position</p>
            <p className="font-body text-sm font-semibold text-charcoal">#{result.position}</p>
          </div>
          <div>
            <p className="font-body text-xs text-muted uppercase tracking-wide mb-1">Est. wait</p>
            <p className="font-body text-sm font-semibold text-charcoal flex items-center gap-1">
              <Clock size={13} strokeWidth={1.5} className="text-sage" />
              {waitLabel}
            </p>
          </div>
          <div>
            <p className="font-body text-xs text-muted uppercase tracking-wide mb-1">Service</p>
            <p className="font-body text-sm font-semibold text-charcoal">{result.serviceName}</p>
          </div>
          <div>
            <p className="font-body text-xs text-muted uppercase tracking-wide mb-1">Stylist</p>
            <p className="font-body text-sm font-semibold text-charcoal flex items-center gap-1">
              <User size={13} strokeWidth={1.5} className="text-sage" />
              {result.stylistName}
            </p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-warning-light border border-champagne/30 rounded-lg px-4 py-3 mb-6">
        <p className="font-body text-sm text-charcoal-soft leading-relaxed">
          <span className="font-semibold text-charcoal">Keep this page open</span> to receive
          live updates when it's nearly your turn.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Link
          to={`/track/${result.tokenId}`}
          className="w-full inline-flex items-center justify-center gap-2
                     px-7 py-3 text-[15px] font-semibold font-body rounded
                     bg-sage text-white hover:bg-sage-dark transition-colors duration-150
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
        >
          Track My Position
          <ArrowRight size={16} strokeWidth={1.5} />
        </Link>
        <Link
          to="/"
          className="w-full inline-flex items-center justify-center gap-2
                     px-7 py-3 text-[15px] font-semibold font-body rounded
                     bg-cream text-charcoal border border-cream-dark hover:bg-cream-dark
                     transition-colors duration-150
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
        >
          Back to Home
        </Link>
      </div>

    </div>
  )
}
