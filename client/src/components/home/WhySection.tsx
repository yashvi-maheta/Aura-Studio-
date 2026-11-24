import { Sparkles, Clock, UserCheck, Leaf } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'

const reasons = [
  {
    icon: <Sparkles size={22} strokeWidth={1.5} className="text-sage" />,
    title: 'Premium Craftsmanship',
    body: 'Our stylists train continuously and use only high-grade, ethically sourced products that care for your hair as much as they beautify it.',
  },
  {
    icon: <Clock size={22} strokeWidth={1.5} className="text-sage" />,
    title: 'Respect Your Time',
    body: 'Our digital queue system shows you exactly where you stand. Join from your phone, run an errand and return when it\'s your turn.',
  },
  {
    icon: <UserCheck size={22} strokeWidth={1.5} className="text-sage" />,
    title: 'Personalised Attention',
    body: 'Every appointment begins with a thorough consultation. No cookie-cutter cuts — just styles designed for you.',
  },
  {
    icon: <Leaf size={22} strokeWidth={1.5} className="text-sage" />,
    title: 'A Calming Environment',
    body: 'From the warm lighting to the carefully chosen music, every detail of Aura Studio is designed to help you unwind.',
  },
]

export default function WhySection() {
  return (
    <section className="section-padding bg-ivory">
      <div className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Image */}
          <div className="relative h-80 md:h-[480px] rounded-xl overflow-hidden order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80&auto=format&fit=crop"
              alt="Stylist at work in the warm Aura Studio interior"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Accent bar */}
            <div className="absolute left-0 top-8 bottom-8 w-1 bg-champagne rounded-r-full" />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="Why Aura Studio"
              title="A salon experience that respects you"
              subtitle="We built Aura Studio around one belief: exceptional hair deserves an exceptional experience from the moment you arrive."
              className="mb-10"
            />

            <div className="flex flex-col gap-7">
              {reasons.map((r) => (
                <div key={r.title} className="flex gap-4">
                  <div className="flex-shrink-0 mt-0.5 w-10 h-10 rounded-lg bg-success-light flex items-center justify-center">
                    {r.icon}
                  </div>
                  <div>
                    <h4 className="font-body text-[15px] font-semibold text-charcoal mb-1">{r.title}</h4>
                    <p className="font-body text-sm text-charcoal-soft leading-relaxed">{r.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
