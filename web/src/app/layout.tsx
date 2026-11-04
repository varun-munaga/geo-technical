import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TERRALOG PRO - Geotechnical Operations & Realtime QA Console',
  description: 'Enterprise Geotechnical Investigation Operations, Field OCR & Subsurface Borehole Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}

