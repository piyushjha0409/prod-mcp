import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Productivity Assistant',
  description: 'AI-powered assistant for calendar and productivity management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
