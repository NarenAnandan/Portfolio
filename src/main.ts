import { renderContent } from './content/render';
import { resume } from './content/resume';
import { detectWebGL, deviceTier } from './world/capability';
import { createWorld } from './world/renderer';
import { buildCity } from './world/city';
import { buildPipeline } from './world/pipeline';
import './styles/main.css';

const content = document.getElementById('content') as HTMLElement;
renderContent(content, resume);

const canvas = document.getElementById('scene') as HTMLCanvasElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (detectWebGL(canvas)) {
  const tier = deviceTier(window.innerWidth, navigator.hardwareConcurrency ?? 4, reduced);
  const world = createWorld(canvas, tier);
  world.add(buildCity());
  const pipeline = buildPipeline();
  world.add(pipeline.group);
  window.addEventListener('resize', world.onResize);
  let start = performance.now();
  const loop = () => {
    const elapsed = (performance.now() - start) / 1000;
    pipeline.update(elapsed);
    world.render();
    requestAnimationFrame(loop);
  };
  loop();
} else {
  document.body.classList.add('no-webgl');
}
