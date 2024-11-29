import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ModelLoader {
  loader = new GLTFLoader();

  models: {
    pickaxe: THREE.Group<THREE.Object3DEventMap> | undefined;
  } = {
    pickaxe: undefined,
  };

  // Loads the 3D models into memory
  loadModels(onLoad: (models: { pickaxe: THREE.Group<THREE.Object3DEventMap> | undefined }) => void) {
    this.loader.load('models/pickaxe.glb', (model) => {
      const mesh = model.scene;
      this.models.pickaxe = mesh;
      onLoad(this.models);
    });
  }
}
