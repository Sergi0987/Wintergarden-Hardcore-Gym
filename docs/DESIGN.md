# Design system — Hardcore Fitness Winter Garden

The look: the gym floor at 5 a.m. Black rubber floor, red painted-wall signage with the
logo's torn stamp edge, white chalk text, and red LED interval-timer digits.

## Palettes

Two palettes share one token set in `site/assets/css/site.css`:

- **Dark** (default) — the gym floor.
- **Light** — `html[data-theme="light"]`. Paper ground, ink text, the black stamp logo
  (same colorway as the owner's third logo file) in the header.

Photo bands (hero, page headers), the floor clock, the class-length badge and the footer
stay dark in both. Visitors switch with the sun/moon button; the choice is remembered.
`?theme=light` or `?theme=dark` on any URL forces one (useful for showing the owner).

## Color tokens

| Token | Value | Job |
|---|---|---|
| `--bg` | #0d0d0d (light: #f6f6f5) | Page ground (rubber floor / paper) |
| `--bg-2` / `--bg-3` | #151515 / #1f1f1f (light: #fff / #ebebea) | Raised surfaces, hover |
| `--line` / `--line-2` | #2b2b2b / #3d3d3d (light: #d8d8d5 / #b5b5b1) | Rules and borders |
| `--ink` | #0d0d0d | Fixed black: headings on red, ink buttons |
| `--red` | #e31e26 | Logo red. Full-width bands, buttons, labels |
| `--red-deep` | #b8121a | Button hover |
| `--text` | #f5f5f3 (light: #0d0d0d) | Main text |
| `--text-2` / `--text-3` | #d2d2d2 / #a3a3a3 (light: #2c2c2c / #595959) | Body and secondary text |
| `--red-text` | #ff4a52 (light: #c3121a) | Small red text that must pass 4.5:1 |
| `--graphite` | #4a4a4a | "Winter Garden" grey from the black logo |
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
- Small text on red is always white (black on logo red fails contrast). Headings on red are ink.
- The class-row hover photo lives in its own grid column inside the row's rules; it never covers text.
- Phones get a booking bar after the first screen; it hides at the closing CTA and footer.
- Draft notes use `.draft` and hide with `?clean=1`.

## Logos

- `logo-panel.png` / `logo-full.png` — red panel, white letters (dark palette, footer).
- `logo-panel-black.png` / `logo-full-black.png` — black panel, white letters (light header,
  stamp on the closing red band). Made from the red files by mapping red to near-black.
