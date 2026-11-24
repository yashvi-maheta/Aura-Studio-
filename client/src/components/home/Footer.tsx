import { Scissors, MapPin, Phone, Clock } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-charcoal text-white/80">
      <div className="page-container py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-white/10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-8 h-8 rounded-full bg-sage flex items-center justify-center">
                <Scissors size={14} className="text-white" strokeWidth={1.5} />
              </span>
              <span className="font-heading text-[1.25rem] font-medium text-white">Aura Studio</span>
            </div>
            <p className="font-body text-sm leading-relaxed text-white/60 max-w-xs">
              A premium walk-in salon where craft meets calm. No appointments needed —
              just great hair and a stress-free experience.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-body text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Services</h4>
            <ul className="flex flex-col gap-2.5">
              {['Signature Haircut', 'Colour & Highlights', 'Blowout & Style', 'Deep Conditioning', 'Beard Trim'].map((s) => (
                <li key={s}>
                  <a href="#services" className="font-body text-sm text-white/60 hover:text-white transition-colors">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-body text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Quick Links</h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'Join the Queue', href: '/join' },
                { label: 'Track My Token', href: '/track' },
                { label: 'Staff Login', href: '/staff' },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="font-body text-sm text-white/60 hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Visit Us</h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2.5">
                <MapPin size={15} strokeWidth={1.5} className="text-sage mt-0.5 flex-shrink-0" />
                <span className="font-body text-sm text-white/60">14 Bloom Street,<br />Dublin 2, Ireland</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} strokeWidth={1.5} className="text-sage flex-shrink-0" />
                <span className="font-body text-sm text-white/60">+353 1 234 5678</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock size={15} strokeWidth={1.5} className="text-sage mt-0.5 flex-shrink-0" />
                <span className="font-body text-sm text-white/60">Mon–Sat 9:00–19:00<br />Sun 10:00–17:00</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body text-white/40">
          <p>© {year} Aura Studio. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Designed with care · MSc IT Project
          </p>
        </div>
      </div>
    </footer>
  )
}
