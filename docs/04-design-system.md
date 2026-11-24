# 04 — Design System

## Aura Studio — Visual Identity & Component Library

**Version:** 2.0 (Final — inspected from implementation)
**Last updated:** 2025
**Theme:** Sage Green + Cream — Luxury Natural Elegance

> All tokens in this document are verified against `client/tailwind.config.ts` and `client/src/index.css`. Do not introduce alternate values without updating both files.

---

## 1. Design Philosophy

Aura Studio should feel like stepping into a premium boutique salon: sophisticated, peaceful, welcoming, and luxurious.

Three governing words: **warm**, **calm**, **confident**.

- **Warm:** Ivory backgrounds, cream cards, champagne gold accents used sparingly.
- **Calm:** Generous whitespace, restrained shadows, one visual focus at a time.
- **Confident:** Editorial serif headings, precise spacing, purposeful hierarchy.

**Avoid:** bright colours, excessive gold, heavy gradients, excessive shadows, overcrowded layouts, generic SaaS dashboard designs, excessive animations.

---

## 2. Colour Tokens

Defined in `tailwind.config.ts → theme.extend.colors` and mirrored as CSS custom properties in `src/index.css`.

### Primary palette

| Token | Hex | Tailwind class | Usage |
|-------|-----|---------------|-------|
| `ivory` | `#FAF8F2` | `bg-ivory` | Page background |
| `cream` | `#F1EBDD` | `bg-cream` | Card backgrounds, input fills |
| `cream-dark` | `#E7DDCD` | `bg-cream-dark` / `border-cream-dark` | Card borders, dividers, hover tints |
| `sage` | `#849477` | `bg-sage` / `text-sage` | Primary accent — buttons, icons, active states |
| `sage-light` | `#B8C3AE` | `bg-sage-light` / `text-sage-light` | Hover tints, subtle highlights |
| `sage-dark` | `#53654B` | `bg-sage-dark` | Button hover, pressed states |
| `forest` | `#354536` | `bg-forest` | Display screen background, dark CTA sections |

### Luxury accents

| Token | Hex | Usage |
|-------|-----|-------|
| `champagne` | `#C6A978` | Eyebrow labels, "Popular" badges, star ratings, sparingly |
| `taupe` | `#B7A48D` | Secondary accent; `border-taupe/30` decorative use |
| `beige` | `#E7DDCD` | Alias for `cream-dark` |

### Typography colours

| Token | Hex | Usage |
|-------|-----|-------|
| `charcoal` | `#292B26` | Primary text |
| `charcoal-soft` | `#50534B` | Secondary text, labels, nav links |
| `muted` | `#77766D` | Captions, placeholders, metadata |

### Status colours

| Token | Hex | Light background | Usage |
|-------|-----|-----------------|-------|
| `status-waiting` | `#B7A48D` | `#F5F0E8` | Waiting badge |
| `status-called` | `#C6A978` | `warning-light` | Called badge |
| `status-serving` | `#849477` | `success-light` | In Service badge |
| `status-completed` | `#8A9A83` | `cream-dark` | Completed badge |
| `status-cancelled` | `#C4826A` | `error-light` | Cancelled / No Show badge |

### Semantic colours (utility)

| Token | Hex | Light variant | Usage |
|-------|-----|--------------|-------|
| `error` | `#C4826A` | `error-light: #F5E8E3` | Form errors, destructive actions |
| `success` | `#53654B` | `success-light: #EDF2EB` | Success banners, In Service highlight |
| `warning` | `#C6A978` | `warning-light: #FBF4E3` | Called state, amber warnings |

### CSS custom properties (src/index.css)

```css
--color-bg:           #FAF8F2;
--color-surface:      #F1EBDD;
--color-surface-alt:  #E7DDCD;
--color-border:       #E7DDCD;
--color-accent:       #849477;
--color-accent-hover: #53654B;
--color-text:         #292B26;
--color-text-soft:    #50534B;
--color-text-muted:   #77766D;
```

---

## 3. Typography

### Typefaces

| Role | Family | Weights | Google Fonts |
|------|--------|---------|-------------|
| Heading | Cormorant Garamond | 300, 400, 500, 600 (+ italic 300, 400) | ✅ |
| Body / UI | Inter | 400, 500, 600 | ✅ |
| Token numbers | JetBrains Mono | 400, 600 | ✅ |

