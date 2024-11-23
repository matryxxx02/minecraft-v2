'use client';

import { Canvas } from '@react-three/fiber';
import { Stats, OrbitControls } from '@react-three/drei';

import { World } from '@/components/classes/world';

import { useGUI } from '@/hooks/use-gui';

export default function GameCanvas() {
  const world = new World();
  world.generate();

  useGUI(world);

  return (
    <section className="w-full h-screen">
      <Canvas
        camera={{ position: [-32, 16, -32] }}
        shadows="soft"
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x80a0e0);
          scene.add(world);
        }}
      >
        <SetupLights />
        <OrbitControls target={[16, 0, 16]} />
        <Stats />
      </Canvas>
    </section>
  );
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
