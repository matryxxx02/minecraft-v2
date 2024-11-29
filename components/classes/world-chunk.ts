import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

import { RNG } from '@/components/classes/rng';

import { blocks, resources } from '@/lib/blocks';

const geometry = new THREE.BoxGeometry();

export class WorldChunk extends THREE.Group {
  data: { id: number; instanceId: number | null }[][][] = [];
  loaded;
  size;
  params;

  constructor(
    size: { width: number; height: number },
    params: {
      seed: number;
      terrain: { scale: number; magnitude: number; offset: number };
    }
  ) {
    super();
    this.loaded = false;
    this.size = size;
    this.params = params;
  }

  // Generates the world data and meshes
  generate() {
    // const start = performance.now();

    const rng = new RNG(this.params.seed);
    this.initializeTerrain();
    this.generateResources(rng);
    this.generateTerrain(rng);
    this.generateMeshes();

    this.loaded = true;

    // console.log(`Loaded chunk in ${performance.now() - start}ms`);
  }

  // Initializing the world terrain data
  initializeTerrain() {
    this.data = [];
    for (let x = 0; x < this.size.width; x++) {
      const slice = [];
      for (let y = 0; y < this.size.height; y++) {
        const row = [];
        for (let z = 0; z < this.size.width; z++) {
          row.push({
            id: blocks.empty.id,
            instanceId: null,
          });
        }
        slice.push(row);
      }
      this.data.push(slice);
    }
  }

  // Generates the resources (coal, stone, etc.) for the world
  generateResources(rng: RNG) {
    const simplex = new SimplexNoise(rng);

    resources.forEach((resource) => {
      for (let x = 0; x < this.size.width; x++) {
        for (let y = 0; y < this.size.height; y++) {
          for (let z = 0; z < this.size.width; z++) {
            const value = simplex.noise3d(
              (this.position.x + x) / resource.scale.x,
              (this.position.y + y) / resource.scale.y,
              (this.position.z + z) / resource.scale.z
            );

            if (value > resource.scarcity) {
              this.setBlockId(x, y, z, resource.id);
            }
          }
        }
      }
    });
  }

  // Generates the world terrain data for the world
  generateTerrain(rng: RNG) {
    const simplex = new SimplexNoise(rng);

    for (let x = 0; x < this.size.width; x++) {
      for (let z = 0; z < this.size.width; z++) {
        // Compute noise value at x-z coordinates
        const value = simplex.noise(
          (this.position.x + x) / this.params.terrain.scale,
          (this.position.z + z) / this.params.terrain.scale
        );
        // Scale noise based on magnitude/offset
        const scaledNoise = this.params.terrain.offset + this.params.terrain.magnitude * value;

        // Compute height of the terrain at this x-z location
        let height = Math.floor(this.size.height * scaledNoise);
        // Clamping height between 0 and max height
        height = Math.max(0, Math.min(height, this.size.height - 1));

        // Fill in all blocks at or below terrain height
        for (let y = 0; y <= this.size.height; y++) {
          if (y < height && this.getBlock(x, y, z)?.id === blocks.empty.id) {
            this.setBlockId(x, y, z, blocks.dirt.id);
          } else if (y === height) {
            this.setBlockId(x, y, z, blocks.grass.id);
          } else if (y > height) {
            this.setBlockId(x, y, z, blocks.empty.id);
          }
        }
      }
    }
  }

  // Generates the 3D representation of the world from world data
  generateMeshes() {
    this.clear();

    const maxCount = this.size.width * this.size.height * this.size.width;

    // Creating a lookup table where key is the block id
    const meshes: {
      [key: number]: THREE.InstancedMesh<
        THREE.BoxGeometry,
        THREE.MeshLambertMaterial | THREE.MeshLambertMaterial[],
        THREE.InstancedMeshEventMap
      >;
    } = {};
    Object.values(blocks)
      .filter((blockType) => blockType.id !== blocks.empty.id)
      .forEach((blockType) => {
        const mesh = new THREE.InstancedMesh(geometry, blockType.material, maxCount);
        mesh.name = blockType.name;
        mesh.count = 0;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        meshes[blockType.id] = mesh;
      });

    const matrix = new THREE.Matrix4();
    for (let x = 0; x < this.size.width; x++) {
      for (let y = 0; y < this.size.height; y++) {
        for (let z = 0; z < this.size.width; z++) {
          const blockId = this.getBlock(x, y, z)?.id;

          if (blockId === blocks.empty.id) continue;

          const mesh = meshes[blockId as number];
          const instanceId = mesh.count;

          if (!this.isBlockObscured(x, y, z)) {
            matrix.setPosition(x, y, z);
            mesh.setMatrixAt(instanceId, matrix);
            this.setBlockInstanceId(x, y, z, instanceId);
            mesh.count++;
          }
        }
      }
    }

    this.add(...Object.values(meshes));
  }

  // Gets the block data at (x, y, z)
  getBlock(x: number, y: number, z: number) {
    if (this.inBounds(x, y, z)) {
      return this.data[x][y][z];
    } else {
      return null;
    }
  }

  // Sets the block id for the block at (x, y, z)
  setBlockId(x: number, y: number, z: number, id: number) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].id = id;
    }
  }

  // Sets the block instanceId for the block at (x, y, z)
  setBlockInstanceId(x: number, y: number, z: number, instanceId: number) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].instanceId = instanceId;
    }
  }

  // Checks if the (x, y, z) coordinates are within bounds
  inBounds(x: number, y: number, z: number) {
    if (x >= 0 && x < this.size.width && y >= 0 && y < this.size.height && z >= 0 && z < this.size.width) {
      return true;
    } else {
      return false;
    }
  }

  // Returns true if this block is completely hidden by other blocks
  isBlockObscured(x: number, y: number, z: number) {
    const up = this.getBlock(x, y + 1, z)?.id ?? blocks.empty.id;
    const down = this.getBlock(x, y - 1, z)?.id ?? blocks.empty.id;
    const left = this.getBlock(x + 1, y, z)?.id ?? blocks.empty.id;
    const right = this.getBlock(x - 1, y, z)?.id ?? blocks.empty.id;
    const forward = this.getBlock(x, y, z + 1)?.id ?? blocks.empty.id;
    const back = this.getBlock(x, y, z - 1)?.id ?? blocks.empty.id;

    // If any of the block's side is exposed, it is not obscured
    if (
      up === blocks.empty.id ||
      down === blocks.empty.id ||
      left === blocks.empty.id ||
      right === blocks.empty.id ||
      forward === blocks.empty.id ||
      back === blocks.empty.id
    ) {
      return false;
    } else {
      return true;
    }
  }

  disposeInstances() {
    this.traverse((obj) => {
      if (obj instanceof THREE.InstancedMesh && obj.dispose) {
        obj.dispose();
      }
    });
    this.clear();
  }
}
