import { describe, it, expect } from 'vitest';
import { deviceTier, pixelRatioCap } from '../src/world/capability';

describe('deviceTier', () => {
  it('is low when reduced motion is requested', () => {
    expect(deviceTier(1920, 16, true)).toBe('low');
  });
  it('is low on narrow screens', () => {
    expect(deviceTier(600, 8, false)).toBe('low');
  });
  it('is mid on mid screens / modest cores', () => {
    expect(deviceTier(1100, 4, false)).toBe('mid');
  });
  it('is high on wide screens with many cores', () => {
    expect(deviceTier(1920, 12, false)).toBe('high');
  });
});

describe('pixelRatioCap', () => {
  it('caps low tier hardest', () => {
    expect(pixelRatioCap('low')).toBeLessThanOrEqual(pixelRatioCap('mid'));
    expect(pixelRatioCap('mid')).toBeLessThanOrEqual(pixelRatioCap('high'));
  });
});
