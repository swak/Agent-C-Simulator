import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agent-C Simulator',
  description: 'A 3D autonomous bot automation game',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
