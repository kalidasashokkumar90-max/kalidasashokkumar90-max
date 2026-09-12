# DESIGN SPECIFICATION — One-Page Portfolio

**Owner:** KALIDAS ASHOK
**Tagline:** Creative Frontend & AI/ML Developer · AI Enthusiast
**Style Direction:** Dark Futuristic Neon / Sci-Fi Glassmorphism
**Deliverable:** `DESIGN.md` · v1.0 · September 2026 · **Handoff to Frontend Developer**

---

## Table of Contents

1. [Design Concept & Visual Language](#1-design-concept--visual-language)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Spacing, Grid & Layout](#4-spacing-grid--layout)
5. [Global Atmosphere Layers](#5-global-atmosphere-layers)
6. [Component Design System](#6-component-design-system)
7. [Micro-interactions & Motion Language](#7-micro-interactions--motion-language)
8. [Scroll Animation Scheme](#8-scroll-animation-scheme)
9. [Responsive Behavior](#9-responsive-behavior)
10. [Accessibility Standards](#10-accessibility-standards)
11. [Performance & Implementation Notes](#11-performance--implementation-notes)

---

## 1. Design Concept & Visual Language

The site must feel like a **cyberdeck boot-up**: a near-black void with layered neon light, translucent glass panels, and a faint data-grid breathing underneath. The owner is a frontend developer and AI/ML enthusiast, so the aesthetic leans **scientific + cinematic**: terminal-green data accents, orbital glows, circuit-like lines, and a 3D particle system in the hero.

**Emotional keywords:** precision, electricity, depth, intelligence, focus.

**Non-negotiable visual rules**
- All surfaces are dark; light comes **from** the accents, never from white backgrounds.
- Every panel is glass: translucent, blurred, edged with a faint violet-cyan hairline.
- Neon = glow, never flat. Every accent color has a matching `box-shadow` glow recipe (specified per component).
- Depth is built in 3 tiers: background (grid + orbs) → glass surfaces → neon interactive elements.
- No skeuomorphism, no drop shadows that look like "cardboard"; shadows are **neon spread** and **black depth** only.

**Tech constraints (developer must honor):**
- Vanilla `HTML5 + CSS3 + JS` (no frameworks, no build step, no libraries except Three.js).
- Three.js hero animation rendered to a `<canvas>`.
- `IntersectionObserver` for all scroll-triggered animation (no scroll libraries).
- CSS Custom Properties for every token below; all values in `px`/`ms` are exact and must not be reinterpreted.

---

## 2. Color Palette

All hex values are final. Background is near-black with a blue-violet tint (`#05060f`).

| Token | Value | Usage | Contrast vs `#05060f` |
|---|---|---|---|
| `--bg-primary` | `#05060f` | Page background | — |
| `--bg-elevated` | `#0a0c1a` | Navbar solid fallback, preloader, code blocks | — |
| `--glass-bg` | `rgba(13, 16, 32, 0.55)` | All glass panels (backdrop-filter blur 18px) | — |
| `--glass-border` | `rgba(148, 163, 255, 0.14)` | Glass hairline borders | — |
| `--glass-highlight` | `rgba(255, 255, 255, 0.06)` | Glass top-edge inner highlight | — |
| `--accent-cyan` | `#00f0ff` | **Primary neon accent** — links, focus, highlights, primary CTA bg | **14.0 : 1** |
| `--accent-magenta` | `#ff2d95` | **Secondary accent** — gradients, timeline end, hover-on-cyan states | **5.7 : 1** |
| `--accent-purple` | `#a78bfa` | **Tertiary accent** — gradient mid-point, decorative orbs, tag accents | **7.2 : 1** |
| `--success-energy` | `#00ff9d` | Success / "energy" highlight — form valid state, online status dot, stat values | **14.9 : 1** |
| `--text-heading` | `#f4f6ff` | h1–h4, bold labels | **15.4 : 1** |
| `--text-body` | `#c7cbe0` | Body copy | **12.3 : 1** |
| `--text-muted` | `#8b92ad` | Secondary copy, card descriptions | **6.4 : 1** |
| `--text-faint` | `#5b6079` | **Decorative only** (never used for readable copy — 3.5 : 1, below AA) | 3.5 : 1 |

**Signature gradients (must be reusable tokens):**
- `--grad-primary: linear-gradient(120deg, #00f0ff 0%, #a78bfa 50%, #ff2d95 100%)` — section underline, scroll progress bar, thumbnails' accent.
- `--grad-text: linear-gradient(120deg, #00f0ff, #a78bfa)` — hero name highlight, big numbers (use as `background-clip: text; color: transparent`).
- `--glow-cyan: 0 0 8px rgba(0, 240, 255, 0.55), 0 0 24px rgba(0, 240, 255, 0.25)`.
- `--glow-magenta: 0 0 8px rgba(255, 45, 149, 0.5), 0 0 24px rgba(255, 45, 149, 0.22)`.
- `--glow-purple: 0 0 8px rgba(167, 139, 250, 0.5), 0 0 24px rgba(167, 139, 250, 0.22)`.

**WCAG AA compliance statement**
- Body text uses `--text-body` (12.3 : 1) → passes AA and AAA for normal text.
- Muted text uses `--text-muted` (6.4 : 1) → passes AA normal / AAA large.
- Accent-colored text (cyan/magenta/purple) is only used at ≥ 14px semibold or for decorative accents, and each passes 4.5:1 (cyan 14:1, magenta 5.7:1, purple 7.2:1).
- Primary button: cyan `#00f0ff` background with `#04121a` text = **12.1 : 1**.

---

## 3. Typography

**Google Fonts (load exactly these, with `display=swap`):**

```
https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap
```

**Justification**
- **Orbitron** — display/headings. Geometric, squared, sci-fi character that reads "future radar/HUD". Used sparingly (h1–h2, logo, big stats) so it stays impactful.
- **Space Grotesk** — body/UI. Retains a subtle technical/geometric flavor but with excellent readability at 16px; the workhorse of the interface.
- **JetBrains Mono** — data/meta. Terminal and "scientific-notation" voice for eyebrows, labels, tags, timestamps, copyright, `//` comments. Instantly signals the AI/ML/engineer identity.

**Font stacks**
```css
--font-display: 'Orbitron', 'Space Grotesk', system-ui, sans-serif;
--font-body:    'Space Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif;
--font-mono:    'JetBrains Mono', ui-monospace, 'Cascadia Code', 'Consolas', monospace;
```

### Type scale (final)

| Token | Font | Size desktop | Size mobile | Weight | Line-height | Letter-spacing | Case |
|---|---|---|---|---|---|---|---|
| `h1` display | Orbitron | **64px** | **40px** | 700 | 1.08 | **0.04em** | UPPERCASE |
| `h2` section | Orbitron | **40px** | **30px** | 600 | 1.15 | **0.03em** | UPPERCASE |
| `h3` | Space Grotesk | **24px** | **21px** | 600 | 1.25 | -0.01em | Normal |
| `h4` | Space Grotesk | **20px** | **18px** | 600 | 1.3 | -0.01em | Normal |
| `.lead` | Space Grotesk | **18px** | **16px** | 400 | 1.6 | 0 | Normal |
| `body` | Space Grotesk | **16px** | **15px** | 400 | **1.65** | 0 | Normal |
| `.small` | Space Grotesk | **14px** | **13px** | 400 | 1.5 | 0.01em | Normal |
| `.eyebrow` | JetBrains Mono | **12px** | **12px** | 500 | 1.4 | **0.22em** | UPPERCASE |
| `.mono-label` | JetBrains Mono | **13px** | **12px** | 400 | 1.5 | 0.05em | Normal |
| `.stat-value` | JetBrains Mono | **14px** | **13px** | 500 | 1.4 | 0.02em | Normal |

**Behavioral rules**
- Max body measure: **68ch** (use `max-width: 68ch` on paragraph blocks).
- h1 never wraps mid-word by default; hero name uses `--grad-text` gradient clipped to text.
- Never set body text letter-spacing wider than 0.02em.
- Mono labels are always uppercase where marked; do not uppercase `//` prefixed code comments.

---

## 4. Spacing, Grid & Layout

### 4.1 Spacing scale — base unit **8px**

| Token | Value | Typical use |
|---|---|---|
| `--space-1` | 4px | icon gaps |
| `--space-2` | 8px | tight inline gaps |
| `--space-3` | 12px | chip padding, small gaps |
| `--space-4` | 16px | card inner padding (tight), gap between nav items |
| `--space-6` | 24px | card padding, grid gutter, form field gaps |
| `--space-8` | 32px | section sub-gaps, hero internal gap |
| `--space-12` | 48px | between major blocks inside a section |
| `--space-16` | 64px | between sub-sections |
| `--space-24` | 96px | tablet section vertical padding |
| `--space-32` | 128px | **desktop section vertical padding** |

### 4.2 Layout primitives

```css
--container-max: 1200px;
--container-pad: clamp(20px, 5vw, 32px);   /* min 20, max 32 */
--section-pad-v: clamp(72px, 10vw, 128px); /* 72 mobile → 128 desktop */
--grid-gutter: 24px;
```

- **Container:** `max-width: 1200px; margin-inline: auto; padding-inline: var(--container-pad);`
- **Grid system:** 12-column fluid grid, explicit `grid-template-columns: repeat(12, 1fr)` with `column-gap: 24px`, used selectively on desktop; mobile stacks to 1 column.

### 4.3 Section map (order + ids)

| # | Section | id | Anchor |
|---|---|---|---|
| 1 | Hero (3D canvas) | `hero` | `#home` |
| 2 | About / Skills | `about` | `#about` |
| 3 | Projects | `projects` | `#projects` |
| 4 | Experience timeline | `experience` | `#experience` |
| 5 | Contact | `contact` | `#contact` |

### 4.4 Hero layout (desktop)

- **Grid:** `grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr); column-gap: 56px; align-items: center;` min-height `calc(100vh - 72px)`.
- **Left column (text):** eyebrow → h1 (≤ 3 lines) → lead paragraph → CTA row → stat row (3 stats: e.g. `3+ yrs code`, `12+ projects`, `∞ curiosity`, using `.stat-value` mono in `--success-energy`).
- **Right column (canvas):** fixed-ratio stage `aspect-ratio: 4 / 5; max-height: 560px;` — a positioned wrapper containing `<canvas id="hero-canvas">` (Three.js particles: morphing particle field / torus knot + particle stream; camera subtle auto-orbit; color palette limited to cyan/magenta/purple with additive blending). Canvas fills wrapper `absolute; inset: 0`.
- Overlay on canvas: two radial glows behind the mesh (`--glow-cyan` top-left, `--glow-magenta` bottom-right, both `filter: blur(80px)`), plus a thin dashed "scanline" ring decoration (`border: 1px dashed rgba(0,240,255,0.25)` inside a corner bracket frame).
- Corner brackets: 4 L-shaped 24×24px borders (cyan, 2px) at the canvas wrapper corners — classic sci-fi targeting frame.

### 4.5 Projects grid

- **Desktop (≥1024):** `grid-template-columns: repeat(2, 1fr); gap: 28px;`
- **Wide (≥1440):** optionally `repeat(3, 1fr)` only when ≥ 6 cards; card content must remain read-worthy (min card width ~380px).
- **Mobile (<640):** 1 column.
- **Card aspect:** image area `aspect-ratio: 16 / 10` (min-height 200px); card total height auto.
- **Tablet (640–1023):** 2 columns, gap 20px.

### 4.6 Timeline layout

- **Desktop ≥1024:** central vertical line at `left: 50%`; items alternate left/right, each item width `calc(50% - 40px)`.
- **Tablet/Mobile <1024:** line at `left: 24px`; single column; card `margin-left: 64px`.

### 4.7 Z-index map

| Layer | z-index |
|---|---|
| Preloader | `9999` |
| Navbar + scroll progress | `1000` |
| Mobile menu overlay | `900` |
| Cursor glow | `800` |
| Content | `10` |
| Background grid + orbs (fixed) | `0` (behind all, `position: fixed; z-index: -1`) |

---

## 5. Global Atmosphere Layers

Rendered once on `<body>` via CSS pseudo-elements / fixed divs — **not** in the hero canvas only:

1. **Grid overlay** — `position: fixed; inset: 0; z-index: 0;`
   - `background-image: linear-gradient(rgba(148,163,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,255,0.05) 1px, transparent 1px);`
   - `background-size: 48px 48px;`
   - Mask: `radial-gradient(1200px 800px at 50% 0%, black, transparent 75%)` so grid fades toward bottom.
2. **Two ambient orbs** — fixed, `filter: blur(120px); opacity: 0.14;`
   - Orb A: `#00f0ff` radial, top-left, size 520px.
   - Orb B: `#ff2d95` radial, bottom-right, size 460px.
   - Slow drift animation: translate ±40px over 14s linear alternate; paused under `prefers-reduced-motion`.
3. **Noise/vignette:** subtle `radial-gradient` vignette at edges (`rgba(0,0,0,0.55)` → transparent) to focus the eye on the center.

---

## 6. Component Design System

### 6.1 Preloader
- **Structure:** fixed full-screen `#05060f`; centered 56px square glass tile with `KA` in Orbitron 700 22px, cyan text + `--glow-cyan`; below it a **220px × 3px** progress track (`rgba(148,163,255,0.15)`), fill `--grad-primary` scaling 0→100%; below that `00%` counter in JetBrains Mono 13px `--text-muted`.
- **Behavior:** counter increments every 30ms by random 1–4%; at 100% hold 200ms → container `opacity 0` 400ms + translateY(-12px) → `display: none` (removed from DOM via JS).
- **Total duration:** ≤ 1.6s. **Reduced motion:** skip animation; fade out in 100ms.

### 6.2 Navbar
- **Bar:** fixed top; `height: 72px` desktop / `64px` mobile; `background: rgba(5, 6, 15, 0.7); backdrop-filter: blur(20px) saturate(140%); border-bottom: 1px solid var(--glass-border);` transparent until scrollY > 40px, then same glass + `0 8px 32px rgba(0,0,0,0.4)` and height shrinks to 60px (transition 300ms).
- **Logo (left):** `KALIDAS.ASHOK` — JetBrains Mono 500 14px, `#f4f6ff`; the `.` is cyan and glows (`text-shadow: 0 0 8px rgba(0,240,255,0.8)`).
- **Links (right):** `HOME / ABOUT / PROJECTS / EXPERIENCE / CONTACT` — Space Grotesk 500 14px, `letter-spacing: 0.08em; color: var(--text-muted);` hover `#00f0ff` + 2px gradient underline (scaleX 0→1, 200ms). Active (in-view section) link: cyan text + underline at full scale.
- **Scroll progress bar:** 3px tall strip at the very top of the navbar; `background: var(--grad-primary)`; width = `(scrollY / (docHeight − vh)) × 100%`, updated on scroll (rAF-throttled); `box-shadow: 0 0 12px rgba(0,240,255,0.6)`.
- **Mobile (<640):** hamburger (2× 2px lines, cyan, 24×24 target) → full-screen overlay (`#05060f` 95%) with links stacked 56px apart, each fading up with 60ms stagger; close on link click or × button.

### 6.3 Buttons
Shared: `border-radius: 12px; font: 500 15px Space Grotesk; height: 48px; padding: 0 28px; cursor: pointer; transition: all 200ms cubic-bezier(0.16,1,0.3,1);` focus-visible outline (see §10).

**Primary (glow)** — "View Projects", "Hire Me"
- Rest: `background: #00f0ff; color: #04121a; box-shadow: 0 0 20px rgba(0,240,255,0.35);`
- Hover: `background: #39f7ff; transform: translateY(-2px); box-shadow: 0 0 36px rgba(0,240,255,0.55);`
- Active: `transform: translateY(0) scale(0.98);`

**Ghost** — "Download CV"
- Rest: transparent bg; `border: 1px solid rgba(148,163,255,0.35); color: #c7cbe0;`
- Hover: `border-color: #00f0ff; color: #00f0ff; box-shadow: 0 0 16px rgba(0,240,255,0.25); transform: translateY(-2px);`
- Active: `scale(0.98)`.

**Sizes:** default 48px height; `.btn-sm` 36px, padding `0 18px`, font 13px.

### 6.4 Skill chips
- **Structure:** flex-wrap gap 10px.
- **Chip:** `height: 32px; padding: 0 14px; border-radius: 999px; display: inline-flex; align-items: center; gap: 8px;` glass bg (`rgba(10,12,26,0.6)` + `backdrop-filter: blur(8px)`), `border: 1px solid rgba(0,240,255,0.35);` JetBrains Mono 12px, `color: #c7cbe0;` letter-spacing 0.04em.
- **Hover:** `border-color: #00f0ff; color: #00f0ff; box-shadow: 0 0 12px rgba(0,240,255,0.35); transform: translateY(-1px);` transition 200ms.
- Optional leading dot: 6px `#00ff9d` circle with `box-shadow: 0 0 6px rgba(0,255,157,0.8)` on active/highlight chips.
- **Category chips** (e.g. "AI/ML" vs "Frontend"): border magenta, hover magenta glow — signifying family grouping.

### 6.5 Project cards
- **Container:** `<article>` with `.project-card`; `position: relative; border-radius: 16px; overflow: hidden; background: linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)), rgba(13,16,32,0.55); border: 1px solid var(--glass-border); backdrop-filter: blur(18px);`
- **Gradient border on hover:** use double-background technique — `border: 1px solid transparent; background: linear-gradient(rgba(13,16,32,0.9), rgba(13,16,32,0.9)) padding-box, var(--grad-primary) border-box;` with the gradient border fading in on hover (opacity 0→1, 300ms).
- **Image area:** `aspect-ratio: 16/10; overflow: hidden; position: relative;` inner `<img>` `width: 100%; height: 100%; object-fit: cover; transform: scale(1.02);` → hover `scale(1.06)` 600ms `ease-out`. Overlay: dark gradient bottom + corner tag (mono 11px cyan) and hover scanline sweep (1px cyan gradient line translating top→bottom, 700ms).
- **Content:** `padding: 24px;` — title h3 22px `#f4f6ff`; description 14px `--text-muted` (max 3 lines, `-webkit-line-clamp`); tags row (plain mono 11px chips, static).
- **Hover:** `transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 24px rgba(0,240,255,0.15);` 300ms.
- **3D tilt:** JS `mousemove` rotateX/rotateY up to **±4°**, `perspective: 1200px`, transition 200ms, disabled on touch/reduced-motion.
- **Whole card is a link** (focusable, `aria-label` = project name + summary).

### 6.6 Experience timeline
- **Container:** `position: relative;`
- **Line:** 2px wide, `transform-origin: top;` gradient `linear-gradient(180deg, rgba(0,240,255,0.15), #00f0ff 30%, #a78bfa 70%, #ff2d95)`; drawn via `scaleY(progress)` where progress goes 0→1 as the timeline scrolls through its trigger window (see §8.6). Base rail underneath: `rgba(148,163,255,0.10)` full height.
- **Node:** 14px circle at the line; `background: #05060f; border: 2px solid #00f0ff; box-shadow: 0 0 0 4px rgba(0,240,255,0.12), 0 0 16px rgba(0,240,255,0.6);` scales 0→1 + glow intensifies when node enters viewport.
- **Item card:** glass panel (recipe §6.5 without image), `padding: 24px; border-radius: 16px;` width per §4.6; `max-width: 460px; margin-inline-start: auto` for right-side items (and vice versa).
- **Card content:** year `.mono-label` cyan 13px; role h3 20px `#f4f6ff`; company + location 13px `--text-muted`; bullet description 14px `--text-body`; optional 2 tech tags (mono 11px).
- **Connector (desktop):** 40px horizontal hairline `rgba(0,240,255,0.3)` from card edge to the central line.

### 6.7 Section headers
- **Eyebrow:** `01. ABOUT` style — JetBrains Mono 12px 500, `letter-spacing: 0.24em; color: #00f0ff;` prefix a `//` in `--text-faint`. Numbered 01–04.
- **Title h2:** Orbitron 40px 600 uppercase `#f4f6ff` (mobile 30px).
- **Gradient underline:** 120px × 3px `var(--grad-primary)` below title, `border-radius: 3px; box-shadow: 0 0 12px rgba(0,240,255,0.5);` animates `scaleX(0)→1` on reveal.
- **Subtitle (optional):** `.lead` `--text-muted`, max-width 68ch.

### 6.8 Contact form
- **Layout:** grid 2 columns (name / email), full-width message, submit row. `gap: 20px`.
- **Field spec:** `input/textarea`: `background: rgba(10,12,26,0.7); border: 1px solid rgba(148,163,255,0.2); border-radius: 12px; color: #f4f6ff; padding: 14px 16px; font: 400 15px Space Grotesk;` input height 52px; textarea min-height 140px, resize vertical.
- **Label:** JetBrains Mono 12px uppercase 500, `letter-spacing: 0.14em; color: var(--text-muted);` margin-bottom 8px.
- **Placeholder:** `--text-faint`.
- **Focus:** `border-color: #00f0ff; box-shadow: 0 0 0 3px rgba(0,240,255,0.15), 0 0 16px rgba(0,240,255,0.2);` outline none.
- **Valid state:** `border-color: #00ff9d; box-shadow: 0 0 0 3px rgba(0,255,157,0.12);` helper message in `#00ff9d`.
- **Error state:** `border-color: #ff2d95; box-shadow: 0 0 0 3px rgba(255,45,149,0.12);` helper message in `#ff2d95`, `aria-describedby` + `aria-invalid="true"`.
- **Submit:** primary button (§6.3), disabled state `opacity: 0.5`.
- **Social icon buttons:** 44×44px circles (WCAG target), glass bg, 1px `--glass-border`, inline SVG icons `#c7cbe0` (GitHub, LinkedIn, Email, X/Twitter); hover: `background: rgba(0,240,255,0.1); border-color: #00f0ff; color: #00f0ff; transform: scale(1.06) translateY(-2px); box-shadow: 0 0 16px rgba(0,240,255,0.25);` staggered reveal 80ms.
- **Info:** email `hello@kalidasashok.dev` as a mono link with cyan underline.

### 6.9 Footer
- `border-top: 1px solid var(--glass-border); padding: 48px 0;` flex space-between, wrap.
- Left: `© 2026 KALIDAS ASHOK` — mono 13px `--text-muted`.
- Center: `BUILT WITH VANILLA HTML · CSS · JS + THREE.JS` — mono 11px `--text-faint`.
- Right: `BACK TO TOP ↑` link — mono 12px, hover cyan, smooth-scrolls to `#hero`.

### 6.10 Custom scrollbar & selection
- **WebKit:** width 10px; track `#05060f`; thumb `linear-gradient(180deg, #00f0ff, #a78bfa, #ff2d95)`, `border-radius: 8px`; thumb hover `filter: brightness(1.2)`.
- **Firefox:** `scrollbar-color: rgba(0,240,255,0.7) #05060f; scrollbar-width: thin;`
- **Selection:** `::selection { background: rgba(0,240,255,0.9); color: #04121a; }`

---

## 7. Micro-interactions & Motion Language

| # | Interaction | Exact spec | Disable when |
|---|---|---|---|
| 1 | **Cursor glow** | Fixed div, 380px radial `rgba(0,240,255,0.06)` + 10px cyan core dot; follows mouse with lerp (factor 0.12), `mix-blend-mode: screen`; on hover over interactive elements scales to 1.6× and tint shifts to magenta. `pointer-events: none; z-index: 800;` | touch devices, `prefers-reduced-motion` |
| 2 | **Magnetic buttons** | All `.btn`, social icons, nav CTA: on `mousemove` translate toward cursor by max **6px** (lerp 0.3 per frame); on leave, spring back 400ms `cubic-bezier(0.16,1,0.3,1)`. Baseline `transform` (hover lift) must compose with magnetic offset. | touch, reduced-motion |
| 3 | **Hero glitch reveal** | h1 layered with `::before`/`::after` copies (cyan/magenta) using `text-shadow: -2px 0 #00f0ff, 2px 0 #ff2d95`; on load: 3 flicker bursts at keyframes 0ms (visible), 80ms (shift x -3px), 160ms (shift x +3px), settle 240ms; each burst 60ms. Chromatic aberration then resolves to clean gradient text. Also triggers once on hero re-entry. | reduced-motion → plain fade |
| 4 | **Hover transforms** | Buttons: `translateY(-2px)`. Cards: `translateY(-6px)` + glow. Chips: `translateY(-1px)`. Social: `scale(1.06) translateY(-2px)`. All 200–300ms `cubic-bezier(0.16,1,0.3,1)`. | — |
| 5 | **Smooth scroll** | `html { scroll-behavior: smooth; }` + JS click handlers on anchors with `scroll-margin-top: 96px` on each section to offset the fixed navbar. | reduced-motion → instant jump |
| 6 | **Reveal motion** | See §8 for per-element values. Globals: enter `opacity 0→1` + `translateY(24px)→0`; easing `cubic-bezier(0.16,1,0.3,1)`; remove `aria-hidden` after reveal. | reduced-motion → opacity-only 400ms |
| 7 | **Hero parallax** | On scroll: canvas wrapper `translateY(scrollY × 0.2)` (max 200px), orbs `× 0.3`, hero text `× 0.1` (gives depth gradient). rAF-throttled. | mobile <1024, reduced-motion |
| 8 | **Three.js canvas** | Particle field (≈ 1200 points, additive blending, cyan/purple), slow auto-rotation 0.0008 rad/frame; gentle mouse parallax on camera (lerp 0.05); pauses when tab hidden; DPR capped at 2. | reduced-motion → static render, no auto-rotate |

---

## 8. Scroll Animation Scheme

**Global observer config (all reveals):**
- `IntersectionObserver({ threshold: 0.15, rootMargin: '0px 0px -12% 0px' })` → an element reveals when its top edge crosses **88% of the viewport height** (i.e., when it enters the lower 12% band, it's already 12% up).
- Observe **once** (`unobserve` after trigger) for entrance animations.
- Every animated element gets `will-change: transform, opacity` only while animating (remove after).
- Easing shorthand used below: **E** = `cubic-bezier(0.16, 1, 0.3, 1)`.

### 8.1 Hero (load sequence — no scroll dependency)

| Element | Animation | Delay | Duration | From |
|---|---|---|---|---|
| Background grid fade | opacity | 0ms | 900ms | 0 |
| Eyebrow (`<p>` mono) | fade-up | 100ms | 400ms | y: -14px |
| h1 | glitch reveal (§7.3) | 200ms | 600ms | — |
| Lead paragraph | fade-up | 500ms | 500ms | y: 16px |
| CTA buttons row | fade-up, each | 700ms / +100ms each | 400ms | y: 16px |
| Stats row | fade-up | 900ms | 500ms | y: 12px |
| Canvas + frame | fade-in + scale | 300ms | 1000ms | scale 0.96 |
| Scroll-down indicator (⌄ mono, bottom center) | bounce | 1400ms | infinite | y: 0→8px, 2s loop |

### 8.2 Section headers (all sections identical)

| Element | Animation | Trigger | Stagger | Duration |
|---|---|---|---|---|
| Eyebrow | fade-up 14px | 88% vh | 0ms | 500ms E |
| h2 | fade-up 20px | 88% vh | 100ms | 600ms E |
| Gradient underline | scaleX 0→1 | 88% vh | 200ms | 700ms E |

### 8.3 About / Skills

| Element | Animation | Trigger | Stagger | Duration |
|---|---|---|---|---|
| Bio paragraphs (left) | fade-up 24px | 88% vh | 0ms | 600ms E |
| Skills container | fade-right 32px | 88% vh | 0ms | 700ms E |
| Skill chips (children) | fade-up 10px | 88% vh | **i × 60ms** (i = chip index) | 450ms E |
| Stat numbers (count-up) | count 0→N, mono `--success-energy` | 80% vh | 0ms | 1200ms linear |

### 8.4 Projects

| Element | Animation | Trigger | Stagger | Duration |
|---|---|---|---|---|
| Card (desktop, 2-col) | fade-up 24px | 88% vh | **i × 120ms** | 700ms E |
| Card image | scale 1.06→1 | with card | 100ms after card | 800ms E |
| Gradient border | opacity 0→1 | card hover (not scroll) | — | 300ms E |

### 8.5 Experience timeline

| Element | Animation | Trigger / progress | Stagger | Duration |
|---|---|---|---|---|
| Rail visible full height | static `rgba(148,163,255,0.10)` | always | — | — |
| Draw line (gradient overlay) | `scaleY(progress)` — progress = 0 when container top hits **80% vh**, 1 when container bottom hits **30% vh** (linear, rAF + scroll listener) | scroll | — | n/a (scroll-bound) |
| Node | scale 0→1, glow 0→0.6 | node top at **70% vh** | i × 150ms | 500ms E (spring-ish) |
| Left cards | slide-from-left −40px fade | 88% vh | i × 150ms | 700ms E |
| Right cards | slide-from-right +40px fade | 88% vh | i × 150ms | 700ms E |
| Mobile (all cards) | fade-up 24px | 88% vh | i × 120ms | 650ms E |

### 8.6 Contact

| Element | Animation | Trigger | Stagger | Duration |
|---|---|---|---|---|
| Form panel | fade-up 24px | 88% vh | 0ms | 600ms E |
| Inputs (name/email/message) | fade-up 14px | form reveal +200ms | i × 80ms | 500ms E |
| Submit button | fade-up + magnetic enabled | form reveal +400ms | 0ms | 500ms E |
| Social icons | fade-up 12px | 88% vh | i × 80ms | 450ms E |

### 8.7 Fallback contract
If `IntersectionObserver` is unavailable: all `.reveal` elements render fully visible, no script errors (progressive enhancement).

---

## 9. Responsive Behavior

Mobile-first; exact changes per breakpoint (`min-width`):

| Breakpoint | WIDTH | What changes |
|---|---|---|
| **Base (mobile)** | < 640px | 1-col everything. Hero: single column, text first, canvas after (`aspect-ratio: 16/10; height: 320px;`), corner brackets shrink to 16px. Nav: hamburger → full-screen overlay. h1 40px. Section padding 72px. Projects 1-col. Timeline: line at `left: 24px`, cards `margin-left: 64px`, connectors hidden. Contact form: 1-col. Stats: 3-col still (small mono values) or wrap to 3-up with 8px gap. |
| **Tablet** | 640–1023px | Hero: 2-col preserved (`minmax(0,1fr) minmax(0,1fr)`, gap 40px), canvas `aspect-ratio: 4/5`. Nav: full links still fit at ≥ 640 (14px ls 0.06em); hamburger only < 640. Section padding 96px. Projects: 2-col, gap 20px. Timeline: left rail (as mobile). Footer stacks vertically. |
| **Desktop** | ≥ 1024px | Full spec as designed: expanded navbar, hero 1.05fr/0.95fr, section padding 128px, 2-col projects gap 28px, timeline center line with alternating cards + connectors. Career stats remain right of hero. |
| **Wide** | ≥ 1440px | Container can open to `1280px`; projects may go 3-col when ≥ 6 items; font sizes scale up to max of scale (no further increase). |

**Fluid rules:** `--section-pad-v: clamp(72px, 10vw, 128px)`; h1 `clamp(40px, 7vw, 64px)`; h2 `clamp(30px, 5vw, 40px)`.

**Landscape small-height (e.g. 667px tall):** hero `min-height` drops from `100vh - 72px` to auto; canvas capped at `min(560px, 60vh)`.

---

## 10. Accessibility Standards

Target **WCAG 2.1 AA** across the board.

### 10.1 Semantic structure
- Landmarks: `<header>` (nav), `<main>`, each section as `<section aria-labelledby="id-of-its-h2">`, projects each `<article>`, timeline as `<ol>` with `<li>` items (semantic order), contact in `<section>` + `<form>`.
- Exactly **one h1** (hero). Headings descend h1→h2→h3 without skipping.
- `<html lang="en">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, descriptive `<title>`.
- Skip link: visually-hidden `Skip to content` link (first element in body, becomes visible on focus) jumping to `#main`.
- Decorative canvas has `role="img"` + `aria-label="Animated 3D particle field"` **or** `aria-hidden="true"` (choose: aria-hidden, since it's decorative; compensate with text content).
- Timeline visual order must match DOM (`order: 1`/`2` only within one row, never reversed on alternate rows; mobile uses same DOM order).

### 10.2 Focus & keyboard
- Global `:focus-visible`: `outline: 2px solid #00f0ff; outline-offset: 3px; border-radius: inherit;` never removed.
- All interactive elements keyboard-operable: nav links, hamburger (Esc closes overlay and returns focus), buttons, card links, form fields, social links.
- Custom scrollbar/selection don't affect keyboard.

### 10.3 Motion & sensory
- `@media (prefers-reduced-motion: reduce)`: kill glitch, tilt, parallax, magnetic, preloader count, cursor glow, orb drift, auto-rotate canvas → static frame; all scroll reveals become plain opacity 400ms; `scroll-behavior: auto`.
- Never communicate state by color alone: form valid/error includes icons (`✓` mono in green / `!` in magenta) plus `aria-invalid` and `aria-live="polite"` status text.
- Timeline year is text, not color-dependent.

### 10.4 Form & ARIA
- Every field: real `<label for>`; `aria-describedby` on helper messages; `aria-invalid` toggling; `aria-live="polite"` container for submit status ("Message sent" / error summary).
- Icon-only social buttons: `aria-label="GitHub profile"` etc.
- Error messages: linked to field, visible text (not placeholder-only).

### 10.5 Contrast & targets
- See §2 table — all readable text ≥ 4.5:1 (body/muted 6.4–12.3:1).
- Touch/click targets ≥ 44×44px (chips are 32px tall by necessity → ensure 44px hit area via padding/`::after` expansion; same for nav links row).

### 10.6 Text sizing
- Design must remain usable with browser zoom to 200% (fluid clamps + no horizontal overflow; `overflow-x: clip` on body as safeguard only, never on content).

---

## 11. Performance & Implementation Notes

- **Fonts:** preconnect to `fonts.googleapis.com` + `fonts.gstatic.com`; single CSS2 request; `display=swap`.
- **Hero canvas:** `requestAnimationFrame` loop; pause on `document.hidden`; `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`; dispose Three.js scene on teardown.
- **Images:** lazy-load all below-the-fold images (`loading="lazy"` + `decoding="async"`); hero has no raster (pure canvas); project thumbnails served at ~800px wide, WebP/AVIF, dark-prepped (black backgrounds preferred in image art direction).
- **JS structure:** 7 small modules — `preloader.js`, `nav.js`, `skip.js`, `observer.js` (reveals + timeline progress), `tilt.js`, `magnetic.js`, `cursor.js`, `hero-canvas.js` (Three.js). No bundler; regular `<script type="module">`.
- **CSS:** single `styles.css` with design tokens at `:root`; critical navbar/preloader styles in `<head>` `<style>` block.
- **Budget:** initial LCP ≤ 1.8s on 4G; total JS ≤ ~180KB gzip (Three.js ~150KB gzip dominates).
- **File structure (suggested):**
  ```
  portfolio/
  ├── index.html
  ├── css/styles.css
  ├── js/ (modules above)
  ├── assets/img/ (project thumbnails)
  └── DESIGN.md
  ```

---

*End of specification v1.0 — all values are final handoff tokens. Questions from the developer should be opened against this document, not resolved ad hoc.*

**Designer:** UI Designer Agent · **Date:** September 12, 2026 · **Status:** Approved for build