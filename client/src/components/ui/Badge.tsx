import { cn } from '@/lib/cn'

type BadgeVariant = 'default' | 'sage' | 'champagne' | 'muted' | 'error'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default:   'bg-cream-dark text-charcoal-soft',
  sage:      'bg-success-light text-success',
  champagne: 'bg-warning-light text-champagne',
  muted:     'bg-cream-dark text-muted',
  error:     'bg-error-light text-error',
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium font-body uppercase tracking-wide',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
