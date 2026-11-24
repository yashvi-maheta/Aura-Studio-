import SectionHeading from '@/components/ui/SectionHeading'

const stylists = [
  {
    name: 'Elena Vasquez',
    role: 'Senior Colourist',
    bio: '12 years mastering balayage and creative colour at top London salons.',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80&auto=format&fit=crop&crop=faces',
  },
  {
    name: 'Marcus Osei',
    role: 'Master Stylist',
    bio: 'Award-winning precision cutter with a passion for texture and structure.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop&crop=faces',
  },
  {
    name: 'Priya Nair',
    role: 'Wellness & Treatment Specialist',
    bio: 'Certified trichologist focused on scalp health, nourishment and repair.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&auto=format&fit=crop&crop=faces',
  },
]

export default function TeamSection() {
  return (
    <section id="team" className="section-padding bg-cream/40">
      <div className="page-container">
        <SectionHeading
          eyebrow="Meet the Team"
          title="Expert hands, genuine care"
          subtitle="Our stylists bring years of experience, a love for their craft and a commitment to making you feel at home."
          centered
          className="mb-14 mx-auto max-w-2xl"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {stylists.map((s) => (
            <div key={s.name} className="flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-cream-dark shadow-card mb-5">
                <img
                  src={s.image}
                  alt={s.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="font-heading text-h3 text-charcoal">{s.name}</h3>
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-champagne mt-1 mb-3">
                {s.role}
              </p>
              <p className="font-body text-sm text-charcoal-soft leading-relaxed max-w-xs">{s.bio}</p>
            </div>
          ))}
        </div>

        {/* Salon atmosphere strip */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 rounded-xl overflow-hidden">
          {[
            {
              src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=75&auto=format&fit=crop',
              alt: 'Salon interior detail',
            },
            {
              src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=75&auto=format&fit=crop',
              alt: 'Stylist working',
            },
            {
              src: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&q=75&auto=format&fit=crop',
              alt: 'Hair colouring in progress',
            },
            {
              src: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=500&q=75&auto=format&fit=crop',
              alt: 'Relaxed salon atmosphere',
            },
          ].map((img) => (
            <div key={img.src} className="h-40 md:h-56 overflow-hidden rounded-lg">
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
