# The Contrarian Debate Club — Brand Guide

The visual system for the Contrarian Debate Club live app. It is implemented
in code as the `club-*` layer in `src/app/globals.css`; this document is the
human-readable spec. When the two disagree, the code is the source of truth —
update both together.

---

## 1. Essence

A members' salon for argument — old-world, intellectual, and unafraid of the
contrary view. The aesthetic is **gallery-at-night**: warm near-black walls,
gold leaf, candlelight, and chiaroscuro old-master paintings emerging from
shadow.

- **Feels like:** a private debating society, a Baroque gallery, a printed
  programme on heavy stock.
- **Not:** a SaaS dashboard, neon/tech, startup-bright, playful.

Three principles:

1. **Dark-first.** The canvas is near-black; gold and ivory do the talking.
2. **Typographic.** A high-contrast serif carries the brand; restraint over decoration.
3. **Considered.** Generous space, hairline rules, slow reveals — nothing shouts.

---

## 2. Logo

The wordmark is a three-line serif lockup:

```
        THE
   CONTRARIAN      ← gold (#B89B5E)
  DEBATE CLUB      ← ivory / white
```

### Variants

| Variant | File | Use |
|---|---|---|
| **Centered** | `public/contrarian-logo.svg` | Centered layouts only (e.g. the home entrance card) |
| **Left-aligned** | `public/contrarian-logo-left.svg` | Any left-aligned context (headers, sidebars, the presenter) — all three lines share one left edge |
| **"C" monogram** | `src/app/icon.png` · `favicon.ico` · `apple-icon.png` | Favicon / app icon. The C is drawn from the wordmark's own CONTRARIAN "C" on a dark gilded square |

**Rule:** match the variant to the layout. Centered logo in a left-aligned
header (or vice-versa) is the most common misuse — never do it.

In code, use the `<Logo>` component (`src/components/logo.tsx`):
`variant="center"` selects the centered file; the default (`"left"`) selects
the left-aligned file.

### Clear space & size

- **Clear space:** keep at least the cap-height of "DEBATE CLUB" clear on all sides.
- **Minimum width:** ~144px (`w-36`) for the full wordmark; below that use the C monogram.
- Reference sizes in app: `w-36` audience header, `w-44` admin headers, `w-56`–`w-64` entrance cards, `w-72` presenter.

### Don't

- Don't recolor the wordmark (gold + ivory only) or place it on light backgrounds without a dark panel behind it.
- Don't re-typeset it in another font, stretch, rotate, add shadows/outlines, or box it in.
- Don't reconstruct the lockup from live text — always use the SVG asset.

---

## 3. Color

Warm, soot-and-bitumen darks; gold leaf; candlelit ivory. CSS variables live in
`:root` (`globals.css`).

### Surfaces (near-black, warm)

| Token | Hex | Use |
|---|---|---|
| `--cc-black` | `#0b0907` | Base canvas (the shell) |
| `--cc-pitch` | `#0e0b08` | Slightly raised black |
| `--cc-obsidian` | `#14100b` | Panel base |
| `--cc-char` | `#1b160f` | Cards |
| `--cc-raise` | `#221b12` | Raised tiles |

### Gold leaf (accent)

| Token | Hex | Use |
|---|---|---|
| `--cc-gold` | `#c8a24a` | Primary gold — kickers, accents, rules |
| `--cc-gold-bright` | `#f0d36a` | Highlights, live states, primary-button top |
| `--cc-gold-deep` | `#8a6c2c` | Shadowed gold |

The logo's wordmark gold is `#B89B5E` (a hair softer than `--cc-gold`); keep it
for the asset, use `--cc-gold` for UI.

### Light & text

| Token | Hex | Use |
|---|---|---|
| `--cc-ivory` | `#f4ead2` | Primary text on dark |
| `--cc-parchment` | `#ddceac` | Secondary text |
| `--cc-muted` | `#9d9079` | Muted/supporting text |
| `--cc-faint` | `#6f6450` | Captions, disabled |

### Accent (sparingly)

| Token | Hex | Use |
|---|---|---|
| `--cc-wine` | `#7a221d` | Destructive / errors (background) |
| `--cc-wine-bright` | `#b8443c` | Destructive / errors (text, hover) |

### Hairlines

| Token | Value | Use |
|---|---|---|
| `--cc-line` | `rgba(200,162,74,.18)` | Default gold hairline borders |
| `--cc-line-strong` | `rgba(200,162,74,.42)` | Hover / emphasis borders, rules |

### Usage ratio

Roughly **70% dark surface · 22% ivory/parchment text · 8% gold**. Gold is
punctuation, not a fill — large gold areas are reserved for the primary button
and the "live" state.

---

## 4. Typography

Two families, both self-hosted via `next/font`.

| Role | Family | Token | Notes |
|---|---|---|---|
| **Display** | Playfair Display | `--font-display` | High-contrast Didone serif — all headings & the wordmark feel |
| **UI / body** | Inter | `--font-ui` | Labels, body, controls, data |
| **Mono-ish** | Inter, tabular nums | `.club-mono` | Codes, counts, timestamps (`font-variant-numeric: tabular-nums`) |

### Scale & treatments

- **`.club-display`** — Playfair 700, `line-height: 1.03`, `letter-spacing: -0.012em`. Used at `text-3xl` → `text-8xl`. Hero/presenter headings run large (`text-6xl`–`text-8xl`).
- **`.club-kicker`** — Inter 600, `0.7rem`, `letter-spacing: 0.34em`, uppercase, **gold**. Section eyebrows ("Live Salon", "Members' Entrance").
- **`.club-eyebrow`** — Inter 500, `0.68rem`, `0.22em`, uppercase, muted. Quieter labels.
- **`.club-label`** — Inter 600, `0.72rem`, `0.14em`, uppercase, muted. Form labels.
- **Body** — Inter, `--cc-muted` / `--cc-parchment`, comfortable line-height (`leading-7`/`leading-8`).

