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
  // Light, airy depth — fog matches the base so distance dissolves into the table.
  scene.fog = new THREE.FogExp2(PALETTE.bg, 0.0055);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.set(0, 34, 60);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: tier !== 'low', powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap(tier)));
  renderer.toneMapping = THREE.NoToneMapping; // keep the light scene bright, not desaturated
  // Soft contact shadows give the "model on a light-table" read (skip on low tier).
  if (tier !== 'low') {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  // Even daylight fill + one soft key that casts shadows across the whole model.
  const hemi = new THREE.HemisphereLight(0xffffff, 0xc4ccd8, 1.05);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(46, 78, 40);
  if (tier !== 'low') {
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    const c = key.shadow.camera;
    c.left = -75; c.right = 75; c.top = 115; c.bottom = -115; c.near = 1; c.far = 260;
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.02;
  }
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xdfe6f2, 0.55);
  fill.position.set(-40, 30, -20);
  scene.add(fill);

  // The light-table surface: a large plane that only receives shadows.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshStandardMaterial({ color: PALETTE.table, roughness: 1, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);

  function render(): void {
    renderer.render(scene, camera);
  }
  function onResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  // Enable shadow casting/receiving on everything added to the world.
  function add(obj: THREE.Object3D): void {
    obj.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if ((mesh as THREE.Mesh).isMesh || (o as THREE.InstancedMesh).isInstancedMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    scene.add(obj);
  }

  return { scene, camera, renderer, render, onResize, add };
}
