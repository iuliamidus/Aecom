---
name: aecom-ui-design
description: "Build web UI in AECOM's visual style — landing pages, dashboards, marketing sites, prototypes, and frontend components with AECOM's brand identity. Use whenever the user wants a website, web page, app UI, dashboard, prototype, or React/HTML/CSS component that should look like AECOM, mentions AECOM branding/style/theme for anything on-screen (as opposed to slides), or asks to 'AECOM-ify', 're-skin', or 'apply AECOM style' to a web interface. Also trigger for an interview/client/internal web deliverable that must match AECOM identity. Applies AECOM's minimal, infrastructure-led look: deep teal (#044955) anchor, a single green-haze accent (#00A651), generous white space, clean geometric-sans typography, a building-skyline signature motif, and restrained scroll/hover animation. Ships a drop-in CSS theme, ready component recipes, a scroll-reveal script, and a skyline generator. For PowerPoint/slides, use the aecom-pptx-branding skill instead."
license: Proprietary.
---

# AECOM UI Design

Build (or re-skin) **web UI** in AECOM's identity. This is the on-screen counterpart to the `aecom-pptx-branding` skill — same brand DNA (deep teal + one green accent, minimal, building-skyline signature, restrained motion), expressed in HTML/CSS/React instead of slides.

This skill **applies a defined brand**; it does not invent a new identity. For the craft layer (responsive, focus states, copy, restraint) follow `/mnt/skills/public/frontend-design/SKILL.md` — but the palette, type, and motif below always win.

## The AECOM look

Restrained and infrastructure-led. Mostly white space with a deep-teal anchor; **one** green highlight per view (a CTA, a stat, an eyebrow); clean geometric-sans headings over a neutral body; a flat building-skyline as the recurring signature. Dark sections are **teal, not near-black** — that's the deliberate choice that keeps it from collapsing into the generic "bright accent on black" AI look.

| Role | Hex |
|------|-----|
| Deep teal (anchor, nav, hero, dark sections) | `044955` |
| **Green Haze (the one accent / CTA)** | `00A651` |
| Turquoise bridge (sparingly) | `0E8F8C` |
| Off-white panel / card | `F4F6F6` |
| Warm gray (captions, muted) | `8C8279` |
| Ink (body) | `1A1A1A` |
| White (default bg) | `FFFFFF` |

Type: a geometric display face (Archivo / Futura / Century Gothic) for headings, eyebrows, stats, and the bold-italic `AECOM` wordmark; a neutral sans (Inter / system) for body.

Full rationale and usage discipline: `references/design-tokens.md`. Component markup: `references/components.md`.

## Workflow

### 1. Wire up the theme
Link the drop-in theme and put `class="aecom"` on the root so the base cascade applies:
```html
<link rel="stylesheet" href="assets/aecom-theme.css">
<!-- optional real faces -->
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,600..800;1,700..800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<body class="aecom"> … <script src="assets/aecom-reveal.js" defer></script> </body>
```
`aecom-theme.css` carries the tokens (CSS variables), base styles, all `.aecom-*` components, and the motion/quality-floor rules. `aecom-reveal.js` powers the scroll reveals.

### 2. Generate the skyline signature
The identity-carrying motif. It's web-native SVG (no licensing, infinite scale):
```bash
node scripts/make_skyline.js --out hero.svg   --style hero   --fill 0E5C68 --accent 00A651 --opacity 0.2 --seed 5
node scripts/make_skyline.js --out footer.svg --style footer --fill 044955 --accent 00A651 --seed 11
node -e "const s=require('sharp');s('hero.svg',{density:200}).png().toFile('hero.png');s('footer.svg',{density:200}).png().toFile('footer.png')"
```
Use the faint version as a hero backdrop (`.aecom-hero__skyline`) and the solid band above the footer (`.aecom-skyline-band`). Pre-made `skyline_*.svg` sit in `assets/`. Change `--seed` for a different skyline rhythm.

### 3. Compose the page
Build from the recipes in `references/components.md`: dark nav with wordmark → teal hero (eyebrow + headline + one green CTA + skyline backdrop) → white card grid → teal stat-callout section → skyline band → teal footer. Vary layouts; don't repeat one block. Use real, specific copy (active voice, no filler) — see the frontend-design writing guidance.

### 4. Add motion (minimal)
Mark section intros and grid items with `data-reveal` (stagger groups with `data-reveal-group="120"`); the hero animates on load automatically. Budget: a hero sequence + reveals on intros + card/button micro-interactions. That's all — scattered effects read as AI-generated. `prefers-reduced-motion` is already respected.

### 5. QA
Check responsive down to mobile, visible keyboard focus (green outline is built in), and contrast — especially that no green is being used as a background wash and dark sections are teal not black. If you can render (headless browser), screenshot and inspect; a picture is worth 1000 tokens.

## Re-skinning an existing page
Map the page's existing colors to the AECOM variables: backgrounds → white / teal, primary action → `--aecom-green`, headings → teal, dark sections → teal (not black). Swap the type to the display/body stacks, add the skyline to hero + footer, and replace scattered animation with the reveal pattern. Then QA contrast.

## Scripts & assets

| Path | Purpose |
|------|---------|
| `assets/aecom-theme.css` | Drop-in tokens + base + components + motion + quality floor. |
| `assets/aecom-reveal.js` | Dependency-free staggered scroll-reveal (honors reduced-motion). |
| `assets/skyline_*.svg` | Ready-made hero + footer skylines. |
| `scripts/make_skyline.js` | Generate AECOM skyline SVGs (footer / hero / band styles). |

## References
- `references/design-tokens.md` — full palette, type, spacing, motion rationale.
- `references/components.md` — copy-paste markup for nav, hero, cards, stats, buttons, dividers, footer (+ React/artifact notes).

## Guardrails
- **One green accent per view.** Headers teal, body ink. No green washes.
- **Dark = teal `#044955`, never near-black** — avoids the acid-green-on-black AI cliché.
- **No AI-slide/AI-page tells:** no accent stripes under headings or on card edges, no centered body text, no cramming, no rainbow.
- **Skyline is the signature** — include it; keep everything else quiet around it.
- **Quality floor:** responsive, `:focus-visible`, `prefers-reduced-motion` (all built into the theme — don't strip them).
- **Don't fabricate the official AECOM logo;** use the text wordmark or the user's supplied asset.
- For **slides**, use `aecom-pptx-branding` instead.
