import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HosOS | Oseika Resort Management System',
  description: 'Complete Hospitality Operating System for Oseika Resort — Rooms, POS, Multi-Store Inventory, Events, and 360° Internal Room Audit.',
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
