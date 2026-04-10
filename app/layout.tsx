import type { Metadata } from 'next';
import FirebaseAnalyticsInit from '@/components/FirebaseAnalyticsInit';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://virtmcu.com'),
  title: 'Virtmcu | High-Performance Embedded Simulation',
  description:
    'Bridge the flexibility of Renode with the execution speed of QEMU. Virtmcu enables deterministic digital twin synchronization and dynamic hardware modeling.',
  openGraph: {
    title: 'Virtmcu: High-Performance Embedded Simulation',
    description:
      'Bridge the flexibility of Renode with the execution speed of QEMU. Virtmcu enables deterministic digital twin synchronization and dynamic hardware modeling.',
    url: 'https://virtmcu.com',
    siteName: 'Virtmcu',
    images: [
      {
        url: 'https://virtmcu.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Virtmcu — High-Performance Embedded Simulation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Virtmcu: High-Performance Embedded Simulation',
    description:
      'Bridge the flexibility of Renode with the execution speed of QEMU. Virtmcu enables deterministic digital twin synchronization and dynamic hardware modeling.',
    creator: '@RefractSystems',
    images: ['https://virtmcu.com/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <FirebaseAnalyticsInit />
        {children}
      </body>
    </html>
  );
}
