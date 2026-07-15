import * as THREE from 'three';

// "Schematic Light-Table" palette — a bright architect's model, not a neon city.
// Keys are stable so every world module re-art-directs from here.
export const PALETTE = {
  bg: 0xe9edf2,          // scene base / fog — cool drafting grey
  table: 0xdce2ea,       // the light-table surface (shadow catcher)
  surface: 0xc7cfda,     // matte model structures (buildings, nodes)
  surfaceLight: 0xdfe4ec, // lighter platforms / gates / shaft
  cyan: 0x1b44e5,        // COBALT — structure edges, active components, links
  amber: 0xf97316,       // SIGNAL — data in motion (pipeline packets, HQ)
};

// Accent material: a saturated matte component with a hint of self-illumination
// so highlighted parts still read when they fall into shadow (no bloom needed).
export function glowMaterial(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.32,
    roughness: 0.4,
    metalness: 0.0,
  });
}

// Matte surface with faceted low-poly shading — reads as a physical scale model.
export function surfaceMaterial(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.95,
    metalness: 0.0,
    flatShading: true,
  });
}
