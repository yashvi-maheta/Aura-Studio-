import { cn } from '@/lib/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  elevated?: boolean
  hoverable?: boolean
}

export default function Card({ children, className, elevated = false, hoverable = false }: CardProps) {
  return (
    <div
      className={cn(
        elevated
          ? 'bg-white rounded-xl border border-cream-dark shadow-elevated'
          : 'bg-cream rounded-lg border border-cream-dark shadow-card',
        hoverable && 'transition-shadow duration-200 hover:shadow-card-hover cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  )
}
