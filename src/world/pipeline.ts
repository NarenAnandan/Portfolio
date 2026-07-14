import * as THREE from 'three';
import { PALETTE, surfaceMaterial, glowMaterial } from './materials';

export function buildPipeline(): { group: THREE.Group; update(t: number): void } {
  const group = new THREE.Group();
  group.position.set(8, 0, 8);

  // Stage gates along -z.
  const gateMat = surfaceMaterial(PALETTE.surfaceLight);
  const gateCount = 5;
  for (let i = 0; i < gateCount; i++) {
    const gate = new THREE.Mesh(new THREE.TorusGeometry(3, 0.35, 8, 24), gateMat);
    gate.rotation.y = Math.PI / 2;
    gate.position.set(0, 3, i * -8);
    group.add(gate);
  }

  // Flowing packets (emissive cubes) that loop through the gates.
  const PACKETS = 8;
  const packetGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
  const packetMat = glowMaterial(PALETTE.amber);
  const packets = new THREE.InstancedMesh(packetGeo, packetMat, PACKETS);
  group.add(packets);
  const dummy = new THREE.Object3D();
  const length = gateCount * 8;

  function update(t: number): void {
    for (let i = 0; i < PACKETS; i++) {
      const phase = (t * 6 + i * (length / PACKETS)) % length;
      dummy.position.set(0, 3, -phase);
      dummy.updateMatrix();
      packets.setMatrixAt(i, dummy.matrix);
    }
    packets.instanceMatrix.needsUpdate = true;
  }

  return { group, update };
}
