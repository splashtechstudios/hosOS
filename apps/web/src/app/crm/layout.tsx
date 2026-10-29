import React from 'react';

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="hosos-crm-root">{children}</div>;
}

