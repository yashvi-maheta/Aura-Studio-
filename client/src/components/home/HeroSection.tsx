import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import HeroImage from './HeroImage'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-ivory">
      <div className="page-container py-16 md:py-20 lg:py-0 lg:min-h-[88vh] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">

          {/* Text column */}
          <div className="max-w-xl">
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-champagne mb-5">
              Premium Salon Experience
            </p>

            <h1 className="font-heading text-[3rem] md:text-[3.75rem] lg:text-[4.25rem] leading-[1.05] font-light text-charcoal mb-6">
              Look Good.<br />
              <em className="not-italic text-sage">Feel Amazing.</em>
            </h1>

            <p className="font-body text-body-lg text-charcoal-soft leading-relaxed mb-10 max-w-md">
              Step into Aura Studio — where expert stylists, a serene atmosphere and
              a seamless queue system mean you spend your time relaxing, not waiting.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/join"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 text-[15px] font-semibold font-body rounded
                           bg-sage text-white hover:bg-sage-dark transition-colors duration-150
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
              >
                Join the Queue
                <ArrowRight size={16} strokeWidth={1.5} />
              </Link>
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 text-[15px] font-semibold font-body rounded
                           bg-cream text-charcoal border border-cream-dark hover:bg-cream-dark transition-colors duration-150
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
              >
                Explore Services
              </a>
            </div>

            {/* Trust pill */}
            <div className="mt-10 inline-flex items-center gap-3 bg-cream border border-cream-dark rounded-full px-5 py-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-success-light flex-shrink-0">
                <Clock size={15} className="text-success" strokeWidth={1.5} />
              </span>
              <span className="font-body text-sm text-charcoal-soft">
                Real-time queue tracking — no app needed
              </span>
            </div>
          </div>

          {/* Image column */}
          <HeroImage />

        </div>
      </div>
    </section>
  )
}
