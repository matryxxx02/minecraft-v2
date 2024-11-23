'use server';

import { redirect } from 'next/navigation';

export async function createNewGame() {
  await new Promise((res) => setTimeout(res, 5000));

  // TODO: parse new game configs, when implemented

  // TODO: create new game according to config, when implemented

  redirect('/game');
}
