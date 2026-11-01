import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Osieka Resort | 100% Off-Grid Solar Eco-Resort & Lodges • Ogori',
  description:
    'Experience Osieka Resort in Ayeromi, Ogori, Kogi State. 100% off-grid solar-powered lodges, restful standard rooms & VIP suites, fresh African & continental dining, and bonfire lounge.',
  icons: {
    icon: [
      { url: '/favicon.jpg', type: 'image/jpeg' },
      { url: '/osieka-logo.jpg', type: 'image/jpeg' },
    ],
    shortcut: ['/favicon.jpg'],
    apple: [{ url: '/osieka-logo.jpg', sizes: '180x180', type: 'image/jpeg' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/osieka-logo.jpg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
