import { Clock, Scissors, User } from 'lucide-react'
import type { ReactNode } from 'react'
import StatusBadge from '@/components/ui/StatusBadge'
import { TERMINAL_STATUSES } from '@/components/ui/StatusBadge'
import { type TrackingToken, formatWait } from '@/data/mockTrackingData'
import { cn } from '@/lib/cn'

interface TokenStatusCardProps {
  token: TrackingToken
}

export default function TokenStatusCard({ token }: TokenStatusCardProps) {
  const isTerminal   = TERMINAL_STATUSES.includes(token.status)
  const isCalled     = token.status === 'called'
  const isInService  = token.status === 'in_service'

  return (
    <div className="bg-white rounded-2xl border border-cream-dark shadow-elevated overflow-hidden">

      {/* Token hero */}
      <div
        className={cn(
          'flex flex-col items-center py-10 px-6 border-b border-cream-dark relative',
          isCalled    && 'bg-warning-light',
          isInService && 'bg-success-light',
          !isCalled && !isInService && 'bg-cream',
        )}
      >
        {(isCalled || isInService) && (
          <span
            className="absolute inset-0 rounded-t-2xl animate-pulse opacity-20 pointer-events-none"
            style={{ background: isCalled ? '#C6A978' : '#849477' }}
            aria-hidden="true"
          />
        )}

        <p className="font-body text-xs font-semibold uppercase tracking-widest text-muted mb-3 relative z-10">
          Your Token
        </p>

        <span
          className={cn(
            'font-mono text-[4rem] leading-none font-semibold tracking-tight relative z-10',
            isTerminal               ? 'text-muted'     : '',
            isCalled                 ? 'text-champagne' : '',
            isInService              ? 'text-success'   : '',
            !isTerminal && !isCalled && !isInService ? 'text-sage' : '',
          )}
        >
          {token.tokenLabel}
        </span>

        <div className="mt-4 relative z-10">
          <StatusBadge status={token.status} />
        </div>
      </div>

      {/* Detail rows */}
      <div className="px-6 py-6 flex flex-col gap-4">
        <DetailRow label="Customer" value={token.customerName} />

        <div className="border-t border-cream-dark" />

        <DetailRow
          label="Service"
          value={token.serviceName}
          icon={<Scissors size={14} strokeWidth={1.5} className="text-sage" />}
          sub={`${token.serviceDurationMinutes} min`}
        />

        <DetailRow
          label="Stylist"
          value={token.stylistName}
          icon={<User size={14} strokeWidth={1.5} className="text-sage" />}
        />

        <div className="border-t border-cream-dark" />

        {!isTerminal && (
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-muted">Est. wait</span>
            <span className="flex items-center gap-1.5 font-body text-sm font-semibold text-charcoal">
              <Clock size={14} strokeWidth={1.5} className="text-sage" />
              {formatWait(token.estimatedWaitMinutes)}
            </span>
          </div>
        )}

        {!isTerminal && (
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-muted">Customers ahead</span>
            <span className="font-body text-sm font-semibold text-charcoal">
              {token.customersAhead === 0 ? "None — you're next!" : token.customersAhead}
            </span>
          </div>
        )}
      </div>

      {!isTerminal && (
        <div className="px-6 pb-5">
          <p className="font-body text-xs text-muted text-center leading-relaxed">
            Keep this page open to receive live updates.
          </p>
        </div>
      )}
    </div>
  )
}

function DetailRow({
  label, value, icon, sub,
}: {
  label: string
  value: string
  icon?: ReactNode
  sub?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="font-body text-sm text-muted flex-shrink-0">{label}</span>
      <span className="flex items-center gap-1.5 font-body text-sm font-medium text-charcoal text-right">
        {icon}
        <span>
          {value}
          {sub && <span className="block font-normal text-xs text-muted mt-0.5">{sub}</span>}
        </span>
      </span>
    </div>
  )
}
