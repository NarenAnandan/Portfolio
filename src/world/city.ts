import * as THREE from 'three';
import { PALETTE, surfaceMaterial, glowMaterial } from './materials';

export function buildCity(): THREE.Group {
  const group = new THREE.Group();

  // --- Instanced buildings (skyline) ---
  const COUNT = 120;
  const box = new THREE.BoxGeometry(1, 1, 1);
  const mat = surfaceMaterial(PALETTE.surface);
  const buildings = new THREE.InstancedMesh(box, mat, COUNT);
  const dummy = new THREE.Object3D();

  // Deterministic pseudo-random layout (no Math.random in build).
  const rand = mulberry32(1337);
  for (let i = 0; i < COUNT; i++) {
    const x = (rand() - 0.5) * 90;
    const z = 40 - rand() * 60;
    const h = 2 + rand() * 22;
    dummy.position.set(x, h / 2, z);
    dummy.scale.set(2 + rand() * 3, h, 2 + rand() * 3);
    dummy.rotation.y = rand() * Math.PI;
    dummy.updateMatrix();
    buildings.setMatrixAt(i, dummy.matrix);
  }
  buildings.instanceMatrix.needsUpdate = true;
  group.add(buildings);

  // --- Windows glow: a few emissive accent strips on tall buildings ---
  const accentGeo = new THREE.BoxGeometry(0.4, 6, 0.4);
  const accentMat = glowMaterial(PALETTE.cyan);
  const accents = new THREE.InstancedMesh(accentGeo, accentMat, 24);
  for (let i = 0; i < 24; i++) {
    dummy.position.set((rand() - 0.5) * 70, 6 + rand() * 10, 30 - rand() * 50);
    dummy.scale.set(1, 1 + rand() * 2, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    accents.setMatrixAt(i, dummy.matrix);
  }
  accents.instanceMatrix.needsUpdate = true;
  group.add(accents);

  // --- VPC district platform with glowing border ---
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(30, 0.6, 22),
    surfaceMaterial(PALETTE.surfaceLight),
  );
  platform.position.set(-18, 0, 28);
  group.add(platform);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(30, 0.6, 22)),
    new THREE.LineBasicMaterial({ color: PALETTE.cyan }),
  );
  edges.position.copy(platform.position);
  group.add(edges);

  return group;
}

// Small deterministic PRNG so builds are reproducible without Math.random.
function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
