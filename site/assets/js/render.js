/* Hardcore Fitness Winter Garden — shared HTML builders
   Pure functions of the data in data.js. Used two ways:
   - in the browser by site.js (live clock, today's schedule, later the Google Sheet)
   - by scripts/bake.mjs, which writes the same HTML into each page file ahead of time,
     so search engines, link previews and visitors without JavaScript get full pages. */
(function (root) {
  "use strict";

  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var DAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var WEEK = [1, 2, 3, 4, 5, 6, 0];

  var icon = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M3 12h17M13 5l7 7-7 7"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>'
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
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

  /* ---------- Time and data helpers ---------- */
  function toMins(hhmm) { var p = hhmm.split(":"); return +p[0] * 60 + +p[1]; }
  function clock12(hhmm) {
    var m = toMins(hhmm), h = Math.floor(m / 60), mm = m % 60;
    var h12 = h % 12 || 12;
    return { digits: (h12 < 10 ? " " : "") + h12 + ":" + (mm < 10 ? "0" : "") + mm, ampm: h < 12 ? "AM" : "PM", text: h12 + ":" + (mm < 10 ? "0" : "") + mm + " " + (h < 12 ? "AM" : "PM") };
  }

  function make(HF) {
    function coachName(id) { var c = HF.coaches.filter(function (x) { return x.id === id; })[0]; return c ? c.name : ""; }
    function firstName(id) { return coachName(id).split(" ")[0]; }
    function bookHref(day, s) { return "visit.html?class=" + s[1] + "&day=" + day + "&time=" + s[0] + "#trial"; }
    function initials(name) { return name.split(" ").map(function (w) { return w[0]; }).join(""); }
    function teaches(id) {
      var set = {};
      Object.keys(HF.schedule).forEach(function (d) { HF.schedule[d].forEach(function (s) { if (s[2] === id) set[s[1]] = 1; }); });
      return ["lift", "fight", "booty"].filter(function (k) { return set[k]; });
    }
    function plate(c, i) {
      return '<div class="plate' + (i % 2 ? " plate--red" : "") + '" aria-hidden="true"><span class="initials">' + initials(c.name) + '</span><span class="label photo-needed">Photo coming</span></div>';
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
    function navItems(page, cls) {
      return NAV.map(function (n) {
        var cur = n[0] === page ? ' aria-current="page"' : "";
        return "<li><a" + (cls ? ' class="' + cls + '"' : "") + ' href="' + n[1] + '"' + cur + ">" + n[2] + (cls === "big" ? icon.arrow.replace('aria-hidden="true"', 'aria-hidden="true" width="28" height="28"') : "") + "</a></li>";
      }).join("");
    }
    function header(page) {
      return '<a class="sr-only skip-link" href="#main">Skip to content</a>' +
        '<header class="site-header"><div class="wrap">' +
        '<a class="brand" href="index.html" aria-label="Hardcore Fitness Winter Garden, home"><img class="logo-dark" src="assets/img/logo-panel.webp" alt="" width="200" height="90"><img class="logo-light" src="assets/img/logo-panel-black.webp" alt="" width="200" height="90"><span>Winter<br>Garden</span></a>' +
        '<nav class="nav" aria-label="Main"><ul>' + navItems(page, "") + "</ul></nav>" +
        '<a class="btn btn--small header-cta" href="visit.html#trial">Free class</a>' +
        '<button class="icon-btn menu-btn" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">' + icon.menu + "</button>" +
        "</div></header>" +
        '<div class="mobile-nav" id="mobile-nav" aria-label="Menu"><ul>' + navItems(page, "big") + "</ul>" +
        '<a class="btn" href="visit.html#trial">Book a free class ' + icon.arrow + "</a>" +
        '<p class="muted">' + esc(HF.gym.street) + ", " + esc(HF.gym.city) + '<br><a href="tel:' + HF.gym.tel + '">' + HF.gym.phone + "</a></p></div>";
    }
    function footer(year) {
      return '<footer class="site-footer"><div class="wrap"><div class="footer-grid">' +
        '<div><img src="assets/img/logo-full.webp" alt="Hardcore Fitness Winter Garden" width="220" height="133" loading="lazy"></div>' +
        "<div><h4>Find us</h4><p>" + esc(HF.gym.street) + "<br>" + esc(HF.gym.city) + '</p><p><a href="tel:' + HF.gym.tel + '">' + HF.gym.phone + "</a></p></div>" +
        "<div><h4>Train</h4><ul>" +
        '<li><a href="classes.html">Classes</a></li><li><a href="schedule.html">Schedule</a></li><li><a href="membership.html">Membership</a></li><li><a href="visit.html#trial">Free first class</a></li></ul></div>' +
        "<div><h4>The gym</h4><ul>" +
        '<li><a href="coaches.html">Coaches</a></li><li><a href="events.html">Events</a></li><li><a href="visit.html">Visit</a></li></ul></div>' +
        "</div>" +
        '<div class="footer-base"><span>&copy; ' + year + " Hardcore Fitness Winter Garden. Hardcore Fitness&reg; is a registered trademark.</span><span>Winter Garden, Florida</span></div>" +
        "</div></footer>";
    }

    /* ---------- Coaches ---------- */
    function coachStrip() {
      return HF.coaches.filter(function (c) { return !c.owner; }).map(function (c, i) {
        return '<a href="coaches.html#' + c.id + '">' + plate(c, i) + "<h3>" + esc(c.name) + '</h3><span class="label meta">' + esc(c.role === "Coach" ? "" : c.role + " · ") + esc(teaches(c.id).map(function (k) { return HF.classes[k].name; }).join(" · ")) + "</span></a>";
      }).join("");
    }
    function coachGrid() {
      return HF.coaches.map(function (c, i) {
        var t = teaches(c.id);
        return '<article class="coach" id="' + c.id + '" data-reveal>' + plate(c, i) +
          "<h3>" + esc(c.name) + '</h3><span class="label role">' + esc(c.role) + "</span>" +
          (t.length ? '<div class="teaches">' + t.map(function (k) { return '<span class="chip">' + HF.classes[k].name + "</span>"; }).join("") + "</div>" : "") +
          (c.bio ? "<p>" + esc(c.bio) + "</p>" : '<p class="bio-pending">Bio coming soon.</p>') +
          "</article>";
      }).join("");
    }

    /* ---------- Schedule ----------
       now: { day, mins } in gym time, or null when baking (no "today", nothing past). */
    function dayTabs(selected, today) {
      return WEEK.map(function (d) {
        return '<button type="button" role="tab" data-day="' + d + '" aria-selected="' + (d === selected) + '">' + DAYS[d] + "<small>" + (d === today ? "Today" : HF.schedule[d].length + '<span class="w"> classes</span>') + "</small></button>";
      }).join("");
    }
    function filterButtons(active) {
      return [["all", "All classes"], ["lift", "Lift"], ["fight", "Fight Camp"], ["booty", "Booty Camp"]].map(function (f) {
        return '<button type="button" data-filter="' + f[0] + '" aria-pressed="' + (f[0] === active) + '">' + f[1] + "</button>";
      }).join("");
    }
    function scheduleRows(day, filter, now, next) {
      var rows = (HF.schedule[day] || []).filter(function (s) { return filter === "all" || s[1] === filter; });
      if (!rows.length) {
        return '<li class="sched-empty">No ' + (filter === "all" ? "" : HF.classes[filter].name + " ") + "classes on " + DAYS_LONG[day] + '. <a href="#" data-clear>Show all classes</a></li>';
      }
      return rows.map(function (s) {
        var t = clock12(s[0]);
        var st = toMins(s[0]);
        var isToday = !!now && day === now.day;
        var past = isToday && now.mins >= st + HF.gym.classMinutes;
        var live = isToday && now.mins >= st && !past;
        var isNext = !!next && next.day === day && next.offset === 0 && next.slot[0] === s[0] && !live;
        var status = live ? '<span class="label status">On the floor now</span>' : isNext ? '<span class="label status">Up next</span>' : "";
        var rowCls = (past ? "is-past" : "") + (isNext ? " is-next" : "");
        return "<li" + (rowCls ? ' class="' + rowCls.trim() + '"' : "") + ">" + led(t.digits, t.ampm, t.text) +
          '<span class="cls">' + HF.classes[s[1]].name + "</span>" +
          '<span class="who">' + esc(coachName(s[2])) + " " + status + "</span>" +
          (past ? '<span class="btn btn--small btn--ghost" aria-disabled="true">Done</span>'
                : '<a class="btn btn--small" href="' + bookHref(day, s) + '">Take it free<span class="sr-only"> — ' + HF.classes[s[1]].name + " " + DAYS_LONG[day] + " " + t.text + "</span> " + icon.arrow + "</a>") +
          "</li>";
      }).join("");
    }

    /* ---------- Events (ymd: "YYYY-MM-DD" in gym time; earlier events are left out) ---------- */
    function events(ymd) {
      var evs = HF.events.filter(function (e) { return e.date >= ymd; });
      return evs.length ? evs.map(function (e) {
        var d = new Date(e.date + "T12:00:00");
        var t = clock12(e.time);
        var dd = (d.getDate() < 10 ? "0" : "") + d.getDate();
        return '<li class="event" data-reveal><div><div class="date"><span class="mon">' + MONTHS[d.getMonth()] + "</span>" + led(dd, "", MONTHS[d.getMonth()] + " " + d.getDate()) + "</div>" +
          '<span class="label dow">' + DAYS_LONG[d.getDay()] + " · " + t.text + "</span></div>" +
          "<div><h3>" + esc(e.title) + "</h3><p>" + esc(e.text) + '</p><div class="meta">' + e.tags.map(function (g) { return '<span class="chip">' + esc(g) + "</span>"; }).join("") + "</div></div>" +
          '<a class="btn btn--small btn--ghost" href="visit.html?event=' + encodeURIComponent(e.title) + '#trial">I\'m in ' + icon.arrow + "</a></li>";
      }).join("") : '<li class="sched-empty">No events on the board right now. Check back soon, or ask at the front desk.</li>';
    }

    /* ---------- Membership ---------- */
    function plans() {
      return HF.plans.map(function (p) {
        return '<div class="plan' + (p.featured ? " plan--featured" : "") + '" data-reveal><h3>' + esc(p.name) + "</h3><p>" + esc(p.text) + "</p>" +
          '<div class="price">' + (p.price ? esc(p.price) : "Ask us") + "<small>" + esc(p.per) + "</small></div>" +
          '<a class="btn btn--small' + (p.featured ? "" : " btn--ghost") + '" href="visit.html' + (p.price === "Free" || p.featured ? "#trial" : "?plan=" + encodeURIComponent(p.name) + "#trial") + '">' + esc(p.cta) + " " + icon.arrow + "</a></div>";
      }).join("");
    }

    /* ---------- Visit form + map ---------- */
    function classOptions() {
      return '<option value="">Pick a class</option>' + Object.keys(HF.classes).map(function (k) {
        return '<option value="' + k + '">' + HF.classes[k].name + "</option>";
      }).join("") + '<option value="any">Not sure yet</option>';
    }
    function map() {
      // The address card sits under the map, so a blocked or slow map still shows where to go.
      return '<div class="map-fallback"><strong>1401 Beulah Rd</strong><span>Suite 100, Winter Garden, FL 34787</span>' +
        '<a class="btn btn--small btn--ghost" href="https://www.google.com/maps/dir/?api=1&amp;destination=' + encodeURIComponent(HF.gym.mapsQuery) + '" rel="noopener">Get directions</a></div>' +
        '<iframe title="Map to ' + esc(HF.gym.name) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=' + encodeURIComponent(HF.gym.mapsQuery) + '&amp;output=embed"></iframe>';
    }

    return {
      coachName: coachName, firstName: firstName, bookHref: bookHref, teaches: teaches,
      header: header, footer: footer, coachStrip: coachStrip, coachGrid: coachGrid,
      dayTabs: dayTabs, filterButtons: filterButtons, scheduleRows: scheduleRows,
      events: events, plans: plans, classOptions: classOptions, map: map
    };
  }

  root.HFRender = {
    DAYS: DAYS, DAYS_LONG: DAYS_LONG, MONTHS: MONTHS, icon: icon,
    esc: esc, led: led, toMins: toMins, clock12: clock12, make: make
  };
})(typeof window !== "undefined" ? window : globalThis);