Rule of thumb: **Playfair for what you read, Inter for what you operate.**

---

## 5. Layout & surfaces

- **`.club-shell`** — full-bleed canvas: layered warm radial gradients over `--cc-black`, plus a **film-grain** overlay (`opacity .05`, `overlay` blend) and a **vignette**. Every full page sits on this.
- **`.club-panel`** — primary raised card: gradient char→black fill, `--cc-line` border, deep drop shadow, subtle top inner-highlight.
- **`.club-panel-quiet`** — flat, low-contrast grouping (nested blocks, messages).
- **`.club-panel-gold`** — gilded emphasis panel (sync card, selected states).
- **`.club-tile`** — small data tile (code/status, options).
- **`.club-rule`** / **`.club-rule-vertical`** — gold hairline divider (gradient, fades at ends).

**Radius:** everything is `2–3px`. Buttons/inputs/links default to `2px`
(`border-radius` on `button, a, input, textarea`). The brand is square and
printed-feeling, never pill-rounded (except the status `.club-chip`).

**Spacing:** generous. Panel padding `1.5rem`–`2.5rem` (`p-6`–`p-10`); section
gaps `1.25rem`–`1.5rem`.

---

## 6. Components

| Component | Class | Notes |
|---|---|---|
| Primary button | `.club-btn .club-btn-primary` | Gold gradient (`bright→gold`), dark ink text, gold glow shadow |
| Default button | `.club-btn` | Faint ivory fill, gold-line border; hover lifts 1px + gold border |
| Destructive button | `.club-btn .club-btn-danger` | Wine border/tint on hover |
| Chip | `.club-chip` | Pill, uppercase `0.18em`, gold-tinted |
| Live chip | `.club-chip-live` (+ `.club-chip-dot`) | Bright-gold; dot = pulsing live indicator |
| Input / textarea | `.club-input` | Dark fill, gold focus ring (`0 0 0 3px rgba(200,162,74,.15)`) |
| Link | `.club-link` | Gold, brightens on hover, 4px underline offset |

States: disabled → `opacity ~.42`; focus → gold ring; hover → 1px lift +
stronger gold border. Keep transitions ~160ms ease.

---

## 7. Motion

Restrained and slow. The signature is a **staggered page-load reveal**:

- **`.club-rise`** — fade + 10px rise, `560ms cubic-bezier(0.22, 1, 0.36, 1)`. Applied to the top container of each page so content settles in.
- Micro-interactions: 1px hover lifts, gold-border fades, result-bar fills (`500–700ms`).
- Respect `prefers-reduced-motion` (the reveal is disabled there). Honor it everywhere.

No bounce, no spring overshoot, no attention-seeking loops.

---

## 8. Imagery

Chiaroscuro Baroque / old-master paintings — figures emerging from darkness,
warm sepia, dramatic single-source light.

- **Treatment:** feather into the dark with a left→right mask and a scrim so
  gold text stays legible (`.club-art` + `.club-art-scrim`). Imagery emerges on
  one side; type lives on the near-black side.
- **Where:** high-impact full-screen surfaces only — currently the presenter
  display. Keep phone/operator screens typographic.
- **Sourcing:** public-domain (CC0) only. Current assets are from the Met Open
  Access collection — see `public/art/CREDITS.md`. Never use rights-encumbered art.

---

## 9. Iconography

- **Library:** [lucide-react](https://lucide.dev) — thin, geometric line icons.
- Size 14–22px inline with text; color inherits or `--cc-gold` for emphasis.
- Keep them sparse and functional; the brand leans typographic, not icon-heavy.

---

## 10. Voice & nomenclature

Articulate, dry, a little ceremonial — a debating society, not a product. Short
declaratives; classical framing over hype.

House vocabulary (use consistently):

- The home screen is the **Live Salon**; admin sign-in is the **Members' Entrance**.
- The events list is **The Ledger**; the operator view is **Host Control**.
- Attendees are the **house / audience**; the big screen is the **presenter / floor**.

Avoid: exclamation marks, emoji, growth-speak ("supercharge", "seamless"),
and tech jargon on audience-facing screens.

---

## 11. Reference

### Token summary

```
Surfaces  black #0b0907 · pitch #0e0b08 · obsidian #14100b · char #1b160f · raise #221b12
Gold      gold #c8a24a · bright #f0d36a · deep #8a6c2c   (wordmark gold #B89B5E)
Light     ivory #f4ead2 · parchment #ddceac · muted #9d9079 · faint #6f6450
Accent    wine #7a221d · wine-bright #b8443c
Lines     line rgba(200,162,74,.18) · line-strong rgba(200,162,74,.42)
Type      display: Playfair Display · ui: Inter
Radius    2–3px   Motion  club-rise 560ms ease-out
```

### Asset & code map

| Asset | Path |
|---|---|
| Design system (all `club-*` classes + tokens) | `src/app/globals.css` |
| Fonts wired | `src/app/layout.tsx` |
| Logo component | `src/components/logo.tsx` |
| Logo — centered | `public/contrarian-logo.svg` |
| Logo — left-aligned | `public/contrarian-logo-left.svg` |
| Favicon / app icons | `src/app/icon.png` · `favicon.ico` · `apple-icon.png` |
| Presenter imagery + credits | `public/art/` (`CREDITS.md`) |
