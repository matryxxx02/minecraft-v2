'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { World } from '@/components/classes/world';
import { Player } from '@/components/classes/player';
import { Physics } from '@/components/classes/physics';

import { setupGUI } from '@/lib/setup-gui';
import { blocks } from '@/lib/blocks';

export default function GameCanvas() {
  const sun = useMemo(() => new THREE.DirectionalLight(), []);

  return (
    <section className="w-full h-screen">
      <Canvas
        camera={{ position: [-20, 20, -20] }}
        dpr={window.devicePixelRatio}
        shadows="soft"
        onCreated={({ gl }) => {
          gl.setClearColor(0x80a0e0);
        }}
      >
        <Main sun={sun} />
        <SetupLights sun={sun} />
        <Stats />
      </Canvas>

      <div id="info">
        <div id="player-position" className="absolute right-0 bottom-0 text-white m-2" />
      </div>
    </section>
  );
}

function Main({ sun }: { sun: THREE.DirectionalLight }) {
  const { scene, camera, gl } = useThree();

  // Orbitcontrols
  const controls = useMemo(() => new OrbitControls(camera, gl.domElement), []);

  const world = useMemo(() => new World(), []);
  const player = useMemo(() => new Player(scene), []);
  const physics = useMemo(() => new Physics(scene), []);

  const onMouseDown = (event: MouseEvent) => {
    if (player.controls.isLocked && player.selectedCoords) {
      if (player.activeBlockId === blocks.empty.id) {
        // console.log(`Removing block at ${JSON.stringify(player.selectedCoords)}`);
        world.removeBlock(player.selectedCoords.x, player.selectedCoords.y, player.selectedCoords.z);
      } else {
        // console.log(`Adding ${player.activeBlockId} block at ${JSON.stringify(player.selectedCoords)}`);
        world.addBlock(player.selectedCoords.x, player.selectedCoords.y, player.selectedCoords.z, player.activeBlockId);
      }
    }
  };

  useEffect(() => {
    scene.fog = new THREE.Fog(0x80a0e0, 50, 100);

    controls.target.set(16, 16, 16);
    controls.update();

    world.generate();
    scene.add(world);

    document.addEventListener('mousedown', onMouseDown);
    const gui = setupGUI(scene, world, player);

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      gui.destroy();
    };
  }, []);

  // Render loop
  let previousTime = performance.now();
  useFrame(({ gl, scene, camera }) => {
    let currentTime = performance.now();
    let dt = (currentTime - previousTime) / 1000;

    if (player.controls.isLocked) {
      player.update(world);
      physics.update(dt, player, world);
      world.update(player);

      sun.position.copy(player.position);
      sun.position.sub(new THREE.Vector3(-50, -50, -50));
      sun.target.position.copy(player.position);
    }

    gl.render(scene, player.controls.isLocked ? player.camera : camera);

    previousTime = currentTime;
  }, 1);

  return null;
}

function SetupLights({ sun }: { sun: THREE.DirectionalLight }) {
  const { scene } = useThree();

  sun.position.set(50, 50, 50);
  sun.castShadow = true;
  sun.shadow.camera.left = -100;
  sun.shadow.camera.right = 100;
  sun.shadow.camera.bottom = -100;
  sun.shadow.camera.top = 100;
  sun.shadow.camera.near = 0.1;
  sun.shadow.camera.far = 200;
  sun.shadow.bias = -0.0001;
  sun.shadow.mapSize = new THREE.Vector2(2048, 2048);
  scene.add(sun);
  scene.add(sun.target);

  const ambient = useMemo(() => new THREE.AmbientLight(), []);
  ambient.intensity = 0.5;
  scene.add(ambient);

  return null;

  // return (
  //   <>
  //     <directionalLight
  //       position={[50, 50, 50]}
  //       castShadow
  //       shadow-camera-left={-50}
  //       shadow-camera-right={50}
  //       shadow-camera-bottom={-50}
  //       shadow-camera-top={50}
  //       shadow-camera-near={0.1}
  //       shadow-camera-far={100}
  //       shadow-bias={-0.0005}
  //       shadow-mapSize={[512, 512]}
  //     />
  //     <ambientLight intensity={0.5} />
  //   </>
  // );
}
