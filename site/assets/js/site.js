/* Hardcore Fitness Winter Garden — shared page behavior */
(function () {
  "use strict";

  var HF = window.HF;
  var page = document.body.dataset.page || "";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var DAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

  /* ---------- Icons ---------- */
  var icon = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M3 12h17M13 5l7 7-7 7"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>'
  };
  window.HF.icon = icon;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Header + footer ---------- */
  var NAV = [
    ["classes", "classes.html", "Classes"],
    ["schedule", "schedule.html", "Schedule"],
    ["coaches", "coaches.html", "Coaches"],
    ["events", "events.html", "Events"],
    ["membership", "membership.html", "Membership"],
    ["visit", "visit.html", "Visit"]
  ];
  function navItems(cls) {
    return NAV.map(function (n) {
      var cur = n[0] === page ? ' aria-current="page"' : "";
      return '<li><a class="' + cls + '" href="' + n[1] + '"' + cur + ">" + n[2] + (cls === "big" ? icon.arrow.replace('aria-hidden="true"', 'aria-hidden="true" width="28" height="28"') : "") + "</a></li>";
    }).join("");
  }

  var headerSlot = document.querySelector("[data-header]");
  if (headerSlot) {
    headerSlot.outerHTML =
      '<a class="sr-only skip-link" href="#main">Skip to content</a>' +
      '<header class="site-header"><div class="wrap">' +
      '<a class="brand" href="index.html" aria-label="Hardcore Fitness Winter Garden, home"><img class="logo-dark" src="assets/img/logo-panel.png" alt="" width="200" height="90"><img class="logo-light" src="assets/img/logo-panel-black.png" alt="" width="200" height="90"><span>Winter<br>Garden</span></a>' +
      '<nav class="nav" aria-label="Main"><ul>' + navItems("") + "</ul></nav>" +
      '<a class="btn btn--small header-cta" href="visit.html#trial">Free class</a>' +
      '<button class="icon-btn menu-btn" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">' + icon.menu + "</button>" +
      "</div></header>" +
      '<div class="mobile-nav" id="mobile-nav" aria-label="Menu"><ul>' + navItems("big") + "</ul>" +
      '<a class="btn" href="visit.html#trial">Book a free class ' + icon.arrow + "</a>" +
      '<p class="muted">' + esc(HF.gym.street) + ", " + esc(HF.gym.city) + '<br><a href="tel:' + HF.gym.tel + '">' + HF.gym.phone + "</a></p></div>";

    var btn = document.querySelector(".menu-btn");
    var mnav = document.getElementById("mobile-nav");
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

  var footerSlot = document.querySelector("[data-footer]");
  if (footerSlot) {
    var y = new Date().getFullYear();
    footerSlot.outerHTML =
      '<footer class="site-footer"><div class="wrap"><div class="footer-grid">' +
      '<div><img src="assets/img/logo-full.png" alt="Hardcore Fitness Winter Garden" width="220" height="133"></div>' +
      "<div><h4>Find us</h4><p>" + esc(HF.gym.street) + "<br>" + esc(HF.gym.city) + '</p><p><a href="tel:' + HF.gym.tel + '">' + HF.gym.phone + "</a></p></div>" +
      "<div><h4>Train</h4><ul>" +
      '<li><a href="classes.html">Classes</a></li><li><a href="schedule.html">Schedule</a></li><li><a href="membership.html">Membership</a></li><li><a href="visit.html#trial">Free first class</a></li></ul></div>' +
      "<div><h4>The gym</h4><ul>" +
      '<li><a href="coaches.html">Coaches</a></li><li><a href="events.html">Events</a></li><li><a href="visit.html">Visit</a></li></ul></div>' +
      "</div>" +
      '<div class="footer-base"><span>&copy; ' + y + " Hardcore Fitness Winter Garden. Hardcore Fitness&reg; is a registered trademark.</span><span>Winter Garden, Florida</span></div>" +
      "</div></footer>";
  }

  /* ---------- LED seven-segment digits ---------- */
  var SEG = { "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcdfg", "-": "g", " ": "" };
  var W = 24, H = 40, T = 4.6, G = 0.9;
  function hseg(cx, cy, L) { var h = T / 2; return [[cx - L / 2, cy], [cx - L / 2 + h, cy - h], [cx + L / 2 - h, cy - h], [cx + L / 2, cy], [cx + L / 2 - h, cy + h], [cx - L / 2 + h, cy + h]]; }
  function vseg(cx, cy, L) { var h = T / 2; return [[cx, cy - L / 2], [cx + h, cy - L / 2 + h], [cx + h, cy + L / 2 - h], [cx, cy + L / 2], [cx - h, cy + L / 2 - h], [cx - h, cy - L / 2 + h]]; }
  var HL = W - T - 2 * G, VL = H / 2 - T / 2 - 2 * G;
  var SEGS = {
    a: hseg(W / 2, T / 2, HL), g: hseg(W / 2, H / 2, HL), d: hseg(W / 2, H - T / 2, HL),
    f: vseg(T / 2, H / 4 + T / 4, VL), b: vseg(W - T / 2, H / 4 + T / 4, VL),
    e: vseg(T / 2, (3 * H) / 4 - T / 4, VL), c: vseg(W - T / 2, (3 * H) / 4 - T / 4, VL)
  };
  function poly(pts, dx) { return pts.map(function (p) { return (p[0] + dx).toFixed(2) + "," + p[1].toFixed(2); }).join(" "); }

  // tight: close the empty left half of a "1" (used where unlit segments are hidden)
  function ledSVG(text, tight) {
    var x = 0, out = "";
    String(text).split("").forEach(function (ch) {
      if (ch === ":") {
        out += '<rect class="on" x="' + (x + 1.5) + '" y="11" width="4.6" height="4.6"/><rect class="on" x="' + (x + 1.5) + '" y="25" width="4.6" height="4.6"/>';
        x += 8 + 5;
        return;
      }
      var lit = SEG[ch] !== undefined ? SEG[ch] : "";
      var shift = tight && ch === "1" ? W - T - 2 : 0;
      x -= shift;
      "abcdefg".split("").forEach(function (s) {
        out += '<polygon class="' + (lit.indexOf(s) > -1 ? "on" : "off") + '" points="' + poly(SEGS[s], x) + '"/>';
      });
      x += W + 5;
    });
    x -= 5;
    return '<svg viewBox="-3 -1 ' + (x + 6) + ' 42" aria-hidden="true" focusable="false"><g transform="skewX(-6) translate(4 0)">' + out + "</g></svg>";
  }
  function led(text, suffix, label, cls) {
    return '<span class="led' + (cls ? " " + cls : "") + '">' + ledSVG(text, /led--bare/.test(cls || "")) + (suffix ? '<span class="led-suffix" aria-hidden="true">' + suffix + "</span>" : "") +
      '<span class="sr-only">' + esc(label || text + (suffix ? " " + suffix : "")) + "</span></span>";
  }
  window.HF.led = led;

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
  function toMins(hhmm) { var p = hhmm.split(":"); return +p[0] * 60 + +p[1]; }
  function clock12(hhmm) {
    var m = toMins(hhmm), h = Math.floor(m / 60), mm = m % 60;
    var h12 = h % 12 || 12;
    return { digits: (h12 < 10 ? " " : "") + h12 + ":" + (mm < 10 ? "0" : "") + mm, ampm: h < 12 ? "AM" : "PM", text: h12 + ":" + (mm < 10 ? "0" : "") + mm + " " + (h < 12 ? "AM" : "PM") };
  }
  function coachName(id) { var c = HF.coaches.filter(function (x) { return x.id === id; })[0]; return c ? c.name : ""; }
  function firstName(id) { return coachName(id).split(" ")[0]; }
  function bookHref(day, s) { return "visit.html?class=" + s[1] + "&day=" + day + "&time=" + s[0] + "#trial"; }

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
        cta.href = bookHref(next.day, next.slot);
        var now = onFloorNow();
        meta.innerHTML = "Coach " + esc(coachName(next.slot[2])) + ". " +
          (now ? "On the floor right now: " + esc(HF.classes[now[1]].name) + " with " + esc(firstName(now[2])) + "." : "60 minutes. All levels.");
      }
      count.innerHTML = led(hms(next.inSecs), "", "Starts in " + Math.floor(next.inSecs / 3600) + " hours " + Math.floor((next.inSecs % 3600) / 60) + " minutes");
    };

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

  /* ---------- Home: coach strip ---------- */
  var strip = document.querySelector("[data-coach-strip]");
  if (strip) {
    strip.innerHTML = HF.coaches.filter(function (c) { return !c.owner; }).map(function (c, i) {
      return '<a href="coaches.html#' + c.id + '">' + plate(c, i) + "<h3>" + esc(c.name) + '</h3><span class="label meta">' + esc(c.role === "Coach" ? "" : c.role + " · ") + esc(teaches(c.id).map(function (k) { return HF.classes[k].name; }).join(" · ")) + "</span></a>";
    }).join("");
  }

  function initials(name) { return name.split(" ").map(function (w) { return w[0]; }).join(""); }
  function plate(c, i) {
    return '<div class="plate' + (i % 2 ? " plate--red" : "") + '" aria-hidden="true"><span class="initials">' + initials(c.name) + '</span><span class="label photo-needed">Photo coming</span></div>';
  }
  function teaches(id) {
    var set = {};
    Object.keys(HF.schedule).forEach(function (d) { HF.schedule[d].forEach(function (s) { if (s[2] === id) set[s[1]] = 1; }); });
    return ["lift", "fight", "booty"].filter(function (k) { return set[k]; });
  }

  /* ---------- Coaches page ---------- */
  var cgrid = document.querySelector("[data-coach-grid]");
  if (cgrid) {
    cgrid.innerHTML = HF.coaches.map(function (c, i) {
      var t = teaches(c.id);
      return '<article class="coach" id="' + c.id + '" data-reveal>' + plate(c, i) +
        "<h3>" + esc(c.name) + '</h3><span class="label role">' + esc(c.role) + "</span>" +
        (t.length ? '<div class="teaches">' + t.map(function (k) { return '<span class="chip">' + HF.classes[k].name + "</span>"; }).join("") + "</div>" : "") +
        (c.bio ? "<p>" + esc(c.bio) + "</p>" : '<p class="bio-pending">Bio coming soon.</p>') +
        "</article>";
    }).join("");
  }

  /* ---------- Classes page: next times per class ---------- */
  document.querySelectorAll("[data-next-times]").forEach(function (el) {
    var key = el.getAttribute("data-next-times");
    el.innerHTML = upcoming(4, key).map(function (u) {
      var t = clock12(u.slot[0]);
      return '<a href="' + bookHref(u.day, u.slot) + '"><span class="day">' + (u.offset === 0 ? "Today" : DAYS[u.day]) + " · " + esc(firstName(u.slot[2])) + "</span>" + led(t.digits.trim(), t.ampm, dayWord(u.offset, u.day) + " " + t.text, "led--bare") + "</a>";
    }).join("");
  });

  /* ---------- Schedule page ---------- */
  var sched = document.querySelector("[data-schedule]");
  if (sched) {
    var tabs = document.querySelector("[data-day-tabs]");
    var filters = document.querySelector("[data-filters]");
    var today = gymNow().day;
    // Once today's last class is over, open on the day of the next class instead.
    var firstUp = upcoming(1)[0];
    var state = { day: firstUp ? firstUp.day : today, filter: "all" };
    var order = [1, 2, 3, 4, 5, 6, 0];

    tabs.innerHTML = order.map(function (d) {
      return '<button type="button" role="tab" data-day="' + d + '" aria-selected="' + (d === state.day) + '">' + DAYS[d] + "<small>" + (d === today ? "Today" : HF.schedule[d].length + '<span class="w"> classes</span>') + "</small></button>";
    }).join("");
    filters.innerHTML = [["all", "All classes"], ["lift", "Lift"], ["fight", "Fight Camp"], ["booty", "Booty Camp"]].map(function (f) {
      return '<button type="button" data-filter="' + f[0] + '" aria-pressed="' + (f[0] === "all") + '">' + f[1] + "</button>";
    }).join("");

    var drawSchedule = function () {
      var now = gymNow();
      var next = upcoming(1)[0];
      var rows = (HF.schedule[state.day] || []).filter(function (s) { return state.filter === "all" || s[1] === state.filter; });
      if (!rows.length) {
        sched.innerHTML = '<li class="sched-empty">No ' + (state.filter === "all" ? "" : HF.classes[state.filter].name + " ") + "classes on " + DAYS_LONG[state.day] + '. <a href="#" data-clear>Show all classes</a></li>';
        return;
      }
      sched.innerHTML = rows.map(function (s) {
        var t = clock12(s[0]);
        var st = toMins(s[0]);
        var isToday = state.day === now.day;
        var past = isToday && now.mins >= st + HF.gym.classMinutes;
        var live = isToday && now.mins >= st && !past;
        var isNext = next && next.day === state.day && next.offset === 0 && next.slot[0] === s[0] && !live;
        var status = live ? '<span class="label status">On the floor now</span>' : isNext ? '<span class="label status">Up next</span>' : "";
        return '<li class="' + (past ? "is-past" : "") + (isNext ? " is-next" : "") + '">' + led(t.digits, t.ampm, t.text) +
          '<span class="cls">' + HF.classes[s[1]].name + "</span>" +
          '<span class="who">' + esc(coachName(s[2])) + " " + status + "</span>" +
          (past ? '<span class="btn btn--small btn--ghost" aria-disabled="true">Done</span>'
                : '<a class="btn btn--small" href="' + bookHref(state.day, s) + '">Take it free<span class="sr-only"> — ' + HF.classes[s[1]].name + " " + DAYS_LONG[state.day] + " " + t.text + "</span> " + icon.arrow + "</a>") +
          "</li>";
      }).join("");
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
  }

  /* ---------- Events page ---------- */
  var evList = document.querySelector("[data-events]");
  if (evList) {
    var todayYmd = gymNow().ymd;
    var evs = HF.events.filter(function (e) { return e.date >= todayYmd; });
    evList.innerHTML = evs.length ? evs.map(function (e) {
      var d = new Date(e.date + "T12:00:00");
      var t = clock12(e.time);
      var dd = (d.getDate() < 10 ? "0" : "") + d.getDate();
      return '<li class="event" data-reveal><div><div class="date"><span class="mon">' + MONTHS[d.getMonth()] + "</span>" + led(dd, "", MONTHS[d.getMonth()] + " " + d.getDate()) + "</div>" +
        '<span class="label dow">' + DAYS_LONG[d.getDay()] + " · " + t.text + "</span></div>" +
        "<div><h3>" + esc(e.title) + "</h3><p>" + esc(e.text) + '</p><div class="meta">' + e.tags.map(function (g) { return '<span class="chip">' + esc(g) + "</span>"; }).join("") + "</div></div>" +
        '<a class="btn btn--small btn--ghost" href="visit.html?event=' + encodeURIComponent(e.title) + '#trial">I\'m in ' + icon.arrow + "</a></li>";
    }).join("") : '<li class="sched-empty">No events on the board right now. Check back soon, or ask at the front desk.</li>';
  }

  /* ---------- Membership page ---------- */
  var plans = document.querySelector("[data-plans]");
  if (plans) {
    plans.innerHTML = HF.plans.map(function (p) {
      return '<div class="plan' + (p.featured ? " plan--featured" : "") + '" data-reveal><h3>' + esc(p.name) + "</h3><p>" + esc(p.text) + "</p>" +
        '<div class="price">' + (p.price ? esc(p.price) : "Ask us") + "<small>" + esc(p.per) + "</small></div>" +
        '<a class="btn btn--small' + (p.featured ? "" : " btn--ghost") + '" href="visit.html' + (p.price === "Free" || p.featured ? "#trial" : "?plan=" + encodeURIComponent(p.name) + "#trial") + '">' + esc(p.cta) + " " + icon.arrow + "</a></div>";
    }).join("");
  }

  /* ---------- Visit page: show the class or event the visitor picked ----------
     The ClubReady form is hosted by ClubReady, so we can't fill it in for them.
     Instead we show their pick and ask them to add it to the message box. */
  var picked = document.querySelector("[data-picked]");
  if (picked) {
    var q = new URLSearchParams(location.search);
    var what = "";
    var cls = HF.classes[q.get("class")];
    if (cls && q.get("day") && /^\d\d:\d\d$/.test(q.get("time") || "")) {
      what = cls.name + ", " + DAYS_LONG[+q.get("day")] + " at " + clock12(q.get("time")).text;
    } else if (cls) {
      what = cls.name;
    } else if (q.get("event")) {
      what = q.get("event");
    } else if (q.get("plan")) {
      what = "the " + q.get("plan") + " membership";
    }
    if (what) {
      picked.innerHTML = "<strong>You picked " + esc(what) + ".</strong> Add it to the message box so we can save your spot.";
      picked.hidden = false;
    }
  }

  /* ---------- Map embed ---------- */
  document.querySelectorAll("[data-map]").forEach(function (el) {
    // The address card sits under the map, so a blocked or slow map still shows where to go.
    el.innerHTML = '<div class="map-fallback"><strong>1401 Beulah Rd</strong><span>Suite 100, Winter Garden, FL 34787</span>' +
      '<a class="btn btn--small btn--ghost" href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(HF.gym.mapsQuery) + '" rel="noopener">Get directions</a></div>' +
      '<iframe title="Map to ' + esc(HF.gym.name) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=' + encodeURIComponent(HF.gym.mapsQuery) + '&output=embed"></iframe>';
  });

  /* ---------- Phone booking bar: appears after the first screen, hides near the footer ---------- */
  if (page !== "visit" && "IntersectionObserver" in window) {
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
