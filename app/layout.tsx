import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Door Knocker - Sapiens Laboratories',
  description: 'Radar de prospección inteligente',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

