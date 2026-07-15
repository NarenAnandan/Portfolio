import type { World } from './renderer';
import type { DeviceTier } from './capability';

// The Schematic Light-Table look relies on clean matte shading + soft shadows,
// not glow. No bloom pass — rendering straight through keeps the scene crisp and
// bright. Kept as a thin indirection so main.ts wiring stays stable.
export function createComposer(_world: World, _tier: DeviceTier): { render(): void; onResize(): void } {
  return {
    render: () => _world.render(),
    onResize: () => _world.onResize(),
  };
}
