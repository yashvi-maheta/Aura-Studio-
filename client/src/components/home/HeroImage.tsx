import { useState } from 'react'

/**
 * Ordered list of warm, colour salon interior photographs.
 * Sources are free-to-use (Pexels / Unsplash open licence).
 * The component tries each URL in sequence; if one fails to load
 * the next is attempted automatically via the onError handler.
 *
 * Photo credits:
 *  [0] Photo by Polina Tankilevitch — Pexels (pexels.com/photo/13068377)
 *  [1] Photo by Thgusstavo Santana — Pexels (pexels.com/photo/3993449)
 *  [2] Photo by Gustavo Fring — Pexels (pexels.com/photo/4056593)
 *  [3] Photo by Adam Winger — Unsplash (unsplash.com/photos/NMZdj2Zu36M)
 *  [4] Unsplash fallback salon shot
 */
const CANDIDATES = [
  // Pexels — bright warm salon interior, beige walls, gold mirrors
  'https://images.pexels.com/photos/13068377/pexels-photo-13068377.jpeg?auto=compress&cs=tinysrgb&w=900&h=1200&fit=crop',
  // Pexels — warm-lit hairdresser interior, cream tones
  'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=900&h=1200&fit=crop',
  // Pexels — bright beauty salon with mirrors and chairs
  'https://images.pexels.com/photos/4056593/pexels-photo-4056593.jpeg?auto=compress&cs=tinysrgb&w=900&h=1200&fit=crop',
  // Unsplash — warm salon, natural window light
  'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=900&q=85&auto=format&fit=crop&crop=center',
  // Unsplash — final fallback, known warm salon shot
  'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=900&q=85&auto=format&fit=crop&crop=center',
]

export default function HeroImage() {
  const [index, setIndex] = useState(0)

  const tryNext = () => {
    if (index < CANDIDATES.length - 1) {
      setIndex((i) => i + 1)
    }
  }

  return (
    /*
     * Wrapper:
     * - h-72 on mobile, h-96 on tablet, 600px on desktop
     * - rounded-2xl (24px) per design system hero card spec
     * - overflow-hidden to clip the image inside the rounded frame
     */
    <div className="relative w-full h-72 md:h-[480px] lg:h-[600px] rounded-2xl overflow-hidden bg-cream-dark flex-shrink-0">

      {/* Main photograph */}
      <img
        key={index}
        src={CANDIDATES[index]}
        alt="Warm, sunlit Aura Studio salon interior with elegant mirrors, leather chairs and indoor plants"
        className="w-full h-full object-cover object-center"
        loading="eager"
        onError={tryNext}
      />

      {/*
       * Extremely subtle left-edge vignette only —
       * keeps the page background from jarring against the image edge.
       * No dark overlay; we want the warm colours to breathe.
       */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, rgba(250,248,242,0.12) 0%, transparent 18%), ' +
            'linear-gradient(to top, rgba(41,43,38,0.18) 0%, transparent 32%)',
        }}
      />

      {/* Floating customer satisfaction card */}
      <div
        className="absolute bottom-5 left-5 rounded-xl px-5 py-4 border border-cream-dark"
        style={{
          background: 'rgba(255,255,255,0.93)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',   // eslint-disable-line @typescript-eslint/no-explicit-any
          boxShadow: '0 12px 40px rgba(41,43,38,0.15)',
        } as React.CSSProperties}
      >
        {/* Score */}
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-heading text-[2rem] font-medium leading-none"
            style={{ color: '#292B26' }}
          >
            4.9
          </span>
          <span className="font-body text-xs font-semibold text-muted">/&nbsp;5.0</span>
        </div>

        {/* Stars */}
        <div className="flex gap-0.5 mt-1.5" aria-label="Rated 4.9 out of 5 stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              width="13"
              height="13"
              viewBox="0 0 12 12"
              fill={i < 5 ? '#C6A978' : 'none'}
              aria-hidden="true"
            >
              <path d="M6 1l1.39 2.82L10.5 4.27l-2.25 2.19.53 3.09L6 8l-2.78 1.46.53-3.09L1.5 4.27l3.11-.45L6 1z" />
            </svg>
          ))}
        </div>

        {/* Label */}
        <p className="font-body text-xs text-muted mt-1.5 leading-tight">
          Customer satisfaction
        </p>
      </div>

      {/* Small decorative accent pill — top right */}
      <div
        className="absolute top-5 right-5 rounded-full px-3 py-1.5 border"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          borderColor: 'rgba(231,221,205,0.7)',
        }}
      >
        <span className="font-body text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#849477' }}>
          Est. 2019
        </span>
      </div>
    </div>
  )
}
