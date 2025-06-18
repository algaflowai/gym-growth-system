
import { useState } from 'react';

interface AccessState {
  financial: boolean;
  settings: boolean;
}

export const useAccessControl = () => {
  const [accessGranted, setAccessGranted] = useState<AccessState>({
    financial: false,
    settings: false,
  });

  const grantAccess = (section: 'financial' | 'settings') => {
    setAccessGranted(prev => ({
      ...prev,
      [section]: true,
    }));
  };

  const revokeAccess = (section: 'financial' | 'settings') => {
    setAccessGranted(prev => ({
      ...prev,
      [section]: false,
    }));
  };

  const hasAccess = (section: 'financial' | 'settings'): boolean => {
    return accessGranted[section];
  };

  return {
    grantAccess,
    revokeAccess,
    hasAccess,
  };
};
