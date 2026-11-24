import { cn } from '@/lib/cn'

/**
 * TokenStatus — canonical status values used everywhere in the project.
 * This is the single source of truth. Import this type wherever a status
 * value is stored, compared or rendered. Do NOT define a local copy.
 *
 * Transitions:
 *   waiting → called → in_service → completed
 *   called  → waiting  (return to queue)
 *   waiting | called → no_show | cancelled
 */
export type TokenStatus =
  | 'waiting'
  | 'called'
  | 'in_service'
  | 'completed'
  | 'no_show'
  | 'cancelled'

/** Terminal statuses — no further transitions allowed. */
export const TERMINAL_STATUSES: TokenStatus[] = ['completed', 'no_show', 'cancelled']

interface StatusBadgeProps {
  status: TokenStatus
  className?: string
}

const config: Record<TokenStatus, { label: string; classes: string }> = {
  waiting:    { label: 'Waiting',    classes: 'bg-[#F5F0E8] text-[#8A7A66]' },
  called:     { label: 'Called',     classes: 'bg-warning-light text-champagne' },
  in_service: { label: 'In Service', classes: 'bg-success-light text-success' },
  completed:  { label: 'Completed',  classes: 'bg-cream-dark text-muted' },
  no_show:    { label: 'No Show',    classes: 'bg-error-light text-error' },
  cancelled:  { label: 'Cancelled',  classes: 'bg-error-light text-error' },
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, classes } = config[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium font-body uppercase tracking-wide',
        classes,
        className,
      )}
    >
      {label}
    </span>
  )
}
