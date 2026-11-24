import { Link } from 'react-router-dom'
import { Clock, ArrowRight } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import { SERVICES, formatPrice, formatDuration } from '@/data/mockData'

// Image map — keyed by service id.
// When the backend serves real service records it can include an imageUrl field;
// until then this lookup keeps the visual layer separate from the data layer.
const SERVICE_IMAGES: Record<string, string> = {
  'svc-1': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80&auto=format&fit=crop',
  'svc-2': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80&auto=format&fit=crop',
  'svc-3': 'https://images.unsplash.com/photo-1500840216050-6ffa99d75160?w=600&q=80&auto=format&fit=crop',
  'svc-4': 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?w=600&q=80&auto=format&fit=crop',
  'svc-5': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80&auto=format&fit=crop',
  'svc-6': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80&auto=format&fit=crop',
}

const SERVICE_TAGS: Record<string, string> = {
  'svc-1': 'Most Popular',
  'svc-4': 'Add-on',
}

export default function ServicesSection() {
  return (
    <section id="services" className="section-padding bg-cream/40">
      <div className="page-container">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <SectionHeading
            eyebrow="What We Offer"
            title="Our Services"
            subtitle="Every service is performed with care, skill and the finest professional products."
          />
          <Link
            to="/join"
            className="inline-flex items-center gap-1.5 font-body text-sm text-charcoal-soft hover:text-charcoal
                       transition-colors duration-150 self-start md:self-auto flex-shrink-0"
          >
            View all &amp; join queue
            <ArrowRight size={15} strokeWidth={1.5} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <article
              key={service.id}
              className="group bg-cream rounded-lg border border-cream-dark shadow-card overflow-hidden
                         hover:shadow-card-hover transition-shadow duration-200"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-cream-dark">
                <img
                  src={SERVICE_IMAGES[service.id]}
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                  onError={(e) => {
                    // Hide broken image — the bg-cream-dark container colour shows through cleanly
                    ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                  }}
                />
                {SERVICE_TAGS[service.id] && (
                  <span className="absolute top-3 left-3 bg-white/90 text-champagne border border-champagne/30
                                   rounded-full px-3 py-1 text-xs font-medium font-body uppercase tracking-wide">
                    {SERVICE_TAGS[service.id]}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="font-heading text-h3 text-charcoal mb-2">{service.name}</h3>
                <p className="font-body text-sm text-charcoal-soft leading-relaxed mb-4 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted">
                    <Clock size={14} strokeWidth={1.5} />
                    <span className="font-body text-sm">{formatDuration(service.durationMinutes)}</span>
                  </div>
                  <span className="font-heading text-[1.125rem] font-medium text-sage">
                    {formatPrice(service.price)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/join"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 text-[15px] font-semibold font-body rounded
                       bg-sage text-white hover:bg-sage-dark transition-colors duration-150
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
          >
            Join the Queue Now
            <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
        </div>

      </div>
    </section>
  )
}
