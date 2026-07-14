import { renderContent } from './content/render';
import { resume } from './content/resume';
import { detectWebGL, deviceTier } from './world/capability';
import { createWorld } from './world/renderer';
import { buildCity } from './world/city';
import './styles/main.css';

const content = document.getElementById('content') as HTMLElement;
renderContent(content, resume);

const canvas = document.getElementById('scene') as HTMLCanvasElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (detectWebGL(canvas)) {
  const tier = deviceTier(window.innerWidth, navigator.hardwareConcurrency ?? 4, reduced);
  const world = createWorld(canvas, tier);
  world.add(buildCity());
  window.addEventListener('resize', world.onResize);
  const loop = () => { world.render(); requestAnimationFrame(loop); };
  loop();
} else {
  document.body.classList.add('no-webgl');
}
