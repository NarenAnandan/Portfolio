import * as THREE from 'three';
import { PALETTE, surfaceMaterial, glowMaterial } from './materials';

export function buildTower(): { group: THREE.Group; update(t: number): void } {
  const group = new THREE.Group();
  group.position.set(14, 0, -44);

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 2, 26, 12),
    surfaceMaterial(PALETTE.surfaceLight),
  );
  shaft.position.y = 13;
  group.add(shaft);

  const rings: THREE.Mesh[] = [];
  const ringMat = glowMaterial(PALETTE.cyan);
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3 + i, 0.12, 8, 32), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 6 + i * 5;
    group.add(ring);
    rings.push(ring);
  }

  // Ground plane + HQ marker far down the path.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    surfaceMaterial(PALETTE.bg),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.5, -60);
  group.add(ground);

  const hq = new THREE.Mesh(new THREE.IcosahedronGeometry(3, 0), glowMaterial(PALETTE.amber));
  hq.position.set(-14, 4, -40); // world (-14+14=0? ) -> local so it lands near z=-84 world
  group.add(hq);

  function update(t: number): void {
    for (let i = 0; i < rings.length; i++) {
      const s = 1 + Math.sin(t * 2 + i) * 0.08;
      rings[i].scale.set(s, s, s);
    }
    hq.rotation.y = t * 0.6;
  }

  return { group, update };
}