Google Fonts import (in `index.html`):
```
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap
```

### Font family tokens (tailwind.config.ts)

```ts
fontFamily: {
  heading: ['Cormorant Garamond', 'Georgia', 'serif'],
  body:    ['Inter', 'system-ui', 'sans-serif'],
  mono:    ['JetBrains Mono', 'Courier New', 'monospace'],
}
```

Tailwind classes: `font-heading`, `font-body`, `font-mono`.

### Type scale (tailwind.config.ts → fontSize)

| Token | Size | Line height | Weight | Font | Usage |
|-------|------|------------|--------|------|-------|
| `display` | 3.5 rem | 1.05 | 300 | Cormorant | Hero headings |
| `h1` | 2.5 rem | 1.1 | 400 | Cormorant | Page titles |
| `h2` | 1.875 rem | 1.2 | 400 | Cormorant | Section headings |
| `h3` | 1.375 rem | 1.3 | 500 | Cormorant | Card titles |
| `h4` | 1.125 rem | 1.35 | 500 | Inter | Small section labels |
| `body-lg` | 1.0625 rem | 1.65 | 400 | Inter | Lead paragraphs |
| `token` | 2 rem | 1.0 | 600 | JetBrains Mono | Queue token display (medium) |

Display tokens on the Now Serving screen use `clamp()` inline for responsive scaling.

### Base styles (src/index.css)

```css
body { @apply bg-ivory text-charcoal font-body antialiased; }
h1, h2, h3, h4, h5, h6 { @apply font-heading; }
```

---

## 4. Spacing

Base: 4 px (Tailwind default). The layout uses standard Tailwind spacing utilities.

**Page container** (`.page-container`):
```css
@apply max-w-page mx-auto px-5 md:px-8 lg:px-10;
```

**Max page width:** `1120px` (`max-w-page` token in `tailwind.config.ts`).

**Section padding** (`.section-padding`):
```css
@apply py-16 md:py-20 lg:py-24;
```

Generous whitespace is intentional. Cards use `p-5` (mobile) → `p-6` (desktop) internal padding.

---

## 5. Border Radius

Defined in `tailwind.config.ts → theme.extend.borderRadius`:

| Token | Value | Usage |
|-------|-------|-------|
| `DEFAULT` | 8 px | Buttons, inputs |
| `sm` | 6 px | Badges, chips |
| `md` | 10 px | Small cards |
| `lg` | 14 px | Standard cards |
| `xl` | 20 px | Hero cards, feature panels |
| `2xl` | 24 px | Hero image, modals |
| `full` | 9999 px | Pill badges, avatars |

Tailwind classes: `rounded`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`.

---

## 6. Shadows

Defined in `tailwind.config.ts → theme.extend.boxShadow`. All use warm-tinted rgba (charcoal, not cold grey):

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-card` | `0 2px 12px rgba(41,43,38,0.07)` | Default cards |
| `shadow-card-hover` | `0 6px 24px rgba(41,43,38,0.11)` | Cards on hover |
| `shadow-elevated` | `0 12px 40px rgba(41,43,38,0.13)` | White elevated panels, modals |
| `shadow-inset` | `inset 0 1px 3px rgba(41,43,38,0.08)` | Input fields |

---

## 7. Buttons

### Utility classes (src/index.css)

```css
.btn-base  { @apply inline-flex items-center justify-center gap-2 font-body font-medium
                    rounded transition-colors duration-150
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-sage
                    focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed; }
.btn-primary   { @apply btn-base bg-sage text-white hover:bg-sage-dark; }
.btn-secondary { @apply btn-base bg-cream text-charcoal border border-cream-dark hover:bg-cream-dark; }
.btn-ghost     { @apply btn-base bg-transparent text-charcoal-soft hover:bg-cream; }
```

### Size utility classes

```css
.btn-sm { @apply px-3 py-1.5 text-sm; }
.btn-md { @apply px-5 py-2.5 text-sm; }
.btn-lg { @apply px-7 py-3 text-[15px] font-semibold; }
.btn-xl { @apply px-8 py-4 text-body-lg font-semibold; }
```

### Variants

