#!/usr/bin/env node
/**
 * make_skyline.js — generate a minimal, AECOM-brand building skyline as SVG.
 *
 * The AECOM identity is infrastructure-led and restrained, with a heritage of
 * clean "line graphics". A flat vector skyline (no photos, no licensing issues)
 * is the most faithful, reusable motif. Use it as:
 *   - a thin footer band across every content slide (style "footer")
 *   - a large faint hero backdrop on the title slide (style "hero")
 *   - a divider element on section slides (style "band")
 *
 * Colors default to the AECOM palette but are overridable.
 *
 * Usage:
 *   node make_skyline.js --out skyline_footer.svg --style footer
 *   node make_skyline.js --out skyline_hero.svg   --style hero  --width 1600 --height 500
 *   node make_skyline.js --out sky.svg --style band --fill 00A651 --bg 044955 --seed 7
 *
 * Then in pptxgenjs: slide.addImage({ path: "skyline_footer.svg", x:0, y:5.0, w:10, h:0.6 })
 * (SVG renders in modern PowerPoint/365; rasterize with sharp if you need wider support.)
 */
const fs = require("fs");

function parseArgs() {
  const a = { out: "skyline.svg", style: "footer", width: 0, height: 0,
              fill: "044955", accent: "00A651", bg: "none", seed: 42, opacity: 1 };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i].replace(/^--/, "");
    const v = argv[i + 1];
    if (k in a) { a[k] = v; i++; }
  }
  a.width = parseInt(a.width) || 0;
  a.height = parseInt(a.height) || 0;
  a.seed = parseInt(a.seed) || 42;
  a.opacity = parseFloat(a.opacity);
  return a;
}

// deterministic PRNG so a given --seed always yields the same skyline
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hex(c) { return c.startsWith("#") ? c.slice(1) : c; }

function buildSkyline(w, h, rand, fill, accent, opacity) {
  // baseline along the bottom; buildings of varied widths/heights, a few accent-topped
  const parts = [];
  const base = h;
  let x = 0;
  const minW = Math.max(18, w * 0.02);
  const maxW = Math.max(40, w * 0.06);
  let i = 0;
  while (x < w) {
    const bw = minW + rand() * (maxW - minW);
    // height as a fraction of canvas, biased to a believable skyline rhythm
    const hf = 0.35 + rand() * 0.6;
    const bh = h * hf;
    const y = base - bh;
    parts.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="#${fill}"/>`);

    // occasional rooftop detail: a setback box or a thin mast in the accent color
    const detail = rand();
    if (detail > 0.78) {
      const sw = bw * (0.3 + rand() * 0.3);
      const sh = bh * (0.12 + rand() * 0.12);
      parts.push(`<rect x="${(x + (bw - sw) / 2).toFixed(1)}" y="${(y - sh).toFixed(1)}" width="${sw.toFixed(1)}" height="${sh.toFixed(1)}" fill="#${fill}"/>`);
    } else if (detail > 0.62) {
      const mh = bh * (0.18 + rand() * 0.18);
      parts.push(`<rect x="${(x + bw / 2 - 1).toFixed(1)}" y="${(y - mh).toFixed(1)}" width="2" height="${mh.toFixed(1)}" fill="#${accent}"/>`);
      parts.push(`<circle cx="${(x + bw / 2).toFixed(1)}" cy="${(y - mh).toFixed(1)}" r="2.4" fill="#${accent}"/>`);
    }

    // a small share of buildings get an accent "lit" top edge — the brand highlight
    if (rand() > 0.86) {
      parts.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="3" fill="#${accent}"/>`);
    }

    x += bw + (rand() * (w * 0.012)); // small irregular gaps
    i++;
  }
  return `<g opacity="${opacity}">${parts.join("")}</g>`;
}

function main() {
  const a = parseArgs();
  const fill = hex(a.fill), accent = hex(a.accent), bg = a.bg === "none" ? null : hex(a.bg);

  // sensible default canvases per style
  let w = a.width, h = a.height, opacity = a.opacity;
  if (a.style === "footer") { w = w || 2000; h = h || 140; opacity = a.opacity === 1 ? 1 : a.opacity; }
  else if (a.style === "hero") { w = w || 1600; h = h || 520; opacity = a.opacity === 1 ? 0.10 : a.opacity; }
  else if (a.style === "band") { w = w || 1600; h = h || 260; }
  else { w = w || 1600; h = h || 300; }

  const rand = mulberry32(a.seed);
  const skyline = buildSkyline(w, h, rand, fill, accent, opacity);
  const bgRect = bg ? `<rect width="${w}" height="${h}" fill="#${bg}"/>` : "";

  const svg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYEnd meet">
${bgRect}
${skyline}
</svg>`;

  fs.writeFileSync(a.out, svg);
  console.log(`wrote ${a.out} (style=${a.style}, ${w}x${h}, fill=#${fill}, accent=#${accent}, bg=${bg ? "#" + bg : "transparent"}, seed=${a.seed})`);
}

main();
