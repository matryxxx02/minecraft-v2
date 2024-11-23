import { createNewGame } from '@/actions/game/create-new-game';

export default async function SetupPage() {
  return await createNewGame();
}
