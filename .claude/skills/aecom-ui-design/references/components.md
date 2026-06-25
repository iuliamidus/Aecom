# AECOM UI — Component Recipes

Copy-paste markup for the core building blocks. All classes live in
`assets/aecom-theme.css`. Put `class="aecom"` on `<body>` (or a root wrapper) so
the base type/color cascade applies, then compose these inside.

> React/JSX note: these are plain classes, so they work in JSX as `className="…"`.
> In **Claude.ai React artifacts** (Tailwind-only, no custom config), don't rely on
> the CSS file — instead apply the token hex values inline via `style={{…}}` or use
> the closest Tailwind core utilities, keeping the same palette/discipline. For
> standalone projects, just link `aecom-theme.css`.

## Page shell
```html
<body class="aecom">
  <header class="aecom-nav aecom-nav--dark"> … </header>
  <section class="aecom-hero"> … </section>
  <section class="aecom-section"> … </section>
  <section class="aecom-section aecom-section--dark"> … </section>
  <img class="aecom-skyline-band" src="skyline_footer.png" alt="">
  <footer class="aecom-footer"> … </footer>
  <script src="aecom-reveal.js" defer></script>
</body>
```

## Nav / header
```html
<header class="aecom-nav aecom-nav--dark">
  <div class="aecom-container" style="display:flex;align-items:center;justify-content:space-between;width:100%">
    <span class="aecom-wordmark" style="font-size:1.25rem">AECOM</span>
    <nav>
      <a href="#">Markets</a><a href="#">Services</a><a href="#">Projects</a>
      <a class="aecom-btn aecom-btn--ghost" href="#">Contact</a>
    </nav>
  </div>
</header>
```
Use `aecom-nav--dark` over teal, or drop it for a white header (wordmark goes teal automatically).

## Hero (with skyline signature)
```html
<section class="aecom-hero">
  <img class="aecom-hero__skyline" src="skyline_hero_faint.png" alt="">
  <div class="aecom-container aecom-hero__inner">
    <span class="aecom-eyebrow">Infrastructure intelligence</span>
    <h1>Operational resilience for grid &amp; water.</h1>
    <p>One clear sentence of supporting copy — plain verbs, no filler.</p>
    <div style="display:flex;gap:.75rem;margin-top:1rem">
      <a class="aecom-btn aecom-btn--primary" href="#">Request a briefing</a>
      <a class="aecom-btn aecom-btn--ghost" href="#">View the platform</a>
    </div>
  </div>
</section>
```
The eyebrow + headline + one green CTA is the pattern. Children animate in on load automatically.

## Cards (feature grid)
```html
<section class="aecom-section">
  <div class="aecom-container">
    <span class="aecom-eyebrow">Strategic value</span>
    <h2>Predict. Protect. Respond.</h2>
    <div class="aecom-grid" data-reveal-group="120" style="margin-top:2rem">
      <article class="aecom-card" data-reveal>
        <span class="aecom-card__icon"><!-- inline SVG icon, currentColor --></span>
        <h3>Predict</h3><p>48-hour pre-storm asset risk and crew staging.</p>
      </article>
      <article class="aecom-card" data-reveal> … </article>
      <article class="aecom-card" data-reveal> … </article>
    </div>
  </div>
</section>
```
Cards are off-white with a soft shadow and lift on hover. **Never** add an accent
edge-stripe to a card — use the tint + shadow it already has.

## Stat callouts
```html
<section class="aecom-section aecom-section--dark">
  <div class="aecom-container" style="display:flex;gap:3rem;flex-wrap:wrap">
    <div data-reveal><div class="aecom-stat__num">~30%</div>
      <div class="aecom-stat__label">faster crew staging (illustrative)</div></div>
    <div data-reveal data-reveal-delay="120"><div class="aecom-stat__num">8M+</div>
      <div class="aecom-stat__label">residents served</div></div>
  </div>
</section>
```
Big green number + small warm-gray label. On dark sections the number brightens automatically.

## Buttons
```html
<a class="aecom-btn aecom-btn--primary" href="#">Primary CTA</a>   <!-- green: the one accent -->
<a class="aecom-btn aecom-btn--teal" href="#">Secondary</a>        <!-- teal solid -->
<a class="aecom-btn aecom-btn--ghost" href="#">Tertiary</a>        <!-- outline, adapts to bg -->
```
One green primary per view. Everything else teal or ghost.

## Section divider / band
```html
<img class="aecom-skyline-band" src="skyline_footer.png" alt="">
```
A solid teal skyline strip — use between a content section and the footer, or to
separate major sections. Flush full-width, no rounding.

## Footer
```html
<footer class="aecom-footer">
  <div class="aecom-container" style="padding-block:2rem;display:flex;justify-content:space-between;align-items:center">
    <span class="aecom-wordmark">AECOM</span>
    <span style="font-size:.85rem">© 2026 AECOM</span>
  </div>
</footer>
```

## Generating skyline images
```bash
# hero backdrop (faint) and footer band, then rasterize to PNG for <img>
node scripts/make_skyline.js --out hero.svg   --style hero   --fill 0E5C68 --accent 00A651 --opacity 0.2 --seed 5
node scripts/make_skyline.js --out footer.svg --style footer --fill 044955 --accent 00A651 --seed 11
node -e "const s=require('sharp');s('hero.svg',{density:200}).png().toFile('hero.png');s('footer.svg',{density:200}).png().toFile('footer.png')"
```
SVG works directly in modern browsers too — you can `<img src="footer.svg">` or inline it. PNG is the safe default. Pre-made `skyline_*.svg` are in `assets/`.

## Icons
Use inline SVG with `fill="currentColor"` / `stroke="currentColor"` so icons inherit
color. In a card, wrap in `.aecom-card__icon` (renders green). Keep them line-style
and simple — matching AECOM's clean, technical feel. Don't use emoji or clip-art.
