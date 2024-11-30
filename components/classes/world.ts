import * as THREE from 'three';

import { WorldChunk } from '@/components/classes/world-chunk';
import { Player } from '@/components/classes/player';
import { DataStore } from '@/components/classes/data-store';

export class World extends THREE.Group {
  // Whether or not we want to load the chunks asynchronously
  asyncLoading = true;
  // The number of chunks to render around the player. When this is set to 0, the chunk the player
  // is on is the only chunk rendered. If it is set to 1, the adjacent chunks are rendered, and so on
  drawDistance = 2;
  chunkSize = { width: 24, height: 32 };

  params = {
    seed: 0,
    terrain: {
      scale: 80,
      magnitude: 10,
      offset: 5,
      waterOffset: 3,
    },
    biomes: {
      scale: 200,
      variation: {
        amplitude: 0.2,
        scale: 50,
      },
      tundraToTemperate: 0.25,
      temperateToJungle: 0.5,
      jungleToDesert: 0.75,
    },
    trees: {
      trunk: {
        minHeight: 5,
        maxHeight: 7,
      },
      canopy: {
        minRadius: 2,
        maxRadius: 3,
        density: 0.5, // vary between 0 and 1
      },
      frequency: 0.005,
    },
    clouds: {
      scale: 30,
      density: 0.3,
    },
  };

  seed;
  dataStore = new DataStore();

  constructor(seed = 0) {
    super();
    this.seed = seed;

    document.addEventListener('keydown', (ev) => {
      switch (ev.code) {
        case 'F1':
          ev.preventDefault();
          this.save();
          break;
        case 'F2':
          ev.preventDefault();
          this.load();
          break;
      }
    });
  }

  // Saves the world data to local storage
  save() {
    localStorage.setItem('minecraft_params', JSON.stringify(this.params));
    localStorage.setItem('minecraft_data', JSON.stringify(this.dataStore.data));

    const statusContainer = document.getElementById('status');
    if (statusContainer) {
      statusContainer.innerHTML = 'GAME SAVED';
      setTimeout(() => (statusContainer.innerHTML = ''), 3000);
    }
  }

  // Loads the game from disk
  load() {
    const paramsFromStorage = localStorage.getItem('minecraft_params');
    const dataFromStorage = localStorage.getItem('minecraft_data');

    let onLoadText = 'LOADING FAILED';
    if (paramsFromStorage && dataFromStorage) {
      this.params = JSON.parse(paramsFromStorage);
      this.dataStore.data = JSON.parse(dataFromStorage);
      onLoadText = 'GAME LOADED';
    }

    const statusContainer = document.getElementById('status');
    if (statusContainer) {
      statusContainer.innerHTML = onLoadText;
      setTimeout(() => (statusContainer.innerHTML = ''), 3000);
    }

    this.generate();
  }

  // Regenerate the world data model and the meshes
  generate(clearCache = false) {
    if (clearCache) {
      this.dataStore.clear();
    }

    this.disposeChunks();

    for (let x = -this.drawDistance; x <= this.drawDistance; x++) {
      for (let z = -this.drawDistance; z <= this.drawDistance; z++) {
        const chunk = new WorldChunk(this.chunkSize, this.params, this.dataStore);
        chunk.position.set(x * this.chunkSize.width, 0, z * this.chunkSize.width);
        chunk.userData = { x, z };
        chunk.generate();
        this.add(chunk);
      }
    }
  }

  // Updates the visible portions of the world based on the current player position
  update(player: Player) {
    const visibleChunks = this.getVisibleChunks(player);
    const chunksToAdd = this.getChunksToAdd(visibleChunks);
    this.removeUnusedChunks(visibleChunks);

    for (const chunk of chunksToAdd) {
      this.generateChunk(chunk.x, chunk.z);
    }
  }

  // Returns an array containing the coordinates of the chunks that are currently visible to the player
  getVisibleChunks(player: Player) {
    const visibleChunks = [];

    const coords = this.worldToChunksCoords(player.position.x, player.position.y, player.position.z);
    const { x: chunkX, z: chunkZ } = coords.chunk;

    for (let x = chunkX - this.drawDistance; x <= chunkX + this.drawDistance; x++) {
      for (let z = chunkZ - this.drawDistance; z <= chunkZ + this.drawDistance; z++) {
        visibleChunks.push({ x, z });
      }
    }

    return visibleChunks;
  }

  // Returns an array containing the coordinates of the chunks that are not yet loaded
  // and need to be added to the scene
  getChunksToAdd(visibleChunks: { x: number; z: number }[]) {
    // Filter down the visible chunks to those not already in the world
    return visibleChunks.filter((chunk) => {
      const chunkExists = this.children.map((obj) => obj.userData).find(({ x, z }) => chunk.x === x && chunk.z === z);

      return !chunkExists;
    });
  }

