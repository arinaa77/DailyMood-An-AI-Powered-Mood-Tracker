import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DailyMood',
  description: 'An AI-powered mood tracker',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
