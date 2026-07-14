import * as THREE from 'three';
import { PALETTE, surfaceMaterial, glowMaterial } from './materials';

export function buildCluster(): THREE.Group {
  const group = new THREE.Group();
  group.position.set(-6, 0, -20);

  const cols = 5, rows = 4;
  const node = new THREE.BoxGeometry(2.4, 2.4, 2.4);
  const nodeMat = surfaceMaterial(PALETTE.surface);
  const podMat = glowMaterial(PALETTE.cyan);
  const pod = new THREE.BoxGeometry(0.7, 0.7, 0.7);

  for (let x = 0; x < cols; x++) {
    for (let z = 0; z < rows; z++) {
      const n = new THREE.Mesh(node, nodeMat);
      n.position.set((x - cols / 2) * 4, 1.2, (z - rows / 2) * 4);
      group.add(n);
      // three stacked pods on top of each node
      for (let k = 0; k < 3; k++) {
        const p = new THREE.Mesh(pod, podMat);
        p.position.set(n.position.x, 2.6 + k * 0.9, n.position.z);
        group.add(p);
      }
    }
  }
  return group;
}
