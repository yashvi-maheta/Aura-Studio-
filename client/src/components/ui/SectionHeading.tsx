import { cn } from '@/lib/cn'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  centered?: boolean
  className?: string
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  centered = false,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(centered && 'text-center', className)}>
      {eyebrow && (
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-champagne mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-heading text-h2 text-charcoal leading-tight">{title}</h2>
      {subtitle && (
        <p className="mt-4 font-body text-body-lg text-charcoal-soft max-w-xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}
