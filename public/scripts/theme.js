/* Runs before first paint, so the page never flashes the wrong theme or the finished hero.
   Kept separate and tiny for exactly that reason. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  var theme = null;
  try { theme = localStorage.getItem('theme'); } catch (e) { /* storage blocked */ }
  if (theme === 'light' || theme === 'dark') root.setAttribute('data-theme', theme);

  // swarm-build plays once per browser session. Skip it for reduced motion, and in browsers
  // without ES modules, where build.js would never run to undo the hiding.
  var seen = false;
  try { seen = sessionStorage.getItem('built') === '1'; } catch (e) { seen = true; }
  var modules = 'noModule' in HTMLScriptElement.prototype;
  if (!seen && modules && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) root.classList.add('swarm');
})();
