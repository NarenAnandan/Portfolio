export type DeviceTier = 'high' | 'mid' | 'low';

export function detectWebGL(canvas?: HTMLCanvasElement): boolean {
  try {
    const c = canvas ?? document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    return !!gl;
  } catch {
    return false;
  }
}

export function deviceTier(
  width: number,
  hardwareConcurrency: number,
  reducedMotion: boolean,
): DeviceTier {
  if (reducedMotion) return 'low';
  if (width < 768) return 'low';
  if (width < 1280 || hardwareConcurrency < 8) return 'mid';
  return 'high';
}

export function pixelRatioCap(tier: DeviceTier): number {
  switch (tier) {
    case 'low': return 1;
    case 'mid': return 1.5;
    case 'high': return 2;
  }
}
