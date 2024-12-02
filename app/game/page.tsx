import dynamic from 'next/dynamic';

import GameLoader from '@/components/game-loader';

const GameCanvas = dynamic(() => import('@/components/game-canvas'), { ssr: false, loading: () => <GameLoader /> });

export default function GamePage() {
  return (
    <main>
      <GameCanvas />
    </main>
  );
}
