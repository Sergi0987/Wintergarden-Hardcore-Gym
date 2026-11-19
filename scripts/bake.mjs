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

function fill(html, name, content) {
  const re = new RegExp(`(<!-- bake:${name} -->)[\\s\\S]*?(<!-- /bake:${name} -->)`);
  return re.test(html) ? html.replace(re, (_, a, b) => a + content + b) : html;
}

let count = 0;
for (const file of readdirSync(site).filter((f) => f.endsWith(".html"))) {
  const path = join(site, file);
  let html = addMarkers(readFileSync(path, "utf8"));
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
console.log(`Baked ${count} pages (events from ${ymd}).`);
