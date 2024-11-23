import Image from 'next/image';

import NewGameButton from '@/components/buttons/new-game-button';

import minecraftTitle from '@/public/minecraft.png';
import titleScreen from '@/public/titleScreen/six.jpeg';

export default function Home() {
  return (
    <div className="h-screen w-full">
      <section className="h-screen w-full flex justify-center items-center relative">
        <Image
          src={titleScreen}
          alt="title-screen"
          priority
          className="absolute h-full w-full object-cover -z-10 bg-cover"
        />
        <div className="flex flex-col items-center gap-10 p-10 max-w-4xl">
          <Image src={minecraftTitle} alt="minecraft-title" priority />
          <div className="flex flex-col gap-4">
            <NewGameButton />
            <button className="btn">Load Game</button>
            <button className="btn">Options</button>
          </div>
        </div>
      </section>
    </div>
  );
}
