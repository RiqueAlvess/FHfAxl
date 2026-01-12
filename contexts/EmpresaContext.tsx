'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type EmpresaContextType = {
  empresaAtiva: string | null;
  setEmpresaAtiva: (id: string | null) => void;
  clearEmpresaAtiva: () => void;
};

const EmpresaContext = createContext<EmpresaContextType | undefined>(undefined);

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [empresaAtiva, setEmpresaAtivaState] = useState<string | null>(null);

  // Carregar empresa ativa do localStorage ao inicializar
  useEffect(() => {
    const savedEmpresa = localStorage.getItem('empresaAtiva');
    if (savedEmpresa) {
      setEmpresaAtivaState(savedEmpresa);
    }
  }, []);

  // Salvar empresa ativa no localStorage quando mudar
  const setEmpresaAtiva = (id: string | null) => {
    setEmpresaAtivaState(id);
    if (id) {
      localStorage.setItem('empresaAtiva', id);
    } else {
      localStorage.removeItem('empresaAtiva');
    }
  };

  const clearEmpresaAtiva = () => {
    setEmpresaAtivaState(null);
    localStorage.removeItem('empresaAtiva');
  };

  return (
    <EmpresaContext.Provider value={{ empresaAtiva, setEmpresaAtiva, clearEmpresaAtiva }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export const useEmpresa = () => {
  const context = useContext(EmpresaContext);
  if (context === undefined) {
    throw new Error('useEmpresa must be used within an EmpresaProvider');
  }
  return context;
};
