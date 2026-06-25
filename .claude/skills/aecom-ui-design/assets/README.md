# Assets

Drop-in AECOM UI kit:

- `aecom-theme.css` — link this; carries all tokens, base styles, `.aecom-*` components, motion, and the quality floor (focus + reduced-motion).
- `aecom-reveal.js` — `<script defer>` this for staggered scroll reveals on `[data-reveal]`.
- `skyline_hero_faint.{svg,png}` — faint hero backdrop skyline.
- `skyline_footer_teal.{svg,png}` — solid footer-band skyline.

SVG works in modern browsers; PNG is the safe fallback. Regenerate variants with `scripts/make_skyline.js` (change `--seed`).
