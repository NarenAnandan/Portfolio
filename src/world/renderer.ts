import * as THREE from 'three';
import type { DeviceTier } from './capability';
import { pixelRatioCap } from './capability';
import { PALETTE } from './materials';

export interface World {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  render(): void;
  onResize(): void;
  add(obj: THREE.Object3D): void;
}

export function createWorld(canvas: HTMLCanvasElement, tier: DeviceTier): World {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.bg);
  scene.fog = new THREE.FogExp2(PALETTE.bg, 0.011);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.set(0, 34, 60);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: tier !== 'low', powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap(tier)));

  // Lighting: cool ambient + warm key so metals read.
  scene.add(new THREE.AmbientLight(0x3a4a66, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(30, 50, 20);
  scene.add(key);
  const rim = new THREE.PointLight(PALETTE.cyan, 2.4, 160);
  rim.position.set(-20, 24, -10);
  scene.add(rim);

  function render(): void {
    renderer.render(scene, camera);
  }
  function onResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  function add(obj: THREE.Object3D): void {
    scene.add(obj);
  }

  return { scene, camera, renderer, render, onResize, add };
}
