import { renderContent } from './content/render';
import { resume } from './content/resume';
import { detectWebGL, deviceTier } from './world/capability';
import { createWorld } from './world/renderer';
import { createComposer } from './world/postprocess';
import { buildCity } from './world/city';
import { buildPipeline } from './world/pipeline';
import { buildCluster } from './world/cluster';
import { buildTower } from './world/tower';
import { initScroll } from './scroll/timeline';
import { initReveal } from './scroll/reveal';
import './styles/main.css';

const content = document.getElementById('content') as HTMLElement;
renderContent(content, resume);

const canvas = document.getElementById('scene') as HTMLCanvasElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!detectWebGL(canvas)) {
  document.body.classList.add('no-webgl');
  initReveal(); // sections still reveal via IntersectionObserver
} else {
  const tier = deviceTier(window.innerWidth, navigator.hardwareConcurrency ?? 4, reduced);
  const world = createWorld(canvas, tier);
  world.add(buildCity());
  const pipeline = buildPipeline();
  world.add(pipeline.group);
  world.add(buildCluster());
  const tower = buildTower();
  world.add(tower.group);

  const composer = createComposer(world, tier);
  window.addEventListener('resize', composer.onResize);

  initScroll(world, () => {});
  initReveal();

  const start = performance.now();
  const loop = () => {
    requestAnimationFrame(loop);
    if (document.hidden) return;
    const elapsed = (performance.now() - start) / 1000;
    pipeline.update(elapsed);
    tower.update(elapsed);
    composer.render();
  };
  loop();
}
