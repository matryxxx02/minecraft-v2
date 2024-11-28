'use client';

import { useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { World } from '@/components/classes/world';
import { Player } from '@/components/classes/player';

import { setupGUI } from '@/lib/setup-gui';

export default function GameCanvas() {
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
        <Main />
        <SetupLights />
        <Stats />
      </Canvas>

      <div id="info">
        <div id="player-position" className="absolute right-0 bottom-0 text-white m-2" />
      </div>
    </section>
  );
}

function Main() {
  const { scene, camera, gl } = useThree();

  // Orbitcontrols
  const controls = new OrbitControls(camera, gl.domElement);
  controls.target.set(16, 16, 16);
  controls.update();

  let previousTime = performance.now();

  const world = useMemo(() => new World(), []);
  const player = useMemo(() => new Player(scene), []);

  useEffect(() => {
    world.generate();
    scene.add(world);

    const gui = setupGUI(world, player);
    return () => {
      gui.destroy();
    };
  }, []);

  // Render loop
  useFrame(({ gl, scene, camera }) => {
    let currentTime = performance.now();
    let dt = (currentTime - previousTime) / 1000;

    player.applyInputs(dt);
    gl.render(scene, player.controls.isLocked ? player.camera : camera);

    previousTime = currentTime;
  }, 1);

  return null;
}

function SetupLights() {
  return (
    <>
      <directionalLight
        position={[50, 50, 50]}
        castShadow
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-bottom={-50}
        shadow-camera-top={50}
        shadow-camera-near={0.1}
        shadow-camera-far={100}
        shadow-bias={-0.0005}
        shadow-mapSize={[512, 512]}
      />
      <ambientLight intensity={0.5} />
    </>
  );
}
