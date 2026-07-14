import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import type { World } from './renderer';
import type { DeviceTier } from './capability';

export function createComposer(world: World, tier: DeviceTier): { render(): void; onResize(): void } {
  if (tier === 'low') {
    return { render: () => world.render(), onResize: () => world.onResize() };
  }
  const composer = new EffectComposer(world.renderer);
  composer.addPass(new RenderPass(world.scene, world.camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.9,   // strength
    0.5,   // radius
    0.15,  // threshold
  );
  composer.addPass(bloom);

  return {
    render: () => composer.render(),
    onResize: () => {
      world.onResize();
      composer.setSize(window.innerWidth, window.innerHeight);
    },
  };
}
