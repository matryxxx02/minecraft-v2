// import GameCanvas from '@/components/game-canvas';

import dynamic from 'next/dynamic';
const GameCanvas = dynamic(() => import('@/components/game-canvas'), { ssr: false });

export default function GamePage() {
  return (
    <main>
      <GameCanvas />
    </main>
  );
}
