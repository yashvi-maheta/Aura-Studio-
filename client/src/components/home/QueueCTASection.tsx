import { Link } from 'react-router-dom'
import { ArrowRight, Ticket } from 'lucide-react'

const steps = [
  { n: '01', label: 'Choose your service',   sub: 'Browse our full menu and pick what you need.' },
  { n: '02', label: 'Register your name',    sub: 'No account, no password — just your name.' },
  { n: '03', label: 'Get your token',        sub: 'Receive a unique code and a live tracking link.' },
  { n: '04', label: "Return when it's time", sub: 'We\'ll show your position in real time.' },
]

export default function QueueCTASection() {
  return (
    <section className="section-padding bg-forest">
      <div className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — headline */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-sage-light mb-4">
              Skip the Uncertainty
            </p>
            <h2 className="font-heading text-h1 font-light text-white leading-tight mb-5">
              Join our queue in<br />under 30 seconds
            </h2>
            <p className="font-body text-body-lg leading-relaxed max-w-md" style={{ color: 'rgba(184,195,174,0.8)' }}>
              Select your service, tell us your name and receive a unique token instantly.
              Your place is held — browse town and return when it's your turn.
            </p>
          </div>

          {/* Right — steps + CTAs */}
          <div className="flex flex-col gap-5">
            {steps.map((step) => (
              <div key={step.n} className="flex items-start gap-4">
                <span className="flex-shrink-0 w-9 h-9 rounded-full border border-sage/40 flex items-center justify-center
                                 font-mono text-xs font-semibold text-sage">
                  {step.n}
                </span>
                <div>
                  <p className="font-body text-sm font-semibold text-white">{step.label}</p>
                  <p className="font-body text-sm mt-0.5" style={{ color: 'rgba(184,195,174,0.7)' }}>{step.sub}</p>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-4 mt-2">
              <Link
                to="/join"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 text-[15px] font-semibold font-body rounded
                           bg-sage text-white hover:bg-sage-dark transition-colors duration-150
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
              >
                <Ticket size={16} strokeWidth={1.5} />
                Join the Queue
              </Link>
              <Link
                to="/track"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 text-[15px] font-semibold font-body rounded
                           text-sage-light hover:text-white hover:bg-white/10 transition-colors duration-150
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
              >
                Track existing token
                <ArrowRight size={15} strokeWidth={1.5} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
