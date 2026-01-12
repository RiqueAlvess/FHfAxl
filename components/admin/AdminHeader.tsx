'use client';

import { EmpresaSelector } from './EmpresaSelector';

type AdminHeaderProps = {
  title?: string;
  description?: string;
};

export function AdminHeader({ title, description }: AdminHeaderProps) {
  return (
    <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          {title && <h1 className="text-2xl font-bold text-zinc-50">{title}</h1>}
          {description && (
            <p className="text-sm text-zinc-400 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <EmpresaSelector />
        </div>
      </div>
    </div>
  );
}
