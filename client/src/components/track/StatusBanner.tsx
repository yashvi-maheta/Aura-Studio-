import { AlertCircle, Bell, CheckCircle2, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { type TokenStatus } from '@/components/ui/StatusBadge'
import { cn } from '@/lib/cn'

interface StatusBannerProps {
  status: TokenStatus
  cancelledReason?: string
  className?: string
}

interface BannerConfig {
  icon: ReactNode
  heading: string
  body: string
  classes: string
}

function getBannerConfig(status: TokenStatus, cancelledReason?: string): BannerConfig | null {
  switch (status) {
    case 'waiting':
      return null   // no banner while quietly waiting

    case 'called':
      return {
        icon:    <Bell size={18} strokeWidth={1.5} />,
        heading: "You're almost up — get ready!",
        body:    'Please make your way to the reception desk. Your stylist will be with you shortly.',
        classes: 'bg-warning-light border-champagne/40 text-[#7A5F20]',
      }

    case 'in_service':
      return {
        icon:    <CheckCircle2 size={18} strokeWidth={1.5} />,
        heading: "It's your turn!",
        body:    'Your stylist is ready for you. Please take a seat at the styling station.',
        classes: 'bg-success-light border-sage/30 text-success',
      }

    case 'completed':
      return {
        icon:    <CheckCircle2 size={18} strokeWidth={1.5} />,
        heading: 'Service completed',
        body:    'Thank you for visiting Aura Studio. We hope to see you again soon.',
        classes: 'bg-cream-dark border-taupe/30 text-charcoal-soft',
      }

    case 'no_show':
      return {
        icon:    <AlertCircle size={18} strokeWidth={1.5} />,
        heading: 'Marked as no show',
        body:    'Your token was closed because you were not available when called. Please join the queue again if you are still at the salon.',
        classes: 'bg-error-light border-error/30 text-error',
      }

    case 'cancelled':
      return {
        icon:    <XCircle size={18} strokeWidth={1.5} />,
        heading: 'Your token has been cancelled',
        body:    cancelledReason
          ? `Reason: ${cancelledReason}`
          : 'Your token was cancelled. Please visit the reception if you need assistance.',
        classes: 'bg-error-light border-error/30 text-error',
      }
  }
}

export default function StatusBanner({ status, cancelledReason, className }: StatusBannerProps) {
  const cfg = getBannerConfig(status, cancelledReason)
  if (!cfg) return null

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border px-5 py-4',
        cfg.classes,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="flex-shrink-0 mt-0.5">{cfg.icon}</span>
      <div>
        <p className="font-body text-sm font-semibold leading-snug">{cfg.heading}</p>
        <p className="font-body text-sm mt-1 leading-relaxed opacity-80">{cfg.body}</p>
      </div>
    </div>
  )
}
