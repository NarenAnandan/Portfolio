import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { World } from '../world/renderer';
import { poseAt, activeSectionIndex, SECTION_KEYS } from './path';

gsap.registerPlugin(ScrollTrigger);

export function initScroll(
  world: World,
  onSectionChange: (index: number) => void,
): { progress: () => number; destroy(): void } {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let lastIndex = -1;

  const apply = (t: number) => {
    const pose = poseAt(t);
    world.camera.position.copy(pose.position);
    world.camera.lookAt(pose.lookAt);
    const idx = activeSectionIndex(t, SECTION_KEYS.length);
    if (idx !== lastIndex) {
      lastIndex = idx;
      onSectionChange(idx);
    }
  };

  if (reduced) {
    // No scrubbing: park camera at an overview pose; reveal handled by IntersectionObserver.
    apply(0);
    return { progress: () => 0, destroy: () => {} };
  }

  const lenis = new Lenis({ smoothWheel: true, lerp: 0.09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const st = ScrollTrigger.create({
    trigger: '#content',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      current = self.progress;
      apply(current);
    },
  });

  apply(0);

  return {
    progress: () => current,
    destroy: () => {
      st.kill();
      lenis.destroy();
    },
  };
}
