# Design system — Hardcore Fitness Winter Garden

The look: the gym floor at 5 a.m. Black rubber floor, red painted-wall signage with the
logo's torn stamp edge, white chalk text, and red LED interval-timer digits.

## Color (tokens in `site/assets/css/site.css` `:root`)

| Token | Value | Job |
|---|---|---|
| `--ink` | #0d0d0d | Page ground (rubber floor) |
| `--ink-2` / `--ink-3` | #151515 / #1f1f1f | Raised surfaces, hover |
| `--line` | #2b2b2b | Rules and borders |
| `--red` | #e31e26 | Logo red. Full-width bands, buttons, labels |
| `--red-deep` | #b8121a | Button hover |
| `--chalk` | #f5f5f3 | Text |
| `--steel` | #a3a3a3 | Secondary text on black |
| `--led` | #ff2b2b | LED digits (lit) |

Strategy: committed. Red owns whole bands (class list, CTAs, features), not small accents.
All photos are grayscale so the only color on the page is brand red.

## Type

- **Big Shoulders** 800–900, uppercase — headings. Max 6rem.
- **Big Shoulders Stencil** 900 — class names and signage moments (echoes the stencil logo).
- **Archivo** — body text; condensed width (75–80%) for labels and buttons.
- Fonts are self-hosted in `site/assets/fonts/`.

## Signature parts

- **LED digits** — `HF.led(text, suffix, label)` in `site.js` draws seven-segment SVG
  digits with unlit segments visible. Used for every time on the site.
- **Floor clock** — home hero panel: next class, start time, live countdown, coach, and a
  button that pre-fills the free class form with that exact class.
- **Torn edge** — `.band--red` adds the stamp edge top and bottom with a CSS mask.
- **Power-on test** — the clock lights 8:88 for a moment on load. Skipped for reduced motion.

## Rules

- Square corners everywhere. No rounded cards, no icon-card grids, no eyebrow labels above headings.
- Buttons: red solid (primary), ghost outline (secondary), ink solid on red bands.
- One spacing rhythm: `--section` between sections, more space above headings than below.
- Draft notes use `.draft` and hide with `?clean=1`.