| Variant | Background | Text | Hover bg | Use for |
|---------|-----------|------|----------|---------|
| `primary` | `sage #849477` | white | `sage-dark #53654B` | Main CTAs: Join Queue, Call Next, Complete |
| `secondary` | `cream #F1EBDD` | charcoal | `cream-dark #E7DDCD` | Secondary actions: Back, Track Token |
| `ghost` | transparent | `charcoal-soft` | `cream` | Tertiary links, navigation |
| `danger` | `error #C4826A` | white | `#B3715A` | Destructive: No Show, Cancel |

### States
- **Focus:** `ring-2 ring-sage ring-offset-2`
- **Disabled:** `opacity-50 cursor-not-allowed`
- **Loading:** Lucide `Loader2` icon (`animate-spin`) replaces or precedes label text

---

## 8. Cards

### Utility classes (src/index.css)

```css
.card          { @apply bg-cream rounded-lg border border-cream-dark shadow-card; }
.card-elevated { @apply bg-white rounded-xl border border-cream-dark shadow-elevated; }
```

### Card types in practice

| Type | Background | Border | Radius | Shadow | Use |
|------|-----------|--------|--------|--------|-----|
| Standard | `cream` | `cream-dark` | `lg` (14 px) | `shadow-card` | Service cards, section cards |
| Elevated | `white` | `cream-dark` | `xl` (20 px) | `shadow-elevated` | Staff/admin panels, summary cards |
| Interactive | `cream` | `cream-dark` → `sage` on selection | `lg` | `shadow-card-hover` on hover | Service/stylist selector cards |

Hover on interactive cards: `hover:shadow-card-hover hover:border-sage-light transition-shadow duration-200`.

---

## 9. Form Inputs

Standard text/tel input style (applied inline in components):

```
w-full bg-white border border-cream-dark rounded-lg px-4 py-3
font-body text-sm text-charcoal placeholder:text-muted
shadow-inset transition-colors duration-150
focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage
disabled:opacity-50
```

Error state: `border-error` replaces `border-cream-dark`.

Labels: `font-body text-sm font-medium text-charcoal-soft`.

Error messages: `font-body text-xs text-error` with `role="alert"`.

---

## 10. Status Badges (StatusBadge component)

Located at `client/src/components/ui/StatusBadge.tsx`.

Shape: `rounded-full px-3 py-1 text-xs font-medium font-body uppercase tracking-wide`.

| Status | Background | Text colour | Label |
|--------|-----------|-------------|-------|
| `waiting` | `#F5F0E8` | `#8A7A66` | Waiting |
| `called` | `warning-light` | `champagne` | Called |
| `in_service` | `success-light` | `success` | In Service |
| `completed` | `cream-dark` | `muted` | Completed |
| `no_show` | `error-light` | `error` | No Show |
| `cancelled` | `error-light` | `error` | Cancelled |

`TERMINAL_STATUSES` is exported from this file: `['completed', 'no_show', 'cancelled']`.

`TokenStatus` type is also exported from this file and used throughout the codebase as the single source of truth.

---

## 11. Navigation

### Customer navbar (`Navbar.tsx`)

- Background: `bg-ivory/95 backdrop-blur-sm border-b border-cream-dark`.
- Height: 64 px.
- Wordmark: Cormorant Garamond 1.375 rem, `font-medium`, charcoal, with a sage-green `rounded-full` scissors icon.
- Desktop right: "Track My Token" (secondary button) + "Join Queue" (primary button).
- Mobile: wordmark + hamburger (`Menu` icon); drawer slides down with anchor links and CTA buttons stacked.

### Display screen
No navbar. Full-screen `bg-forest` layout with its own header bar.