  // Removes currently loaded chunks that are no longer visible to the player
  removeUnusedChunks(visibleChunks: { x: number; z: number }[]) {
    // Filter down the visible chunks to those not already in the world
    const chunksToRemove = this.children.filter((chunk) => {
      const { x, z } = chunk.userData;
      const chunkExists = visibleChunks.find((visibleChunk) => visibleChunk.x === x && visibleChunk.z === z);

      return !chunkExists;
    });

    for (const chunk of chunksToRemove) {
      (chunk as WorldChunk).disposeInstances();
      this.remove(chunk);
    }
  }

  // Generates the chunk at the (x, z) coordinates
  generateChunk(x: number, z: number) {
    const chunk = new WorldChunk(this.chunkSize, this.params, this.dataStore);
    chunk.position.set(x * this.chunkSize.width, 0, z * this.chunkSize.width);
    chunk.userData = { x, z };

    if (this.asyncLoading) {
      // Load chunk asynchronously
      requestIdleCallback(chunk.generate.bind(chunk), { timeout: 1000 });
    } else {
      chunk.generate();
    }

    this.add(chunk);
  }

  // Gets the block data at (x, y, z)
  getBlock(x: number, y: number, z: number) {
    const coords = this.worldToChunksCoords(x, y, z);
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

    if (chunk && chunk.loaded) {
      return chunk.getBlock(coords.block.x, coords.block.y, coords.block.z);
    } else {
      return null;
    }
  }

  // Returns the coordinates of the block at (x, y, z)
  // - `chunk` is the coordinates of the chunk containing the block
  // - `block` is the coordinates of the block relative to the chunk
  worldToChunksCoords(x: number, y: number, z: number) {
    const chunkCoords = {
      x: Math.floor(x / this.chunkSize.width),
      z: Math.floor(z / this.chunkSize.width),
    };

    const blockCoords = {
      x: x - this.chunkSize.width * chunkCoords.x,
      y,
      z: z - this.chunkSize.width * chunkCoords.z,
    };

    return { chunk: chunkCoords, block: blockCoords };
  }

  // Returns the worldChunk object at the specified coordinates
  getChunk(chunkX: number, chunkZ: number) {
    return this.children.find((chunk) => {
      return chunk.userData.x === chunkX && chunk.userData.z === chunkZ;
    }) as WorldChunk;
  }

  disposeChunks() {
    this.traverse((chunk) => {
      if (chunk instanceof WorldChunk && chunk.disposeInstances) {
        chunk.disposeInstances();
      }
    });
    this.clear();
  }

  // Adds a block at (x, y, z) of type `block`
  addBlock(x: number, y: number, z: number, blockId: number) {
    const coords = this.worldToChunksCoords(x, y, z);
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

    if (chunk) {
      chunk.addBlock(coords.block.x, coords.block.y, coords.block.z, blockId);

      // Hide adjacent neighbors if they are now hidden
      this.hideBlock(x - 1, y, z);
      this.hideBlock(x + 1, y, z);
      this.hideBlock(x, y - 1, z);
      this.hideBlock(x, y + 1, z);
      this.hideBlock(x, y, z - 1);
      this.hideBlock(x, y, z + 1);
    }
  }

  // Removes the block at (x, y, z) and sets it to empty
  removeBlock(x: number, y: number, z: number) {
    const coords = this.worldToChunksCoords(x, y, z);
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

    if (chunk) {
      chunk.removeBlock(coords.block.x, coords.block.y, coords.block.z);

      // Reveal adjacent neighbors if they are hidden
      this.revealBlock(x - 1, y, z);
      this.revealBlock(x + 1, y, z);
      this.revealBlock(x, y - 1, z);
      this.revealBlock(x, y + 1, z);
      this.revealBlock(x, y, z - 1);
      this.revealBlock(x, y, z + 1);
    }
  }

  // Reveals the block at (x, y, z) by adding a new mesh instance
  revealBlock(x: number, y: number, z: number) {
    const coords = this.worldToChunksCoords(x, y, z);
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

    if (chunk) {
      chunk.addBlockInstance(coords.block.x, coords.block.y, coords.block.z);
    }
  }

  // Hide the block at (x, y, z) by removing the mesh instance
  hideBlock(x: number, y: number, z: number) {
    const coords = this.worldToChunksCoords(x, y, z);
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

    if (chunk && chunk.isBlockObscured(coords.block.x, coords.block.y, coords.block.z)) {
      chunk.deleteBlockInstance(coords.block.x, coords.block.y, coords.block.z);
    }
  }
}
