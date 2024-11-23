'use client';

import { useRouter } from 'next/navigation';

export default function NewGameButton() {
  const router = useRouter();

  const handleNewGame = () => {
    router.replace('/setup');
  };

  return (
    <button className="btn" onClick={handleNewGame}>
      New Game
    </button>
  );
}
