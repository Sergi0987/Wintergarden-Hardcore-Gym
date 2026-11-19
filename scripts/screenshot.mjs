// Full-page screenshots of the local site in Chrome, at real device sizes.
// Start the site first (npm run serve), then:
//   node scripts/screenshot.mjs [outdir=.shots] [tag=shot] [query=clean=1]
//   env: PAGES="index classes", WIDTHS="1440 390", WAIT=900 (ms), EXTRA="js to run before the shot"
// Uses Google Chrome's DevTools Protocol, so phone widths are real (a plain Chrome window can't go that narrow).
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";

const [outDir = ".shots", tag = "shot", query = "clean=1"] = process.argv.slice(2);
const pages = (process.env.PAGES || "index classes schedule coaches events membership visit").split(" ");
const widths = (process.env.WIDTHS || "1440 390").split(" ").map(Number);
const base = process.env.BASE || "http://localhost:4321";
const port = 9333;
mkdirSync(outDir, { recursive: true });

const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", `--remote-debugging-port=${port}`, "--disable-gpu", "--hide-scrollbars",
  `--user-data-dir=${outDir}/.chrome-profile`, "about:blank"
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  await sleep(200);
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page")?.webSocketDebuggerUrl; } catch {}
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const waiting = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; waiting.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send("Page.enable");
for (const p of pages) {
  for (const w of widths) {
    const mobile = w < 768;
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: mobile ? 844 : 900, deviceScaleFactor: 1, mobile });
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    await send("Page.navigate", { url: `${base}/${p}.html?${query}` });
    await sleep(1800);
    await send("Runtime.evaluate", { expression: "document.querySelectorAll('[data-reveal]').forEach(e=>e.classList.add('is-in')); document.querySelectorAll('img[loading=lazy],iframe[loading=lazy]').forEach(i=>i.loading='eager'); 1" });
    if (process.env.EXTRA) await send("Runtime.evaluate", { expression: process.env.EXTRA });
    await sleep(Number(process.env.WAIT || 900));
    const m = await send("Runtime.evaluate", { expression: "JSON.stringify({h: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth, iw: innerWidth})", returnByValue: true });
    const { h, sw, iw } = JSON.parse(m.result.result.value);
    if (sw > iw) console.log(`OVERFLOW ${p} @${w}: scrollWidth ${sw} > ${iw}`);
    const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
    writeFileSync(`${outDir}/${tag}-${p}-${w}.png`, Buffer.from(shot.result.data, "base64"));
    console.log(`${tag}-${p}-${w}.png ${w}x${h}`);
  }
}
ws.close(); chrome.kill();
