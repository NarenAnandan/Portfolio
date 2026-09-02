/* Runs before first paint so the sheet never flashes the wrong print.
   Kept separate and tiny for exactly that reason. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var saved = null;
  try { saved = localStorage.getItem('sheet'); } catch (e) { /* storage blocked */ }
  if (saved === 'positive' || saved === 'negative') {
    root.setAttribute('data-sheet', saved);
  } else {
    root.removeAttribute('data-sheet'); // fall through to prefers-color-scheme
  }
})();
