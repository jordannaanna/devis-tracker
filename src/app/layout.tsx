import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Suivi Devis',
  description: 'Outil de suivi des offres et devis',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
