'use client';

import { RefObject, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { World } from '@/components/classes/world';
import { Player } from '@/components/classes/player';
import { Physics } from '@/components/classes/physics';
import { ModelLoader } from '@/components/classes/model-loader';

import { setupGUI } from '@/lib/setup-gui';
import { blocks } from '@/lib/blocks';
import { Config } from '@/lib/config';

type GameSceneType = {
  sun: RefObject<THREE.DirectionalLight>;
  toolbar: RefObject<HTMLDivElement>;
};

export function GameScene({ sun, toolbar }: GameSceneType) {
  const { scene, camera, gl } = useThree();

  // Orbitcontrols
  const controls = useMemo(() => new OrbitControls(camera, gl.domElement), []);

  const world = useMemo(() => new World(), []);
  const player = useMemo(() => new Player(scene), []);
  const physics = useMemo(() => new Physics(scene), []);

  const modelLoader = useMemo(() => new ModelLoader(), []);

  const onMouseDown = () => {
    if (player.controls.isLocked && player.selectedCoords) {
      if (player.activeBlockId === blocks.empty.id) {
        // console.log(`Removing block at ${JSON.stringify(player.selectedCoords)}`);
        world.removeBlock(player.selectedCoords.x, player.selectedCoords.y, player.selectedCoords.z);
        player.tool.startAnimation();
      } else {
        // console.log(`Adding ${player.activeBlockId} block at ${JSON.stringify(player.selectedCoords)}`);
        world.addBlock(player.selectedCoords.x, player.selectedCoords.y, player.selectedCoords.z, player.activeBlockId);
      }
    }
  };

  useEffect(() => {
    scene.fog = new THREE.Fog(Config.scene.fog.color, Config.scene.fog.near, Config.scene.fog.far);

    controls.target.set(...Config.scene.orbit_controls.target);
    controls.update();

    world.generate();
    scene.add(world);

    modelLoader.loadModels((models) => {
      player.tool.setMesh(models.pickaxe!);
    });

    document.addEventListener('mousedown', onMouseDown);

    let gui: GUI | undefined;
    if (Config.misc.show_gui) {
      gui = setupGUI(scene, world, player);
    }

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      if (gui) gui.destroy();
    };
  }, []);

  // Render loop
  useFrame(({ gl, scene, camera }, delta) => {
    if (player.controls.isLocked) {
      player.update(world);
      physics.update(delta, player, world);
      world.update(player);
      if (toolbar.current) {
        toolbar.current.style.display = 'flex';
      }

      if (sun.current) {
        sun.current.position.copy(player.position);
        sun.current.position.add(new THREE.Vector3(...Config.canvas.sun.position));
        sun.current.target.position.copy(player.position);
      }
    } else {
      if (toolbar.current) {
        toolbar.current.style.display = 'none';
      }
    }

    gl.render(scene, player.controls.isLocked ? player.camera : camera);
  }, 1);

  return null;
}
