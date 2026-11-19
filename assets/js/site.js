/* Hardcore Fitness Winter Garden — shared page behavior
   HTML comes from render.js. Pages are pre-built by scripts/bake.mjs; this file adds what
   has to happen in the browser: the live clock, today's schedule, the form and the menus. */
(function () {
  "use strict";

  var HF = window.HF;
  var R = window.HFRender;
  var B = R.make(HF);
  var esc = R.esc, led = R.led, clock12 = R.clock12, toMins = R.toMins, icon = R.icon;
  var DAYS = R.DAYS, DAYS_LONG = R.DAYS_LONG;
  var page = document.body.dataset.page || "";
  // Fresh Google Sheet data (sheets.js) calls HF.refresh(), which re-runs each of these.
  var refreshers = [];
  HF.refresh = function () { refreshers.forEach(function (fn) { fn(); }); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.HF.icon = icon;
  window.HF.led = led;

  /* ---------- Draft notes: ?clean=1 hides them for presenting, ?clean=0 shows them ---------- */
  (function () {
    var params = new URLSearchParams(location.search);
    var clean = null;
    try { clean = sessionStorage.getItem("hf-clean"); } catch (e) {}
    if (params.has("clean")) {
      clean = params.get("clean") === "1" ? "1" : "0";
      try { sessionStorage.setItem("hf-clean", clean); } catch (e) {}
    }
    if (clean === "1") document.documentElement.classList.add("clean");
  })();

  /* ---------- Header + footer (only filled here if a page wasn't baked) ---------- */
  var headerSlot = document.querySelector("[data-header]:empty");
  if (headerSlot) headerSlot.outerHTML = B.header(page);
  var footerSlot = document.querySelector("[data-footer]:empty");
  if (footerSlot) footerSlot.outerHTML = B.footer(new Date().getFullYear());

  var btn = document.querySelector(".menu-btn");
  var mnav = document.getElementById("mobile-nav");
  if (btn && mnav) {
    var setMenu = function (open) {
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      btn.innerHTML = open ? icon.close : icon.menu;
      mnav.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    btn.addEventListener("click", function () { setMenu(btn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && mnav.classList.contains("is-open")) { setMenu(false); btn.focus(); } });
  }

  /* ---------- Time helpers (gym time zone) ---------- */
  function gymNow() {
    var parts = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: HF.gym.timeZone, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return {
      day: DAYS.indexOf(parts.weekday),
      mins: +parts.hour * 60 + +parts.minute,
      secs: +parts.hour * 3600 + +parts.minute * 60 + +parts.second,
      ymd: parts.year + "-" + parts.month + "-" + parts.day
    };
  }
  // Upcoming classes from now, across the next 7 days.
  function upcoming(limit, filter) {
    var now = gymNow(), list = [];
    for (var i = 0; i < 8 && list.length < limit; i++) {
      var day = (now.day + i) % 7;
      (HF.schedule[day] || []).forEach(function (s) {
        if (list.length >= limit) return;
        if (filter && s[1] !== filter) return;
        var startSecs = i * 86400 + toMins(s[0]) * 60;
        if (startSecs > now.secs) list.push({ day: day, offset: i, slot: s, inSecs: startSecs - now.secs });
      });
    }
    return list;
  }
  function onFloorNow() {
    var now = gymNow();
    return (HF.schedule[now.day] || []).filter(function (s) {
      var st = toMins(s[0]);
      return now.mins >= st && now.mins < st + HF.gym.classMinutes;
    })[0];
  }
  function hms(secs) {
    var h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }
  function dayWord(offset, day) { return offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : DAYS_LONG[day]; }

  /* ---------- Floor clock (home hero) ---------- */
  var clockEl = document.querySelector("[data-floor-clock]");
  if (clockEl) {
    var cls = clockEl.querySelector("[data-clock-class]");
    var time = clockEl.querySelector("[data-clock-time]");
    var count = clockEl.querySelector("[data-clock-count]");
    var meta = clockEl.querySelector("[data-clock-meta]");
    var when = clockEl.querySelector("[data-clock-when]");
    var cta = clockEl.querySelector("[data-clock-cta]");
    var lastKey = "";

    var render = function () {
      var next = upcoming(1)[0];
      if (!next) return;
      var key = next.day + next.slot[0];
      if (key !== lastKey) {
        lastKey = key;
        var t = clock12(next.slot[0]);
        cls.textContent = HF.classes[next.slot[1]].name;
        time.innerHTML = led(t.digits, t.ampm, t.text);
        when.textContent = dayWord(next.offset, next.day);
        cta.href = B.bookHref(next.day, next.slot);
        var now = onFloorNow();
        meta.innerHTML = "Coach " + esc(B.coachName(next.slot[2])) + ". " +
          (now ? "On the floor right now: " + esc(HF.classes[now[1]].name) + " with " + esc(B.firstName(now[2])) + "." : "60 minutes. All levels.");
      }
      count.innerHTML = led(hms(next.inSecs), "", "Starts in " + Math.floor(next.inSecs / 3600) + " hours " + Math.floor((next.inSecs % 3600) / 60) + " minutes");
    };

    refreshers.push(function () { lastKey = ""; render(); });

    if (!reduceMotion) {
      // Power-on test: every segment lights, then the real time settles in.
      time.innerHTML = led(" 8:88", "", "Loading");
      count.innerHTML = led("88:88:88", "", "Loading");
      time.querySelectorAll(".off").forEach(function (p) { p.setAttribute("class", "on"); });
      setTimeout(function () { render(); setInterval(render, 1000); }, 900);
    } else {
      render();
      setInterval(render, 1000);
    }
  }

  /* ---------- Data lists: baked into the page, refreshed here (later: from the Google Sheet) ---------- */
  var strip = document.querySelector("[data-coach-strip]");
  var cgrid = document.querySelector("[data-coach-grid]");
  var plansEl = document.querySelector("[data-plans]");
  var evList = document.querySelector("[data-events]");
  var renderLists = function () {
    if (strip) strip.innerHTML = B.coachStrip();
    if (cgrid) cgrid.innerHTML = B.coachGrid();
    if (plansEl) plansEl.innerHTML = B.plans();
    if (evList) evList.innerHTML = B.events(gymNow().ymd);
    document.querySelectorAll(".will-reveal [data-reveal]").forEach(function (el) { el.classList.add("is-in"); });
  };
  renderLists();
  refreshers.push(renderLists);

  /* ---------- Classes page: next times per class ---------- */
  var renderNextTimes = function () {
    document.querySelectorAll("[data-next-times]").forEach(function (el) {
      var key = el.getAttribute("data-next-times");
      el.innerHTML = upcoming(4, key).map(function (u) {
        var t = clock12(u.slot[0]);
        return '<a href="' + B.bookHref(u.day, u.slot) + '"><span class="day">' + (u.offset === 0 ? "Today" : DAYS[u.day]) + " · " + esc(B.firstName(u.slot[2])) + "</span>" + led(t.digits.trim(), t.ampm, dayWord(u.offset, u.day) + " " + t.text, "led--bare") + "</a>";
      }).join("");
    });
  };
  renderNextTimes();
  refreshers.push(renderNextTimes);

  /* ---------- Schedule page ---------- */
  var sched = document.querySelector("[data-schedule]");
  if (sched) {
    var tabs = document.querySelector("[data-day-tabs]");
    var filters = document.querySelector("[data-filters]");
    var today = gymNow().day;
    // Once today's last class is over, open on the day of the next class instead.
    var firstUp = upcoming(1)[0];
    var state = { day: firstUp ? firstUp.day : today, filter: "all" };

    tabs.innerHTML = B.dayTabs(state.day, today);
    filters.innerHTML = B.filterButtons(state.filter);

    var drawSchedule = function () {
      sched.innerHTML = B.scheduleRows(state.day, state.filter, gymNow(), upcoming(1)[0]);
    };

    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      state.day = +b.dataset.day;
      tabs.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); });
      drawSchedule();
    });
    filters.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      state.filter = b.dataset.filter;
      filters.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      drawSchedule();
    });
    sched.addEventListener("click", function (e) {
      if (e.target.matches("[data-clear]")) { e.preventDefault(); filters.querySelector('[data-filter="all"]').click(); }
    });
    drawSchedule();
    setInterval(drawSchedule, 30000);
    refreshers.push(function () {
      tabs.innerHTML = B.dayTabs(state.day, gymNow().day);
      drawSchedule();
    });
  }

  /* ---------- Visit page: free class form → ClubReady ----------
     Our own form, sent to ClubReady's web lead form endpoint with the same field names.
     It is sent as a background request, not a page load: ClubReady's reply redirects to an
     old corporate thank-you page, and a background request can't move the visitor's page.
     The reply is on another site, so we can't read it: a reply of any kind = sent. */
  var form = document.querySelector("[data-trial-form]");
  if (form) {
    var q = new URLSearchParams(location.search);
    var selClass = form.querySelector("[data-class]");
    var selSlot = form.querySelector("[data-slot]");
    var note = form.querySelector("[data-note]");
    var status = form.querySelector("[data-form-status]");
    var submitBtn = form.querySelector("[data-submit]");
    var smsRequired = HF.signup.smsOptInRequired;

    selClass.innerHTML = B.classOptions();

    var fillSlots = function (keep) {
      var k = selClass.value;
      var list = upcoming(40, k && k !== "any" ? k : null).slice(0, 14);
      selSlot.innerHTML = '<option value="">Any time that works</option>' + list.map(function (u) {
        var v = u.day + "|" + u.slot[0];
        return '<option value="' + v + '"' + (keep === v ? " selected" : "") + ">" + dayWord(u.offset, u.day) + " " + clock12(u.slot[0]).text + " · " + HF.classes[u.slot[1]].name + "</option>";
      }).join("");
    };
    if (HF.classes[q.get("class")]) selClass.value = q.get("class");
    fillSlots(q.get("day") && q.get("time") ? q.get("day") + "|" + q.get("time") : "");
    if (q.get("event")) note.value = "I'd like to come to: " + q.get("event");
    if (q.get("plan")) note.value = "I have a question about the " + q.get("plan") + " membership.";
    selClass.addEventListener("change", function () { fillSlots(""); });
    refreshers.push(function () { fillSlots(selSlot.value); });

    var byId = function (id) { return document.getElementById(id); };
    var rules = [
      ["f-first", "e-first", function (v) { return v.trim() ? true : "Add your first name."; }],
      ["f-last", "e-last", function (v) { return v.trim() ? true : "Add your last name."; }],
      ["f-email", "e-email", function (v) { return !v.trim() ? "Add your email." : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "That email looks off. Check for a missing @ or dot."; }],
      ["f-phone", "e-phone", function (v) { return v.replace(/\D/g, "").length >= 10 || "Add a 10-digit phone number so we can confirm your spot."; }],
      ["f-class", "e-class", function (v) { return v ? true : "Pick a class, or choose “Not sure yet”."; }],
      ["f-gender", "e-gender", function (v) { return v ? true : "Pick an option. “Prefer not to say” is fine."; }],
      ["f-sms", "e-sms", function () { return !smsRequired || byId("f-sms").checked || "Check this box so we can text you to confirm your class."; }]
    ];
    var check = function (r) {
      var el = byId(r[0]), res = r[2](el.value), field = el.closest(".field");
      field.classList.toggle("has-error", res !== true);
      byId(r[1]).textContent = res === true ? "" : res;
      el.setAttribute("aria-invalid", String(res !== true));
      return res === true;
    };
    rules.forEach(function (r) {
      byId(r[0]).addEventListener(r[0] === "f-sms" || r[0].indexOf("class") > -1 || r[0] === "f-gender" ? "change" : "blur", function () {
        if (byId(r[1]).textContent || byId(r[0]).value) check(r);
      });
    });

    var showDone = function (slotText) {
      var done = document.querySelector("[data-form-done]");
      done.querySelector("[data-done-text]").textContent =
        "Thanks, " + byId("f-first").value.trim() + ". A coach will call or text " + byId("f-phone").value.trim() + " to confirm " + slotText + ". Get here 10 minutes early and bring water.";
      form.classList.add("is-sent");
      done.focus();
    };
    var btnLabel = submitBtn.innerHTML;
    var showFailed = function () {
      submitBtn.innerHTML = btnLabel;
      submitBtn.disabled = false;
      submitBtn.removeAttribute("aria-busy");
      status.textContent = "We couldn't confirm that it went through. Please call or text 407-993-7000 and we'll book you in.";
      status.classList.add("is-error");
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = rules.filter(function (r) { return !check(r); });
      if (bad.length) { byId(bad[0][0]).focus(); return; }
      if (!HF.signup.apiKey) { showFailed(); return; } // key file missing: never show a false "thanks"

      // ClubReady has no class or time fields, so the pick travels in the message.
      var cls = selClass.value === "any" ? "Not sure yet" : HF.classes[selClass.value].name;
      var slotText = "any time that works";
      if (selSlot.value) {
        var pick = selSlot.value.split("|");
        slotText = DAYS_LONG[+pick[0]] + " " + clock12(pick[1]).text;
        var row = (HF.schedule[pick[0]] || []).filter(function (x) { return x[0] === pick[1]; })[0];
        if (selClass.value === "any" && row) cls = HF.classes[row[1]].name; // "Not sure yet" + a time → that time's class
      }
      var parts = ["Free class request", "Class: " + cls, "When: " + slotText];
      if (byId("f-note").value.trim()) parts.push("Notes: " + byId("f-note").value.trim());
      form.elements.message.value = parts.join(" | ");
      form.elements.APIKey.value = HF.signup.apiKey;
      form.elements.emailok.value = "1";
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
      submitBtn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Sending\u2026';
      status.classList.remove("is-error");
      status.textContent = "Sending…";

      var params = new URLSearchParams(new FormData(form)).toString();
      var ctrl = "AbortController" in window ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
      fetch(HF.signup.action + "?" + params, {
        method: "GET", mode: "no-cors", credentials: "omit", cache: "no-store",
        referrerPolicy: "origin", signal: ctrl ? ctrl.signal : undefined
      }).then(function () {
        clearTimeout(timer);
        status.textContent = "";
        showDone(selSlot.value ? cls + " on " + slotText : "a time for your free class");
      }, function () {
        clearTimeout(timer);
        showFailed();
      });
    });
  }

  /* ---------- Map embed (only filled here if a page wasn't baked) ---------- */
  document.querySelectorAll("[data-map]:empty").forEach(function (el) { el.innerHTML = B.map(); });

  /* ---------- Phone booking bar: appears after the first screen, hides near the footer ---------- */
  if (page !== "visit" && page !== "thanks" && "IntersectionObserver" in window) {
    var bar = document.createElement("div");
    bar.className = "mobile-cta";
    bar.innerHTML = '<a class="btn" href="visit.html#trial">Book a free class ' + icon.arrow + '</a>' +
      '<a class="icon-btn" href="tel:' + HF.gym.tel + '" aria-label="Call ' + HF.gym.phone + '">' + icon.phone + "</a>";
    document.body.appendChild(bar);
    var pastTop = false, nearEnd = false;
    var syncBar = function () { bar.classList.toggle("is-shown", pastTop && !nearEnd); };
    window.addEventListener("scroll", function () { pastTop = window.scrollY > window.innerHeight * 0.7; syncBar(); }, { passive: true });
    var ends = new Map();
    var endObs = new IntersectionObserver(function (en) {
      en.forEach(function (x) { ends.set(x.target, x.isIntersecting); });
      nearEnd = Array.from(ends.values()).some(Boolean);
      syncBar();
    });
    document.querySelectorAll(".site-footer, .cta").forEach(function (el) { endObs.observe(el); });
  }

  /* ---------- Reveal on scroll (content stays visible without JS) ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("will-reveal");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });
  }
})();
