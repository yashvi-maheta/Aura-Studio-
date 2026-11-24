import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Scissors } from 'lucide-react'
import { cn } from '@/lib/cn'

const navLinks = [
  { label: 'Services', href: '/#services' },
  { label: 'Our Team', href: '/#team' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-sm border-b border-cream-dark">
      <nav className="page-container h-16 flex items-center justify-between gap-6">

        {/* Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage rounded"
          onClick={() => setOpen(false)}
        >
          <span className="w-8 h-8 rounded-full bg-sage flex items-center justify-center flex-shrink-0">
            <Scissors size={14} className="text-white" strokeWidth={1.5} />
          </span>
          <span className="font-heading text-[1.375rem] font-medium text-charcoal leading-none tracking-wide">
            Aura Studio
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'font-body text-sm transition-colors duration-150',
                location.pathname === link.href
                  ? 'text-sage font-medium'
                  : 'text-charcoal-soft hover:text-charcoal',
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/track"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-body font-medium rounded
                       bg-cream text-charcoal border border-cream-dark hover:bg-cream-dark
                       transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
          >
            Track My Token
          </Link>
          <Link
            to="/join"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-body font-medium rounded
                       bg-sage text-white hover:bg-sage-dark
                       transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
          >
            Join Queue
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 -mr-2 rounded text-charcoal-soft hover:bg-cream transition-colors
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-cream-dark bg-ivory">
          <div className="page-container py-5 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-body text-sm text-charcoal-soft hover:text-charcoal py-1"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-3 border-t border-cream-dark">
              <Link
                to="/track"
                onClick={() => setOpen(false)}
                className="w-full inline-flex items-center justify-center px-7 py-3 text-[15px] font-semibold font-body rounded
                           bg-cream text-charcoal border border-cream-dark hover:bg-cream-dark transition-colors duration-150"
              >
                Track My Token
              </Link>
              <Link
                to="/join"
                onClick={() => setOpen(false)}
                className="w-full inline-flex items-center justify-center px-7 py-3 text-[15px] font-semibold font-body rounded
                           bg-sage text-white hover:bg-sage-dark transition-colors duration-150"
              >
                Join Queue
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
