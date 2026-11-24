import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, User, Loader2, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiService, ApiStylist, ApiToken } from '@/data/apiTypes'
import { formatPrice, formatDuration } from '@/data/mockData'
import { cn } from '@/lib/cn'

// ─── Validation ───────────────────────────────────────────────────────────────

function validateName(v: string): string {
  if (!v.trim()) return 'Please enter your name.'
  if (v.trim().length < 2) return 'Name must be at least 2 characters.'
  if (v.trim().length > 60) return 'Name must be 60 characters or fewer.'
  return ''
}

function validatePhone(v: string): string {
  if (!v.trim()) return 'Please enter your phone number.'
  const digits = v.replace(/[\s\-+()\u00a0]/g, '')
  if (!/^\d{7,15}$/.test(digits)) return 'Enter a valid phone number (7–15 digits).'
  return ''
}

// ─── Confirmation screen ──────────────────────────────────────────────────────

function ConfirmationView({ token, customerName }: { token: ApiToken; customerName: string }) {
  const waitLabel = token.estimatedWaitMinutes === 0
    ? "You're next!"
    : `approx. ${token.estimatedWaitMinutes} min`

  return (
    <div className="min-h-screen bg-ivory">
      <div className="page-container py-16 md:py-20">
        <div className="w-full max-w-md mx-auto">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-success-light flex items-center justify-center mb-4">
              <CheckCircle2 size={28} className="text-success" strokeWidth={1.5} />
            </div>
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-champagne mb-2">
              You're in the queue
            </p>
            <h2 className="font-heading text-h1 text-charcoal">Welcome, {customerName}!</h2>
            <p className="font-body text-sm text-charcoal-soft mt-2">
              Your spot is reserved. Keep this page open to track your position.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-cream-dark shadow-elevated p-6 mb-5">
            <div className="flex flex-col items-center py-6 border-b border-cream-dark mb-6">
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-muted mb-3">
                Your Token
              </p>
              <span className="font-mono text-[3.5rem] font-semibold leading-none tracking-tight text-sage">
                {token.tokenLabel}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-body text-xs text-muted uppercase tracking-wide mb-1">Queue position</p>
                <p className="font-body text-sm font-semibold text-charcoal">#{token.position}</p>
              </div>
              <div>
                <p className="font-body text-xs text-muted uppercase tracking-wide mb-1">Est. wait</p>
                <p className="font-body text-sm font-semibold text-charcoal flex items-center gap-1">
                  <Clock size={13} strokeWidth={1.5} className="text-sage" />
                  {waitLabel}
                </p>
              </div>
              <div>
                <p className="font-body text-xs text-muted uppercase tracking-wide mb-1">Service</p>
                <p className="font-body text-sm font-semibold text-charcoal">{token.serviceName}</p>
              </div>
              <div>
                <p className="font-body text-xs text-muted uppercase tracking-wide mb-1">Stylist</p>
                <p className="font-body text-sm font-semibold text-charcoal flex items-center gap-1">
                  <User size={13} strokeWidth={1.5} className="text-sage" />
                  {token.stylistName}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-warning-light border border-champagne/30 rounded-lg px-4 py-3 mb-6">
            <p className="font-body text-sm text-charcoal-soft leading-relaxed">
              <span className="font-semibold text-charcoal">Keep this page open</span> to receive
              live updates when it's nearly your turn.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to={`/track/${token.tokenId}`}
              className="w-full inline-flex items-center justify-center gap-2
                         px-7 py-3 text-[15px] font-semibold font-body rounded
                         bg-sage text-white hover:bg-sage-dark transition-colors duration-150
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
            >
              Track My Position
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2
                         px-7 py-3 text-[15px] font-semibold font-body rounded
                         bg-cream text-charcoal border border-cream-dark hover:bg-cream-dark
                         transition-colors duration-150
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type PageState = 'form' | 'submitting' | 'confirmed' | 'error'

export default function JoinPage() {
  const [pageState, setPageState]   = useState<PageState>('form')
  const [confirmedToken, setConfirmedToken] = useState<ApiToken | null>(null)
  const [submitError, setSubmitError] = useState('')

  // Form state
  const [name, setName]           = useState('')
  const [phone, setPhone]         = useState('')
  const [serviceId, setServiceId] = useState('')
  const [stylistId, setStylistId] = useState<string | null>(null)

  // Field errors
  const [nameErr, setNameErr]       = useState('')
  const [phoneErr, setPhoneErr]     = useState('')
  const [serviceErr, setServiceErr] = useState('')

  // Data loaded from API
  const [services, setServices]   = useState<ApiService[]>([])
  const [stylists, setStylists]   = useState<ApiStylist[]>([])
  const [loadErr, setLoadErr]     = useState('')

  // Load services + stylists from backend on mount
  useEffect(() => {
    Promise.all([
      api.get<ApiService[]>('/api/services'),
      api.get<ApiStylist[]>('/api/stylists'),
    ])
      .then(([svcs, stys]) => { setServices(svcs); setStylists(stys) })
      .catch(() => setLoadErr('Could not load services. Please refresh and try again.'))
  }, [])

  // ── field handlers ──────────────────────────────────────────────────────────

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value)
    if (nameErr) setNameErr(validateName(e.target.value))
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(e.target.value)
    if (phoneErr) setPhoneErr(validatePhone(e.target.value))
  }

  // ── submission ──────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nErr = validateName(name)
    const pErr = validatePhone(phone)
    const sErr = serviceId ? '' : 'Please select a service.'
    setNameErr(nErr); setPhoneErr(pErr); setServiceErr(sErr)
    if (nErr || pErr || sErr) return

    setPageState('submitting')
    setSubmitError('')

    try {
      const { token } = await api.post<{ token: ApiToken }>('/api/queue/join', {
        customerName: name.trim(),
        phone:        phone.trim(),
        serviceId,
        stylistId,
      })
      setConfirmedToken(token)
      setPageState('confirmed')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setPageState('error')
    }
  }

  // ── confirmation view ───────────────────────────────────────────────────────

  if (pageState === 'confirmed' && confirmedToken) {
    return <ConfirmationView token={confirmedToken} customerName={name.trim()} />
  }

  const isSubmitting = pageState === 'submitting'
  const selectedSvc  = services.find(s => s.id === serviceId)

  // ── form view ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-ivory">
      <div className="page-container py-12 md:py-16">
        <div className="max-w-2xl mb-10">
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-champagne mb-3">
            Walk-in Queue
          </p>
          <h1 className="font-heading text-h1 text-charcoal leading-tight mb-3">
            Reserve Your Spot
          </h1>
          <p className="font-body text-body-lg text-charcoal-soft leading-relaxed">
            Fill in a few details, choose your service and join the queue in under a minute.
          </p>
        </div>

        {loadErr && (
          <div className="mb-6 bg-error-light border border-error/30 rounded-xl px-5 py-3">
            <p className="font-body text-sm text-error">{loadErr}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

            {/* Left column */}
            <div className="flex flex-col gap-8">

              {/* Personal details */}
              <section className="bg-cream rounded-xl border border-cream-dark shadow-card p-6">
                <h2 className="font-heading text-h3 text-charcoal mb-5">Your Details</h2>
                <div className="flex flex-col gap-5">
                  <Field label="Full name *" error={nameErr} htmlFor="cname">
                    <input
                      id="cname" type="text" autoComplete="name"
                      placeholder="e.g. Priya Sharma"
                      value={name} onChange={handleNameChange}
                      disabled={isSubmitting}
                      aria-invalid={!!nameErr}
                      className={inputCls(!!nameErr)}
                    />
                  </Field>
                  <Field label="Phone number *" error={phoneErr} htmlFor="cphone"
                         hint="Used only to contact you if needed.">
                    <input
                      id="cphone" type="tel" inputMode="tel" autoComplete="tel"
                      placeholder="e.g. 98765 43210"
                      value={phone} onChange={handlePhoneChange}
                      disabled={isSubmitting}
                      aria-invalid={!!phoneErr}
                      className={inputCls(!!phoneErr)}
                    />
                  </Field>
                </div>
              </section>

              {/* Service selection */}
              <section className="bg-cream rounded-xl border border-cream-dark shadow-card p-6">
                <div className="flex items-baseline justify-between flex-wrap gap-2 mb-5">
                  <h2 className="font-heading text-h3 text-charcoal">Choose a Service *</h2>
                  {serviceErr && <p className="font-body text-xs text-error" role="alert">{serviceErr}</p>}
                </div>

                {services.length === 0 && !loadErr && (
                  <div className="flex items-center gap-2 text-muted py-4">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="font-body text-sm">Loading services…</span>
                  </div>
                )}

                <div className="flex flex-col gap-3" role="radiogroup" aria-label="Select a service">
                  {services.map(svc => (
                    <button
                      key={svc.id} type="button"
                      onClick={() => { setServiceId(svc.id); setServiceErr('') }}
                      aria-pressed={serviceId === svc.id}
                      className={cn(
                        'w-full text-left rounded-lg border p-4 transition-all duration-150',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2',
                        serviceId === svc.id
                          ? 'border-sage bg-success-light shadow-card'
                          : 'border-cream-dark bg-cream hover:border-sage-light hover:shadow-card',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-heading text-[1.125rem] text-charcoal">{svc.name}</span>
                            {svc.popular && (
                              <span className="inline-flex items-center rounded-full bg-warning-light text-champagne
                                               px-2.5 py-0.5 text-[10px] font-semibold font-body uppercase tracking-wide">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="font-body text-sm text-charcoal-soft mt-1 leading-relaxed">
                            {svc.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="font-heading text-[1.0625rem] font-medium text-sage">
                              {formatPrice(svc.priceInr)}
                            </span>
                            <span className="flex items-center gap-1 font-body text-sm text-muted">
                              <Clock size={13} strokeWidth={1.5} />
                              {formatDuration(svc.durationMinutes)}
                            </span>
                          </div>
                        </div>
                        <div
                          className={cn(
                            'flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 transition-colors duration-150',
                            serviceId === svc.id ? 'border-sage bg-sage' : 'border-cream-dark bg-white',
                          )}
                          aria-hidden="true"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Stylist preference */}
              <section className="bg-cream rounded-xl border border-cream-dark shadow-card p-6">
                <h2 className="font-heading text-h3 text-charcoal mb-1">Stylist Preference</h2>
                <p className="font-body text-sm text-muted mb-5">
                  Optional — selecting a specific stylist may increase your wait time.
                </p>
                <div className="flex flex-col gap-3" role="radiogroup" aria-label="Select a stylist">
                  {/* Any available */}
                  <StylistOption
                    id={null} name="Any Available Stylist"
                    sub="Assigned automatically — shortest wait"
                    initials="✦" selected={stylistId === null}
                    onSelect={() => setStylistId(null)}
                  />
                  {stylists.map(sty => (
                    <StylistOption
                      key={sty.id} id={sty.id} name={sty.name}
                      sub={sty.role} initials={sty.avatarInitials}
                      selected={stylistId === sty.id}
                      onSelect={() => setStylistId(sty.id)}
                    />
                  ))}
                </div>
              </section>

            </div>

            {/* Right column — summary + submit */}
            <div className="lg:sticky lg:top-24 flex flex-col gap-5">
              <div className="bg-white rounded-xl border border-cream-dark shadow-elevated p-6">
                <h3 className="font-heading text-h3 text-charcoal mb-5">Summary</h3>
                <div className="flex flex-col gap-4">
                  <SummaryRow label="Name"  value={name.trim() || '—'}  muted={!name.trim()} />
                  <SummaryRow label="Phone" value={phone.trim() || '—'} muted={!phone.trim()} />
                  <div className="border-t border-cream-dark" />
                  {selectedSvc ? (
                    <>
                      <SummaryRow label="Service"  value={selectedSvc.name} />
                      <SummaryRow label="Price"    value={formatPrice(selectedSvc.priceInr)} />
                      <SummaryRow label="Duration" value={formatDuration(selectedSvc.durationMinutes)} />
                    </>
                  ) : (
                    <SummaryRow label="Service" value="Not selected" muted />
                  )}
                  <SummaryRow
                    label="Stylist"
                    value={stylistId ? (stylists.find(s => s.id === stylistId)?.name ?? '—') : 'Any available'}
                  />
                </div>
              </div>

              {pageState === 'error' && submitError && (
                <div className="bg-error-light border border-error/30 rounded-lg px-4 py-3" role="alert">
                  <p className="font-body text-sm text-error">{submitError}</p>
                </div>
              )}

              <button
                type="submit" disabled={isSubmitting}
                className={cn(
                  'w-full inline-flex items-center justify-center gap-2',
                  'px-7 py-4 rounded-lg font-body text-[15px] font-semibold',
                  'bg-sage text-white hover:bg-sage-dark',
                  'transition-colors duration-150',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                )}
              >
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Joining queue…</>
                ) : (
                  <>Join the Queue <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" /></>
                )}
              </button>

              <p className="font-body text-xs text-muted text-center leading-relaxed">
                By joining you agree to hold your spot respectfully.
                You can cancel at any time from the tracking page.
              </p>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}

// ─── File-local helpers ───────────────────────────────────────────────────────

function inputCls(hasErr: boolean) {
  return cn(
    'w-full bg-white border rounded-lg px-4 py-3',
    'font-body text-sm text-charcoal placeholder:text-muted',
    'shadow-inset transition-colors duration-150',
    'focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage disabled:opacity-50',
    hasErr ? 'border-error' : 'border-cream-dark',
  )
}

function Field({ label, htmlFor, error, hint, children }: {
  label: string; htmlFor: string; error?: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-body text-sm font-medium text-charcoal-soft">{label}</label>
      {children}
      {error  && <p id={`${htmlFor}-err`}  role="alert" className="font-body text-xs text-error">{error}</p>}
      {!error && hint && <p className="font-body text-xs text-muted">{hint}</p>}
    </div>
  )
}

function StylistOption({ id: _id, name, sub, initials, selected, onSelect }: {
  id: string | null; name: string; sub: string; initials: string; selected: boolean; onSelect: () => void
}) {
  return (
    <button
      type="button" onClick={onSelect} aria-pressed={selected}
      className={cn(
        'w-full text-left rounded-lg border p-4 transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2',
        selected
          ? 'border-sage bg-success-light shadow-card'
          : 'border-cream-dark bg-cream hover:border-sage-light hover:shadow-card',
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-body text-sm font-semibold',
          selected ? 'bg-sage text-white' : 'bg-cream-dark text-charcoal-soft',
        )} aria-hidden="true">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm font-semibold text-charcoal leading-snug">{name}</p>
          <p className="font-body text-xs text-muted mt-0.5">{sub}</p>
        </div>
        <div className={cn(
          'flex-shrink-0 w-4 h-4 rounded-full border-2 transition-colors duration-150',
          selected ? 'border-sage bg-sage' : 'border-cream-dark bg-white',
        )} aria-hidden="true" />
      </div>
    </button>
  )
}

function SummaryRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="font-body text-sm text-muted flex-shrink-0">{label}</span>
      <span className={cn(
        'font-body text-sm text-right truncate',
        muted ? 'text-muted italic' : 'text-charcoal font-medium',
      )}>
        {value}
      </span>
    </div>
  )
}
