/* Progressive enhancement only: the page is complete and readable with this file blocked.
   Motion here (rotator, timeline fill) is skipped for prefers-reduced-motion. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- 1. theme switch (fixed label + aria-pressed) ---------- */
  var toggle = $('theme-toggle');
  if (toggle) {
    var isDark = function () {
      var t = root.getAttribute('data-theme');
      return t ? t === 'dark' : !window.matchMedia('(prefers-color-scheme: light)').matches;
    };
    var sync = function () { toggle.setAttribute('aria-pressed', isDark() ? 'true' : 'false'); };
    sync();
    toggle.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked */ }
      sync();
    });
  }

  /* ---------- 2. headline rotator: types and deletes each word in turn ---------- */
  var rot = $('rotator');
  if (rot && !reduced) {
    var words = rot.getAttribute('data-words').split(',');
    var w = 0, n = words[0].length, deleting = true;
    var tick = function () {
      var word = words[w];
      n += deleting ? -1 : 1;
      rot.textContent = word.slice(0, n) + (n === 0 ? '​' : ''); // keep the line height
      var wait = deleting ? 45 : 85;
      if (deleting && n === 0) { deleting = false; w = (w + 1) % words.length; wait = 250; }
      else if (!deleting && n === words[w].length) { deleting = true; wait = 2200; }
      setTimeout(tick, wait);
    };
    setTimeout(tick, 4200); // after the swarm has built the hero
  }

  /* ---------- 3. scroll-driven: progress bar + experience timeline ---------- */
  var bar = $('progress');
  var fill = $('timeline-fill');
  var timeline = $('timeline');
  var items = timeline ? Array.prototype.slice.call(timeline.querySelectorAll('.tl')) : [];
  var queued = false;
  var onScroll = function () {
    queued = false;
    var max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
    if (!timeline) return;
    var mark = innerHeight * 0.6; // the "now" line, 60% down the viewport
    var r = timeline.getBoundingClientRect();
    var p = Math.max(0, Math.min(1, (mark - r.top) / r.height));
    if (fill) fill.style.transform = 'scaleY(' + (reduced ? 1 : p) + ')';
    items.forEach(function (li) { li.classList.toggle('is-active', reduced || li.getBoundingClientRect().top + 24 < mark); });
  };
  var request = function () { if (!queued) { queued = true; requestAnimationFrame(onScroll); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request, { passive: true });
  onScroll();

  /* ---------- 4. role durations and total, from data-start / data-end ("YYYY-M", 0-based) ---------- */
  var now = new Date();
  var stamp = function (s) { if (!s) return now.getFullYear() * 12 + now.getMonth(); var p = s.split('-'); return +p[0] * 12 + +p[1]; };
  var human = function (m) {
    var y = Math.floor(m / 12), mo = m % 12, out = [];
    if (y) out.push(y + (y === 1 ? ' yr' : ' yrs'));
    if (mo) out.push(mo + (mo === 1 ? ' mo' : ' mos'));
    return out.join(' ');
  };
  var first = Infinity, total = 0;
  items.forEach(function (li) {
    var a = stamp(li.getAttribute('data-start')), b = stamp(li.getAttribute('data-end'));
    var months = b - a + 1;
    first = Math.min(first, a);
    total += months;
    var d = li.querySelector('[data-duration]');
    if (d) d.textContent = human(months);
  });
  if (items.length) {
    var expTotal = $('exp-total');
    if (expTotal) expTotal.textContent = human(total);
    var core = $('core-years');
    if (core) core.textContent = Math.floor(total / 12) + '+ yrs in production';
  }

  /* ---------- 5. skill filters, also driven by the hero topology nodes ---------- */
  var filters = $('skill-filters');
  var cards = Array.prototype.slice.call(document.querySelectorAll('#skills-grid [data-group]'));
  var setFilter = function (key) {
    if (!filters) return;
    Array.prototype.forEach.call(filters.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-filter') === key ? 'true' : 'false');
    });
    cards.forEach(function (c) { c.hidden = key !== 'all' && c.getAttribute('data-group') !== key; });
  };
  if (filters && cards.length) {
    filters.hidden = false;
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-filter]');
      if (b) setFilter(b.getAttribute('data-filter'));
    });
    Array.prototype.forEach.call(document.querySelectorAll('.node[data-filter]'), function (node) {
      node.addEventListener('click', function () { setFilter(node.getAttribute('data-filter')); });
      // light up this node's edge while it is hovered or focused
      var edge = document.querySelector('.topo__edges [data-edge="' + node.getAttribute('data-node') + '"]');
      if (!edge) return;
      ['mouseenter', 'focus'].forEach(function (t) { node.addEventListener(t, function () { edge.classList.add('is-hot'); }); });
      ['mouseleave', 'blur'].forEach(function (t) { node.addEventListener(t, function () { edge.classList.remove('is-hot'); }); });
    });
  }

  /* ---------- 5b. phones: start compact (cases closed, one skill group), chips switch groups ---------- */
  if (window.matchMedia('(max-width: 46rem)').matches) {
    Array.prototype.forEach.call(document.querySelectorAll('details.case[open]'), function (d) { d.open = false; });
    if (cards.length) setFilter(cards[0].getAttribute('data-group'));
  }

  /* ---------- 6. scrollspy ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l, i) {
          if (sections[i] === entry.target) l.setAttribute('aria-current', 'true');
          else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) spy.observe(s); });
  }

  /* ---------- 7. local time, so visitors in other zones know when I'll see their email ---------- */
  var clock = $('clock'), clockTime = $('clock-time');
  if (clock && clockTime && window.Intl) {
    var fmt = new Intl.DateTimeFormat('en-CA', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Toronto' });
    var draw = function () { clockTime.textContent = fmt.format(new Date()); };
    draw();
    clock.hidden = false;
    setInterval(draw, 30000);
  }

  /* ---------- 8. copy email ---------- */
  var copy = $('copy-email');
  if (copy && navigator.clipboard) {
    var label = $('copy-label'), status = $('copy-status'), timer;
    var say = function (text, announce) {
      label.textContent = text;
      status.textContent = announce;
      clearTimeout(timer);
      timer = setTimeout(function () { label.textContent = 'Copy'; status.textContent = ''; }, 2000);
    };
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(copy.getAttribute('data-copy')).then(
        function () { say('Copied', 'Email address copied to clipboard'); },
        function () { say('Copy failed', 'Could not copy the email address'); }
      );
    });
  } else if (copy) {
    copy.hidden = true;
  }
})();
