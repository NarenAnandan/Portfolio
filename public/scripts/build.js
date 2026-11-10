/* The entrance: cursors named after pipeline stages build the page block by block.
   The hero builds at once; every other section ([data-swarm-section]) gets its own swarm,
   started just before it scrolls into view, so the swarm follows the reader down the page.

   Safety rules, because swarm-build keeps a block hidden and `inert` until it is built:
   - a section is only handed to swarm-build when it is about to be seen, so content far
     below the fold is never hidden (a screen reader that never scrolls sees it all);
   - each swarm is capped (hero 6 s, sections 8 s) and then jumps to the finished state;
   - any click or key press finishes every running swarm and stops the effect for the visit.
   Scrolling and touch-scrolling do NOT finish it: scrolling is how the build moves on. */
import { swarmBuildPage } from '/vendor/swarm-build/swarm-build.js';

const root = document.documentElement;
const AGENTS = [
  { name: 'plan', color: '#2563eb' },
  { name: 'build', color: '#b45309' },
  { name: 'test', color: '#7c3aed' },
  { name: 'deploy', color: '#047857' },
  { name: 'observe', color: '#be123c' },
];
const STOPPERS = ['click', 'keydown'];
const running = new Set();
let watcher = null;
let stopped = false;

function run(blocks, capMs) {
  const swarm = swarmBuildPage(blocks, { speed: 2, typeSpeed: 1.8, agents: AGENTS, zIndex: 50 });
  running.add(swarm);
  const cap = setTimeout(() => swarm.finish(), capMs);
  swarm.finished.then(() => { clearTimeout(cap); running.delete(swarm); });
  return swarm;
}

function stopAll() {
  stopped = true;
  watcher?.disconnect();
  running.forEach((s) => s.finish());
  root.classList.remove('swarm');
  STOPPERS.forEach((t) => removeEventListener(t, stopAll, { capture: true }));
}

function armSections() {
  const sections = [...document.querySelectorAll('[data-swarm-section]')];
  // Sections already on screen (a reload mid-page, or a #link) stay as they are: building them
  // now would flash them out and back in.
  const pending = sections.filter((s) => s.getBoundingClientRect().top > innerHeight);
  if (!pending.length || !('IntersectionObserver' in window)) return;
  watcher = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting || stopped) continue;
      watcher.unobserve(e.target);
      const blocks = [e.target, ...e.target.querySelectorAll('[data-swarm-block]')];
      run(blocks, 8000);
    }
  }, { rootMargin: '0px 0px 60% 0px' }); // hand over a little before it scrolls into view
  pending.forEach((s) => watcher.observe(s));
}

function play() {
  stopped = false;
  STOPPERS.forEach((t) => addEventListener(t, stopAll, { capture: true, passive: true }));
  run('.hero [data-swarm-block]', 6000);
  // swarm-build has now hidden the hero blocks itself, so the pre-paint guard can go.
  root.classList.remove('swarm');
  armSections();
}

if (root.classList.contains('swarm')) {
  try { sessionStorage.setItem('built', '1'); } catch (e) { /* storage blocked */ }
  try { play(); } catch (e) { root.classList.remove('swarm'); throw e; }
}

const again = document.getElementById('rebuild');
if (again && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  again.hidden = false;
  again.addEventListener('click', (e) => {
    e.stopPropagation(); // this click must not count as "stop the effect"
    stopAll();
    scrollTo({ top: 0, behavior: 'instant' });
    // Move focus off the footer so the next Tab starts at the top, not below the fold.
    document.getElementById('main')?.focus({ preventScroll: true });
    requestAnimationFrame(() => requestAnimationFrame(play));
  });
}
