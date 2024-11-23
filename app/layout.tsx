import type { Metadata } from 'next';

import { minecraft } from '@/font';
import './globals.css';

export const metadata: Metadata = {
  title: '3D Minecraft',
  description: 'Build your dream world with mini minecraft simulation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${minecraft.variable} antialiased`}>{children}</body>
    </html>
  );
}
