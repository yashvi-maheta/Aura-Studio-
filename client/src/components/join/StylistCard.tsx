import { cn } from '@/lib/cn'
import { type Stylist } from '@/data/mockData'

interface StylistCardProps {
  stylist: Stylist | null   // null = "Any Available" option
  selected: boolean
  onSelect: (id: string | null) => void
}

export default function StylistCard({ stylist, selected, onSelect }: StylistCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(stylist === null ? null : stylist.id)}
      className={cn(
        'w-full text-left rounded-lg border p-4 transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2',
        selected
          ? 'border-sage bg-success-light shadow-card'
          : 'border-cream-dark bg-cream hover:border-sage-light hover:shadow-card',
      )}
      aria-pressed={selected}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            'font-body text-sm font-semibold',
            selected
              ? 'bg-sage text-white'
              : 'bg-cream-dark text-charcoal-soft',
          )}
          aria-hidden="true"
        >
          {stylist === null ? '✦' : stylist.avatarInitials}
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm font-semibold text-charcoal leading-snug">
            {stylist === null ? 'Any Available Stylist' : stylist.name}
          </p>
          <p className="font-body text-xs text-muted mt-0.5">
            {stylist === null ? 'Assigned automatically — shortest wait' : stylist.role}
          </p>
        </div>

        {/* Radio dot */}
        <div
          className={cn(
            'flex-shrink-0 w-4 h-4 rounded-full border-2 transition-colors duration-150',
            selected ? 'border-sage bg-sage' : 'border-cream-dark bg-white',
          )}
          aria-hidden="true"
        />
      </div>
    </button>
  )
}
