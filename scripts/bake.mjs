// Bake shared HTML into every page: node scripts/bake.mjs
//
// Pages keep working without this (site.js fills anything left empty), but baked pages
// carry their menu, footer, coaches, plans, events and schedule in the HTML itself, so
// search engines, link previews and visitors without JavaScript see the full page.
// Run it again after changing assets/js/data.js. It only rewrites what sits between
// <!-- bake:NAME --> and <!-- /bake:NAME --> markers, so it is safe to re-run.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const site = join(dirname(fileURLToPath(import.meta.url)), "..", "site");

// Load data.js and render.js the way a browser would.
const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of ["data.js", "render.js"]) vm.runInContext(readFileSync(join(site, "assets/js", f), "utf8"), ctx, { filename: f });
const HF = ctx.window.HF;
const R = ctx.window.HFRender;
const B = R.make(HF);

// "Today" in the gym's time zone, so events that already happened are left out.
const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: HF.gym.timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
  .formatToParts(new Date()).map((p) => [p.type, p.value]));
const ymd = `${parts.year}-${parts.month}-${parts.day}`;
const year = parts.year;

// Baked schedule shows Monday, the busiest day. In the browser it switches to today.
const BAKE_DAY = 1;

// One-time setup: turn empty placeholders into marker pairs.
const placeholders = [
  ["<div data-header></div>", "header"],
  ["<div data-footer></div>", "footer"]
];
const containers = [
  ["data-coach-strip></div>", "coach-strip"],
  ["data-coach-grid></div>", "coach-grid"],
  ["data-plans></div>", "plans"],
  ["data-events></ul>", "events"],
  ["data-day-tabs></div>", "day-tabs"],
  ["data-filters></div>", "filters"],
  ['data-schedule aria-live="polite"></ul>', "schedule"],
  ["data-class required aria-describedby=\"e-class\"></select>", "class-options"],
  ["data-map></div>", "map"]
];
function addMarkers(html) {
  for (const [ph, name] of placeholders) html = html.replace(ph, `<!-- bake:${name} --><!-- /bake:${name} -->`);
  for (const [tail, name] of containers) {
    const close = tail.slice(tail.lastIndexOf("</"));
    const open = tail.slice(0, tail.lastIndexOf("</"));
    html = html.replace(tail, `${open}<!-- bake:${name} --><!-- /bake:${name} -->${close}`);
  }
  return html;
}

// ---------- Search and link-preview tags ----------
const SITE = HF.gym.siteUrl.replace(/\/?$/, "/");
const decode = (t) => t.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const attr = (t) => R.esc(decode(t));
const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;

