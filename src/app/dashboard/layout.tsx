'use client';

import { Suspense } from 'react';
import DashboardNav from '@/components/DashboardNav';
import DashboardLoading from '@/components/DashboardLoading';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <DashboardNav />
      <Suspense fallback={<DashboardLoading />}>
        {children}
      </Suspense>
    </div>
  );
} 