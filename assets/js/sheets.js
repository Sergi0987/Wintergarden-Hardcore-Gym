/* Hardcore Fitness Winter Garden — Google Sheet reader
   The gym edits a Google Sheet (tabs: Schedule, Coaches, Events, Prices) that is "published to
   the web" as CSV. This file turns those tabs into the same data shape as data.js.

   Safety rules:
   - Every row is checked. Rows with an unknown day, time or class are skipped, not shown broken.
   - A tab that fails to load, or has no usable rows, keeps the data.js version (Events may be
     empty on purpose: that just means "no events").
   - The last good sheet data is remembered in the visitor's browser, so repeat visits show the
     latest schedule right away, then refresh quietly.

   Used two ways: in the browser (below), and by scripts/bake.mjs to bake the latest sheet data
   into the pages. */
(function (root) {
  "use strict";

  var DAY_INDEX = { sunday: 0, sun: 0, monday: 1, mon: 1, tuesday: 2, tue: 2, tues: 2, wednesday: 3, wed: 3,
    thursday: 4, thu: 4, thur: 4, thurs: 4, friday: 5, fri: 5, saturday: 6, sat: 6 };

  // CSV with quoted fields, commas and line breaks inside quotes, and "" escapes.
  function parseCSV(text) {
    var rows = [], row = [], field = "", i = 0, q = false;
    text = String(text).replace(/^﻿/, "");
    for (; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
        else field += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += c;
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  // Rows as objects keyed by simplified column names: "Bio (2-3 lines)" -> "bio", "Show on site" -> "show on site".
  function table(text) {
    var rows = parseCSV(text);
    if (!rows.length) return null;
    var keys = rows[0].map(function (h) { return h.replace(/\(.*?\)/g, "").trim().toLowerCase(); });
    return rows.slice(1).map(function (r) {
      var o = {};
      keys.forEach(function (k, i) { if (k) o[k] = (r[i] || "").trim(); });
      return o;
    }).filter(function (o) { return Object.keys(o).some(function (k) { return o[k] && !/^(true|false)$/i.test(o[k]); }); });
  }

  function time24(s) {
    var m = String(s).trim().match(/^(\d{1,2}):(\d{2})\s*([ap])\.?\s*m?\.?$/i);
    if (m) {
      var h = +m[1] % 12 + (/p/i.test(m[3]) ? 12 : 0);
      if (+m[1] < 1 || +m[1] > 12 || +m[2] > 59) return null;
      return (h < 10 ? "0" : "") + h + ":" + m[2];
    }
    m = String(s).trim().match(/^(\d{1,2}):(\d{2})$/);
    if (m && +m[1] < 24 && +m[2] < 60) return (+m[1] < 10 ? "0" : "") + +m[1] + ":" + m[2];
    return null;
  }
  // "2026-12-13" or "12/13/2026" -> "2026-12-13"; anything that isn't a real calendar date -> null.
  function isoDate(s) {
    var y, mo, d, m = String(s).trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) { y = +m[1]; mo = +m[2]; d = +m[3]; }
    else if ((m = String(s).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) { y = +m[3]; mo = +m[1]; d = +m[2]; }
    else return null;
    var dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
    return y + "-" + ("0" + mo).slice(-2) + "-" + ("0" + d).slice(-2);
  }
  function yes(v) { return /^(true|yes|y|1|x)$/i.test(String(v || "").trim()); }
  function slug(name) { return String(name).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  // tables: { schedule, coaches, events, prices } -> rows (from table()), or null when that tab failed.
  // Returns the parts that are good to use, plus a list of skipped rows for the console.
  function build(HF, tables) {
    var out = {}, problems = [];
    var classByName = {};
    Object.keys(HF.classes).forEach(function (k) { classByName[HF.classes[k].name.toLowerCase()] = k; classByName[k] = k; });

    if (tables.coaches) {
      var coaches = [];
      tables.coaches.forEach(function (r, i) {
        if (!r.name) return;
        coaches.push({ id: slug(r.name), name: r.name, role: r.role || "Coach", bio: r.bio || "", owner: yes(r.owner),
          show: r["show on site"] === undefined || r["show on site"] === "" ? true : yes(r["show on site"]) });
      });
      if (coaches.length) out.coaches = coaches; else problems.push("Coaches: no usable rows, kept the built-in list");
    }

    if (tables.schedule) {
      var sched = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }, n = 0;
      var known = {};
      (out.coaches || HF.coaches).forEach(function (c) { known[c.id] = true; });
      var extra = [];
      tables.schedule.forEach(function (r, i) {
        var day = DAY_INDEX[String(r.day || "").toLowerCase()], t = time24(r.time || ""), cls = classByName[String(r["class"] || "").toLowerCase()];
        if (day === undefined || !t || !cls) { problems.push("Schedule row " + (i + 2) + " skipped (check day, time and class)"); return; }
        var coach = r.coach ? slug(r.coach) : "";
        if (coach && !known[coach]) { known[coach] = true; extra.push({ id: coach, name: r.coach, role: "Coach", show: false }); }
        sched[day].push([t, cls, coach]); n++;
      });
      Object.keys(sched).forEach(function (d) { sched[d].sort(function (a, b) { return a[0] < b[0] ? -1 : 1; }); });
      if (n) {
        out.schedule = sched;
        // A coach named in the schedule but missing from Coaches still shows by name, just not on the Coaches page.
        if (extra.length) out.coaches = (out.coaches || HF.coaches.slice()).concat(extra);
      } else problems.push("Schedule: no usable rows, kept the built-in schedule");
    }

    if (tables.events) {
      out.events = [];
      tables.events.forEach(function (r, i) {
        var d = isoDate(r.date || ""), t = time24(r.time || "");
        if (!d || !t || !r.title) { problems.push("Events row " + (i + 2) + " skipped (check date, time and title)"); return; }
        out.events.push({ date: d, time: t, title: r.title, text: r.description || "",
          tags: String(r.tags || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean) });
      });
      out.events.sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; });
    }

    if (tables.prices) {
      var plans = [];
      tables.prices.forEach(function (r) {
        if (!r.plan) return;
        plans.push({ name: r.plan, price: r.price || null, per: r.per || "", text: r.description || "", cta: r["button text"] || "Ask about it", featured: yes(r.highlight) });
      });
      if (plans.length) out.plans = plans; else problems.push("Prices: no usable rows, kept the built-in prices");
    }
    return { data: out, problems: problems };
  }

  function apply(HF, data) {
    ["coaches", "schedule", "events", "plans"].forEach(function (k) { if (data[k]) HF[k] = data[k]; });
  }

  var TABS = { schedule: "schedule", coaches: "coaches", events: "events", prices: "prices" };
  // Either one published sheet (csvBase + each tab's number), or a separate CSV address per tab (urls).
  function tabUrl(sheet, tab) {
    if (sheet.urls && sheet.urls[tab]) return sheet.urls[tab];
    // The minute stamp skips Google's cache of the published copy; Google's servers still take a few minutes to all catch up.
    return sheet.csvBase + "?gid=" + sheet.tabs[tab] + "&single=true&output=csv&t=" + Math.floor(Date.now() / 60000);
  }
  function configured(HF) {
    var sh = HF.sheet;
    if (!sh) return false;
    return Object.keys(TABS).every(function (t) {
      return (sh.urls && sh.urls[t]) || (sh.csvBase && sh.tabs && sh.tabs[t] !== null && sh.tabs[t] !== undefined && sh.tabs[t] !== "");
    });
  }

  root.HFSheet = { parseCSV: parseCSV, table: table, time24: time24, isoDate: isoDate, slug: slug, build: build, apply: apply, tabUrl: tabUrl, configured: configured, TABS: TABS };

  /* ---------- In the browser ---------- */
  if (typeof document === "undefined" || !root.HF) return;
  var HF = root.HF;
  if (!configured(HF)) return;
  var CACHE = "hf-sheet-v1";

  // 1) Right away: last good sheet data from this browser, so the page doesn't flash old data.
  try {
    var cached = JSON.parse(localStorage.getItem(CACHE) || "null");
    if (cached && cached.data && Date.now() - cached.savedAt < 30 * 864e5) apply(HF, cached.data);
  } catch (e) {}

  // 2) Then: the live sheet. When it arrives, site.js redraws what changed.
  function get(tab) {
    var ctrl = "AbortController" in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    return fetch(tabUrl(HF.sheet, tab), { cache: "no-store", signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { clearTimeout(timer); if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (text) {
        if (/^\s*</.test(text)) throw new Error("not CSV"); // a sign-in or error page, not the sheet
        return table(text);
      })
      .catch(function () { clearTimeout(timer); return null; });
  }
  HF.sheetReady = Promise.all(Object.keys(TABS).map(get)).then(function (res) {
    var tables = {};
    Object.keys(TABS).forEach(function (t, i) { tables[t] = res[i]; });
    var result = build(HF, tables);
    if (result.problems.length && root.console) console.warn("[sheet] " + result.problems.join("; "));
    if (!Object.keys(result.data).length) return false;
    apply(HF, result.data);
    try { localStorage.setItem(CACHE, JSON.stringify({ savedAt: Date.now(), data: result.data })); } catch (e) {}
    if (typeof HF.refresh === "function") HF.refresh();
    return true;
  });
})(typeof window !== "undefined" ? window : globalThis);
