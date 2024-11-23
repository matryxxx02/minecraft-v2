'use client';

import { useEffect, useState } from 'react';

const setupTexts = ['Creating your world . . .', 'Unpacking resources', 'Almost done!'];

export default function SetupLoading() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => Math.min(setupTexts.length - 1, prev + 1));
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return <div className="h-screen w-full flex items-center justify-center">{setupTexts[textIndex]}</div>;
}
