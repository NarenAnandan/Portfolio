import * as THREE from 'three';

export interface Pose {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

export const SECTION_KEYS = [
  'hero', 'about', 'experience', 'casestudies', 'metrics', 'education', 'contact',
] as const;

// One control point per landmark; the camera flies down and through the city.
const CONTROL_POINTS: [number, number, number][] = [
  [0, 34, 60],     // hero — orbiting above the skyline
  [-18, 20, 30],   // about — dock at VPC district
  [10, 12, 8],     // experience — pipeline corridor
  [-6, 8, -20],    // casestudies — kubernetes cluster
  [14, 16, -44],   // metrics — observability tower
  [0, 6, -66],     // education — descending to ground
  [0, 4, -84],     // contact — HQ / ground level
];

let cachedCurve: THREE.CatmullRomCurve3 | null = null;

export function cameraPath(): THREE.CatmullRomCurve3 {
  if (!cachedCurve) {
    cachedCurve = new THREE.CatmullRomCurve3(
      CONTROL_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
      false,
      'catmullrom',
      0.5,
    );
  }
  return cachedCurve;
}

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

export function poseAt(progress: number): Pose {
  const t = clamp01(progress);
  const curve = cameraPath();
  const position = curve.getPointAt(t);
  const aheadT = clamp01(t + 0.04);
  const lookAt = curve.getPointAt(aheadT);
  // Bias lookAt toward the world center so landmarks stay framed.
  lookAt.lerp(new THREE.Vector3(0, 4, position.z - 20), 0.4);
  return { position, lookAt };
}

export function activeSectionIndex(progress: number, count: number): number {
  const t = clamp01(progress);
  return Math.min(count - 1, Math.floor(t * count));
}
