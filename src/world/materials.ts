import * as THREE from 'three';

export const PALETTE = {
  bg: 0x070b14,
  cyan: 0x34d5eb,
  amber: 0xffb454,
  surface: 0x16233b,
  surfaceLight: 0x223452,
};

export function glowMaterial(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.4,
    roughness: 0.3,
    metalness: 0.1,
  });
}

export function surfaceMaterial(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.7,
    metalness: 0.35,
    flatShading: true,
  });
}
