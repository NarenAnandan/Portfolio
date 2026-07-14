import { describe, it, expect } from 'vitest';
import { poseAt, activeSectionIndex, cameraPath, SECTION_KEYS } from '../src/scroll/path';

describe('camera path', () => {
  it('has one control point per section', () => {
    expect(cameraPath().points.length).toBe(SECTION_KEYS.length);
  });

  it('clamps progress below 0 and above 1', () => {
    const a = poseAt(-0.5).position;
    const b = poseAt(0).position;
    const c = poseAt(2).position;
    const d = poseAt(1).position;
    expect(a.equals(b)).toBe(true);
    expect(c.equals(d)).toBe(true);
  });

  it('moves the camera as progress increases', () => {
    const p0 = poseAt(0).position;
    const p1 = poseAt(1).position;
    expect(p0.distanceTo(p1)).toBeGreaterThan(1);
  });

  it('maps progress to section index', () => {
    expect(activeSectionIndex(0, 7)).toBe(0);
    expect(activeSectionIndex(0.99, 7)).toBe(6);
    expect(activeSectionIndex(0.5, 7)).toBe(3);
  });
});
