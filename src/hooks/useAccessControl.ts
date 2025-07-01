
import { useState } from 'react';

interface AccessState {
  financial: boolean;
  settings: boolean;
}

export const useAccessControl = () => {
  const [accessGranted, setAccessGranted] = useState<AccessState>({
    financial: true, // Acesso sempre liberado
    settings: true,  // Acesso sempre liberado
  });

  const grantAccess = (section: 'financial' | 'settings') => {
    // Função mantida para compatibilidade, mas não faz nada
    setAccessGranted(prev => ({
      ...prev,
      [section]: true,
    }));
  };

  const revokeAccess = (section: 'financial' | 'settings') => {
    // Função mantida para compatibilidade, mas não faz nada
    setAccessGranted(prev => ({
      ...prev,
      [section]: true, // Sempre verdadeiro
    }));
  };

  const hasAccess = (section: 'financial' | 'settings'): boolean => {
    return true; // Sempre retorna verdadeiro
  };

  return {
    grantAccess,
    revokeAccess,
    hasAccess,
  };
};
