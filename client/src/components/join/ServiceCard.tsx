import { Clock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { type Service, formatPrice, formatDuration } from '@/data/mockData'

interface ServiceCardProps {
  service: Service
  selected: boolean
  onSelect: (id: string) => void
}

export default function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(service.id)}
      className={cn(
        'w-full text-left rounded-lg border p-4 transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2',
        selected
          ? 'border-sage bg-success-light shadow-card'
          : 'border-cream-dark bg-cream hover:border-sage-light hover:shadow-card',
      )}
      aria-pressed={selected}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading text-[1.125rem] text-charcoal leading-snug">
              {service.name}
            </span>
            {service.popular && (
              <span className="inline-flex items-center rounded-full bg-warning-light text-champagne
                               px-2.5 py-0.5 text-[10px] font-semibold font-body uppercase tracking-wide">
                Popular
              </span>
            )}
          </div>
          <p className="font-body text-sm text-charcoal-soft mt-1 leading-relaxed">
            {service.description}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <span className="font-heading text-[1.0625rem] font-medium text-sage">
              {formatPrice(service.price)}
            </span>
            <span className="flex items-center gap-1 font-body text-sm text-muted">
              <Clock size={13} strokeWidth={1.5} />
              {formatDuration(service.durationMinutes)}
            </span>
          </div>
        </div>

        {/* Selection indicator */}
        <div
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 transition-colors duration-150',
            selected
              ? 'border-sage bg-sage'
              : 'border-cream-dark bg-white',
          )}
          aria-hidden="true"
        >
          {selected && (
            <CheckCircle2 size={16} className="text-white -m-px" strokeWidth={2.5} />
          )}
        </div>
      </div>
    </button>
  )
}
