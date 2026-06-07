# Mahoney Digital — Brand Assets

**Primary logo files (source of truth):**

- `logo-mark.svg` — Icon / monogram only (rounded square + bold M). Use for favicons, avatars, app icons, social, small UI, watermarks.
- `logo-lockup.svg` — Full horizontal lockup (mark + "Mahoney Digital" wordmark). Preferred for headers, email signatures, proposals, website nav, presentations.
- `logo-lockup-light.svg` — Reversed (white mark on transparent, white wordmark) for dark backgrounds.

**Preview images (for quick reference / sharing):**

- `logo-lockup-preview.jpg`
- `logo-mark-preview.jpg`
- `logo-in-use-preview.jpg`

**Legacy / printed:**

- Current VistaPrint business cards (as of June 2026) use an earlier circle variant of the M mark.
- See `../business-card/` for card sources (SVGs updated to rounded square for future runs; re-run `generate-business-cards.ps1` after changes).
- `../logo/` contains copies of the main assets for convenience (mahoneydigital-logo.jpg etc.).

## Usage Guidelines

- **Color:** Mark container is always `#0b1120` (ink) with white M for light contexts. Use the light variant on dark/ink or photo overlays.
- **Do not:** Stretch, change colors, add effects, recreate the M in a different weight, or place the mark too close to other elements. Minimum clear space ≈ 1/2 the mark height.
- **Wordmark:** Use the lockup SVG. When setting in other software, match Inter / system sans, 700 weight, tight tracking (-0.03em or similar).
- **Accent color (#0d9488 teal / #0f766e dark teal):** Use for CTAs, underlines, highlights, and the gradient bar on cards — not inside the primary logo mark itself.
- **Backgrounds:** Cream `#f8f6f1` (site), white, or ink `#0b1120`.

## Site Integration

The live site (site/index.html) uses an inline SVG version of the mark in the nav and footer so it stays pixel-perfect and self-contained on deploy. The favicon is also updated to match.

When the site is updated, keep the inline SVGs in sync with these source files (or switch to referencing the SVG files directly if the build process allows).

## Regenerating exports

- Business cards: Run the PowerShell in `../business-card/`.
- For other sizes / PNGs: Open the SVGs in Figma, Illustrator, or Inkscape and export at 2x/3x for web or 300dpi for print.

**Last updated:** June 2026 (logo system formalized)

**Contact:** hello@mahoneydigital.net