### Active link
`text-sage font-medium` (applied to the current route's link).

---

## 12. Icons

Library: **Lucide React** (`lucide-react`), `strokeWidth={1.5}` throughout.

| Context | Size |
|---------|------|
| Inline with body text | 13–14 px |
| Button icons | 15–16 px |
| Card decorative | 20 px |
| Navbar | 22 px |
| Empty/error states | 28 px |

Colour: inherits from parent text colour. Never uses a colour outside the defined palette.

**Common icon mapping:**

| Concept | Lucide icon |
|---------|------------|
| Join queue / ticket | `Ticket` |
| Clock / wait | `Clock` |
| User / customer | `User` |
| Scissors / salon | `Scissors` |
| Check / complete | `CheckCircle2` |
| No show | `UserX` |
| Cancel | `X`, `XCircle` |
| Search | `Search` |
| Refresh | `RefreshCw` |
| Loading | `Loader2` (+ `animate-spin`) |
| Call / phone | `PhoneCall` |
| Login | `LogIn` |
| Logout | `LogOut` |
| Edit | `Pencil` |
| Add | `Plus` |
| Toggle on | `ToggleRight` |
| Toggle off | `ToggleLeft` |
| Bell / alert | `Bell`, `AlertCircle` |
| Arrow | `ArrowLeft`, `ArrowRight` |
| Chevron | `ChevronDown` |
| Stats | `BarChart2` (admin) |

---

## 13. Photography and Imagery

### Style guidelines
- Warm, golden-hour tones; soft natural window light; editorial feel.
- Subject: salon interiors, stylists at work, warm-toned close-ups.
- Colour palette of images should harmonise with ivory, cream, sage, and champagne.
- All images use `object-fit: cover`.

### Hero image (`HeroImage.tsx`)
- Tries five ordered Pexels/Unsplash CDN URLs; falls back automatically on `onError`.
- `rounded-2xl` container.
- Vignette overlay: `linear-gradient(to right, rgba(250,248,242,0.12), transparent)` + bottom fade.
- Fallback background: `bg-cream-dark` (shows if all images fail).
- Floating satisfaction card and "Est. 2019" pill overlaid.

### Service card images
- Mapped by service ID in `ServicesSection.tsx` (IMAGE_MAP).
- Height 192 px (`h-48`), `object-cover`, `rounded-t-lg`.
- Fallback: `onError` hides the `<img>`; `bg-cream-dark` container visible beneath.
- Hover: `scale-[1.03] transition-transform duration-300`.

### Team / atmosphere images
- Team: circular portrait (`rounded-full`, 112×112 px, `border-2 border-cream-dark`).
- Atmosphere strip: 4 images in a responsive grid, `rounded-lg`, `h-40` → `h-56`.

---

## 14. Motion and Animation

Minimal by design. No decorative entrance animations on static content.

| Situation | Animation |
|-----------|-----------|
| Button hover | `transition-colors duration-150` |
| Card hover | `transition-shadow duration-200` (+ `transition-transform` on service images) |
| Skeleton loaders | `animate-pulse bg-cream-dark` |
| Loading spinner | `Loader2 animate-spin` |
| Called / In Service token | Slow `animate-pulse` on a background overlay (opacity 20%) |
| Status change (tracking) | Background colour transition: `transition-colors` on the hero area of `TokenStatusCard` |

Custom animation in `tailwind.config.ts`:
```ts
animation: {
  // (no custom animations defined; uses Tailwind's built-in animate-pulse and animate-spin)
}
```

---

## 15. Responsive Design

| Breakpoint | Tailwind prefix | Columns | Usage |
|-----------|----------------|---------|-------|
| < 640 px | (default) | 1 | Mobile phones |
| 640 px | `sm:` | 2 | Tablets |
| 768 px | `md:` | 2–3 | Tablets landscape |
| 1024 px | `lg:` | 3–4 | Desktop |

### Key responsive patterns used

- **Navbar:** Full links + buttons on `md+`; hamburger drawer below.
- **Hero:** `grid-cols-1` → `lg:grid-cols-2`; image stacks below text on mobile.
- **Services grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- **Join/Staff/Admin two-column layouts:** `grid-cols-1 lg:grid-cols-[1fr_380px]`; right column is `lg:sticky lg:top-24`.
- **Stat cards:** `grid-cols-2 md:grid-cols-5`.
- **Tables:** `overflow-x-auto` wrapper; some columns hidden at small breakpoints (`hidden md:table-cell`).
- **Display screen:** `flex-col lg:flex-row`; font sizes use `clamp()`.

Minimum tested mobile width: **390 px**.

---

## 16. Accessibility

- Colour contrast: all body text / background combinations target WCAG AA (4.5:1 for normal text, 3:1 for large text).
- Focus rings: `focus-visible:ring-2 ring-sage ring-offset-2` on all interactive elements.
- Touch targets: minimum 44×44 px on interactive elements.
- Semantic HTML: `<nav>`, `<main>`, `<section>`, `<form>`, `<button>`, `<table>`.
- ARIA labels: `aria-label` on icon-only buttons; `aria-pressed` on selection cards; `aria-invalid` on form inputs; `aria-live="polite"` on status banners.
- Error messages: linked via `aria-describedby`; role `alert` for server-side errors.
- Status change notifications: `role="status"` on `StatusBanner`.
