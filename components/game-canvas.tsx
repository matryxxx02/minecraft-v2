'use client';

import { useRef, RefObject } from 'react';

import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';

import { GameScene } from '@/components/game-scene';

import { Config } from '@/lib/config';
import Toolbar from '@/components/toolbar';

export default function GameCanvas() {
  const sun = useRef<THREE.DirectionalLight>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  return (
    <section className="w-full h-screen">
      <Canvas
        camera={{ position: Config.canvas.camera_position }}
        dpr={window.devicePixelRatio}
        shadows="soft"
        onCreated={({ gl, camera }) => {
          gl.setClearColor(Config.canvas.sky_color);
          camera.layers.enable(1);
        }}
      >
        <GameScene sun={sun} toolbar={toolbarRef} />
        <SetupLights sun={sun} />
        {Config.misc.show_fps && <Stats />}
      </Canvas>

      <Toolbar ref={toolbarRef} />

      <div id="info">
        <div id="player-position" className="absolute right-0 bottom-0 text-white m-2" />
      </div>

      <div id="status" className="fixed bottom-2 left-2 text-white"></div>
    </section>
  );
}

function SetupLights({ sun }: { sun: RefObject<THREE.DirectionalLight> }) {
  return (
    <>
      <directionalLight
        ref={sun}
        position={Config.canvas.sun.position}
        castShadow={Config.canvas.sun.cast_shadow}
        shadow-camera-left={Config.canvas.sun.shadow.camera.left}
        shadow-camera-right={Config.canvas.sun.shadow.camera.right}
        shadow-camera-bottom={Config.canvas.sun.shadow.camera.bottom}
        shadow-camera-top={Config.canvas.sun.shadow.camera.top}
        shadow-camera-near={Config.canvas.sun.shadow.camera.near}
        shadow-camera-far={Config.canvas.sun.shadow.camera.far}
        shadow-bias={Config.canvas.sun.shadow.bias}
        shadow-mapSize={Config.canvas.sun.shadow.map_size}
      />
      <ambientLight intensity={Config.canvas.ambient_light.intensity} />
    </>
  );
}
