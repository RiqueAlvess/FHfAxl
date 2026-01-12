'use client';

import { ReactNode } from 'react';
import { EmpresaProvider } from '@/contexts/EmpresaContext';
import { AdminHeader } from './AdminHeader';

export function AdminContentWrapper({ children }: { children: ReactNode }) {
  return (
    <EmpresaProvider>
      <AdminHeader />
      {children}
    </EmpresaProvider>
  );
}