function gymData() {
  const a = HF.gym.address;
  return {
    "@context": "https://schema.org",
    "@type": "ExerciseGym",
    "@id": SITE + "#gym",
    name: HF.gym.name,
    url: SITE,
    telephone: HF.gym.tel,
    image: SITE + "assets/img/share.jpg",
    logo: SITE + "assets/img/logo-mark.png",
    address: { "@type": "PostalAddress", streetAddress: a.street, addressLocality: a.city, addressRegion: a.state, postalCode: a.zip, addressCountry: "US" },
    areaServed: ["Winter Garden", "Ocoee", "Windermere", "Horizon West", "Oakland"].map((n) => ({ "@type": "City", name: n + ", FL" }))
  };
}
function faqData(html) {
  const qa = [...html.matchAll(/<details><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)];
  if (!qa.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map((m) => ({ "@type": "Question", name: decode(m[1]), acceptedAnswer: { "@type": "Answer", text: decode(m[2].replace(/<[^>]+>/g, "")) } }))
  };
}
function headTags(file, html) {
  const noindex = /<meta name="robots" content="noindex">/.test(html);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || HF.gym.name;
  const desc = (html.match(/<meta name="description" content="([^"]*)">/) || [])[1] || "";
  const url = SITE + (file === "index.html" ? "" : file);
  let tags = `\n  <link rel="icon" href="favicon.ico" sizes="32x32">` +
    `\n  <link rel="icon" href="assets/img/icons/icon-192.png" type="image/png" sizes="192x192">` +
    `\n  <link rel="apple-touch-icon" href="assets/img/icons/apple-touch-icon.png">` +
    `\n  <link rel="manifest" href="site.webmanifest">` +
    (noindex ? "" : `\n  <link rel="canonical" href="${url}">`) +
    `\n  <meta property="og:type" content="website">` +
    `\n  <meta property="og:site_name" content="${attr(HF.gym.name)}">` +
    `\n  <meta property="og:title" content="${attr(title)}">` +
    `\n  <meta property="og:description" content="${attr(desc)}">` +
    `\n  <meta property="og:url" content="${url}">` +
    `\n  <meta property="og:image" content="${SITE}assets/img/share.jpg">` +
    `\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">` +
    `\n  <meta property="og:image:alt" content="Hardcore Fitness Winter Garden: Train hard on Beulah Road. Your first class is free.">` +
    `\n  <meta property="og:locale" content="en_US">` +
    `\n  <meta name="twitter:card" content="summary_large_image">`;
  if (file === "index.html") tags += "\n  " + jsonLd(gymData());
  const faq = faqData(html);
  if (faq && !noindex) tags += "\n  " + jsonLd(faq);
  return tags + "\n  ";
}

function fill(html, name, content) {
  const re = new RegExp(`(<!-- bake:${name} -->)[\\s\\S]*?(<!-- /bake:${name} -->)`);
  return re.test(html) ? html.replace(re, (_, a, b) => a + content + b) : html;
}

let count = 0;
for (const file of readdirSync(site).filter((f) => f.endsWith(".html"))) {
  const path = join(site, file);
  let html = addMarkers(readFileSync(path, "utf8"));
  if (!html.includes("<!-- bake:head -->")) html = html.replace("</head>", "  <!-- bake:head --><!-- /bake:head -->\n</head>");
  html = fill(html, "head", headTags(file, html));
  // The 404 page is served at any broken address, so its relative links need a fixed base.
  // It has to come before the first stylesheet or font link, so it sits right after <meta charset>.
  if (file === "404.html") {
    if (!html.includes("<!-- bake:base -->")) html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <!-- bake:base --><!-- /bake:base -->');
    html = fill(html, "base", `<base href="${SITE}">`);
  }
  const page = (html.match(/<body data-page="([^"]*)"/) || [])[1] || "";
  html = fill(html, "header", B.header(page));
  html = fill(html, "footer", B.footer(year));
  html = fill(html, "coach-strip", B.coachStrip());
  html = fill(html, "coach-grid", B.coachGrid());
  html = fill(html, "plans", B.plans());
  html = fill(html, "events", B.events(ymd));
  html = fill(html, "day-tabs", B.dayTabs(BAKE_DAY, -1));
  html = fill(html, "filters", B.filterButtons("all"));
  html = fill(html, "schedule", B.scheduleRows(BAKE_DAY, "all", null, null));
  html = fill(html, "class-options", B.classOptions());
  html = fill(html, "map", B.map());
  writeFileSync(path, html);
  count++;
}
// ---------- Site map + robots: every page that isn't marked noindex ----------
const listed = readdirSync(site).filter((f) => f.endsWith(".html") && !/<meta name="robots" content="noindex">/.test(readFileSync(join(site, f), "utf8")))
  .sort((a, b) => (a === "index.html" ? -1 : b === "index.html" ? 1 : a.localeCompare(b)));
writeFileSync(join(site, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  listed.map((f) => `  <url><loc>${SITE}${f === "index.html" ? "" : f}</loc></url>`).join("\n") + "\n</urlset>\n");
writeFileSync(join(site, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);

console.log(`Baked ${count} pages (events from ${ymd}), site map with ${listed.length} pages.`);
