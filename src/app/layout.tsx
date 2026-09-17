import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata: Metadata = {
  title: 'PAT — ระบบติดตามขออนุมัติโครงการ',
  description: 'Project Approval Tracking System — ระบบติดตามและอนุมัติโครงการดิจิทัล',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <Analytics />
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              fontFamily: "'IBM Plex Sans Thai', sans-serif",
              fontSize: '13px',
            },
          }}
        />
      </body>
    </html>
  );
}
