/* ============================================================
   Naren Anandan — portfolio behaviour
   No dependencies. Everything here is progressive enhancement:
   the page is complete and readable with this file blocked.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- 1. sheet toggle (positive / negative print) ---------- */
  var toggle = document.getElementById('sheet-toggle');
  if (toggle) {
    var isNegative = function () {
      var attr = root.getAttribute('data-sheet');
      if (attr) return attr === 'negative';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    var sync = function () {
      var neg = isNegative();
      toggle.setAttribute('aria-pressed', neg ? 'true' : 'false');
      var label = toggle.querySelector('.sr-only');
      if (label) label.textContent = neg ? 'Switch to positive print' : 'Switch to negative print';
    };
    sync();
    toggle.addEventListener('click', function () {
      var next = isNegative() ? 'positive' : 'negative';
      root.setAttribute('data-sheet', next);
      try { localStorage.setItem('sheet', next); } catch (e) { /* storage blocked */ }
      sync();
    });
  }

  /* ---------- 2. service history bar ---------- */
  /* One tick per month of continuous infrastructure work. The teaching
     assistantship is deliberately out of scope so the run reads unbroken. */
  var ROLES = [
    { key: 'eastlink',  start: [2021, 9] },   // Oct 2021 (month index, 0-based)
    { key: 'pythian',   start: [2022, 4] },   // May 2022
    { key: 'shopliftr', start: [2023, 2] }    // Mar 2023 — current
  ];

  var bar = document.getElementById('history-bar');
  if (bar) {
    var now = new Date();
    var startY = ROLES[0].start[0], startM = ROLES[0].start[1];
    var months = (now.getFullYear() - startY) * 12 + (now.getMonth() - startM);
    var frag = document.createDocumentFragment();

    var roleAt = function (y, m) {
      var stamp = y * 12 + m;
      var key = ROLES[0].key;
      for (var i = 0; i < ROLES.length; i++) {
        if (stamp >= ROLES[i].start[0] * 12 + ROLES[i].start[1]) key = ROLES[i].key;
      }
      return key;
    };

    for (var i = 0; i < months; i++) {
      var stamp = startY * 12 + startM + i;
      var y = Math.floor(stamp / 12), m = stamp % 12;
      var tick = document.createElement('span');
      tick.className = 'tick';
      tick.setAttribute('data-role', roleAt(y, m));
      if (m === 0) tick.setAttribute('data-year-start', 'true');
      tick.title = new Date(y, m, 1).toLocaleDateString('en-CA', { year: 'numeric', month: 'short' });
      frag.appendChild(tick);
    }
    bar.appendChild(frag);

    var total = document.getElementById('history-total');
    if (total) {
      var yrs = Math.floor(months / 12), rem = months % 12;
      total.textContent = months + ' months — ' + yrs + 'y ' + rem + 'm';
    }
    var nowLabel = document.getElementById('history-now');
    if (nowLabel) nowLabel.textContent = String(now.getFullYear());

    // keep the headline tally honest without anyone having to edit it each year
    var tallyYears = document.getElementById('tally-years');
    if (tallyYears) tallyYears.setAttribute('data-count-to', String(Math.floor(months / 12)));
  }

  /* ---------- 3. reveal on scroll + gauges + count-up ---------- */
  var revealables = document.querySelectorAll('[data-reveal]');
  var countables = document.querySelectorAll('[data-count-to]');

  var runCount = function (el) {
    var target = parseInt(el.getAttribute('data-count-to'), 10);
    var suffix = el.getAttribute('data-count-suffix') || '';
    if (isNaN(target)) return;
    if (reduced.matches) { el.textContent = target + suffix; return; }
    var t0 = null, dur = 900;
    var step = function (ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        var nums = entry.target.querySelectorAll('[data-count-to]');
        for (var i = 0; i < nums.length; i++) runCount(nums[i]);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    for (var r = 0; r < revealables.length; r++) io.observe(revealables[r]);
  } else {
    for (var r2 = 0; r2 < revealables.length; r2++) revealables[r2].classList.add('is-in');
    for (var c = 0; c < countables.length; c++) runCount(countables[c]);
  }

  /* ---------- 4. scrollspy on the section nav ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = links[sections.indexOf(entry.target)];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 5. copy email ---------- */
  var copyBtn = document.getElementById('copy-email');
  if (copyBtn && navigator.clipboard) {
    var label = document.getElementById('copy-label');
    var status = document.getElementById('copy-status');
    var resetTimer;
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(copyBtn.getAttribute('data-copy')).then(function () {
        if (label) label.textContent = 'Copied';
        if (status) status.textContent = 'Email address copied to clipboard';
        clearTimeout(resetTimer);
        resetTimer = setTimeout(function () {
          if (label) label.textContent = 'Copy';
          if (status) status.textContent = '';
        }, 2000);
      }).catch(function () {
        if (label) label.textContent = 'Copy failed';
      });
    });
  } else if (copyBtn) {
    copyBtn.hidden = true;
  }

  /* ---------- 6. footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
