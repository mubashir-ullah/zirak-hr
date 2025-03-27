'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardShellProps {
  children: ReactNode;
  className?: string;
}

export default function DashboardShell({
  children,
  className,
}: DashboardShellProps) {
  return (
    <div className={cn('flex-1 overflow-hidden', className)}>
      <div className="container flex-1 items-start md:grid md:gap-6 lg:gap-10 py-8">
        <main className="relative w-full space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
