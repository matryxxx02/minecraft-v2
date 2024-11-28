import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { World } from '@/components/classes/world';
import { Player } from '@/components/classes/player';

import { resources } from '@/lib/blocks';

export const setupGUI = (world: World, player: Player) => {
  // Initialize GUI
  const gui = new GUI();

  // Player config
  const playerFolder = gui.addFolder('Player');
  playerFolder.add(player, 'maxSpeed', 1, 20, 1).name('Max Speed');
  playerFolder.add(player.cameraHelper, 'visible').name('Show Camera Helper');

  // Terrain config
  const terrainFolder = gui.addFolder('Terrain');
  gui.add(world.size, 'width', 8, 128, 1).name('Width');
  gui.add(world.size, 'height', 8, 64, 1).name('Height');
  terrainFolder.add(world.params.terrain, 'scale', 10, 100).name('Scale');
  terrainFolder.add(world.params.terrain, 'magnitude', 0, 1).name('Magnitude');
  terrainFolder.add(world.params.terrain, 'offset', 0, 1).name('Offset');
  terrainFolder.add(world.params, 'seed', 0, 10000).name('Seed');

  // Resource config
  const resourcesFolder = gui.addFolder('Resources');
  resources.forEach((resource) => {
    resourcesFolder.add(resource, 'scarcity', 0, 1).name(resource.name);

    const scaleFolder = resourcesFolder.addFolder('Scale');
    scaleFolder.add(resource.scale, 'x', 10, 100).name('X Scale');
    scaleFolder.add(resource.scale, 'y', 10, 100).name('Y Scale');
    scaleFolder.add(resource.scale, 'z', 10, 100).name('Z Scale');
  });

  // Handle value change in GUI
  gui.onChange(() => {
    world.generate();
  });

  // Return GUI object to destroy in the cleanup function of useEffect
  return gui;
};
