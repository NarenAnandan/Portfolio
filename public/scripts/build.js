/* The entrance: cursors named after pipeline stages draw the hero topology node by node.
   Any click, key, scroll, touch or focus change finishes it at once, and it never runs past
   6 seconds, so blocks below the fold or skipped by a screen reader never stay hidden. */
import { swarmBuildPage } from '/vendor/swarm-build/swarm-build.js';

const root = document.documentElement;
const AGENTS = [
  { name: 'plan', color: '#2563eb' },
  { name: 'build', color: '#b45309' },
  { name: 'test', color: '#7c3aed' },
  { name: 'deploy', color: '#047857' },
  { name: 'observe', color: '#be123c' },
];
const INTERRUPTS = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll', 'focusin'];
const MAX_MS = 6000;

function play() {
  const swarm = swarmBuildPage('[data-swarm-block]', { speed: 1.7, typeSpeed: 1.6, agents: AGENTS, zIndex: 50 });
  // swarm-build has now hidden every block itself, so the pre-paint guard can go.
  root.classList.remove('swarm');
  const skip = () => swarm.finish();
  const cap = setTimeout(skip, MAX_MS);
  INTERRUPTS.forEach((type) => addEventListener(type, skip, { passive: true, capture: true }));
  swarm.finished.then(() => {
    clearTimeout(cap);
    INTERRUPTS.forEach((type) => removeEventListener(type, skip, { capture: true }));
  });
}

if (root.classList.contains('swarm')) {
  try { sessionStorage.setItem('built', '1'); } catch (e) { /* storage blocked */ }
  try { play(); } catch (e) { root.classList.remove('swarm'); throw e; }
}

const again = document.getElementById('rebuild');
if (again && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  again.hidden = false;
  again.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: 'instant' });
    // Move focus off the footer so the next Tab starts at the top, not below the fold.
    document.getElementById('main')?.focus({ preventScroll: true });
    // Wait two frames: the scroll and focus events above must fire before the new swarm listens.
    requestAnimationFrame(() => requestAnimationFrame(play));
  });
}
