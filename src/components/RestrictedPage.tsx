import React, { useState, useEffect } from 'react';
import RestrictedAccessPrompt from './RestrictedAccessPrompt';
import { useAccessPasswordManager } from '@/hooks/useAccessPasswordManager';

interface RestrictedPageProps {
  children: React.ReactNode;
  page: string;
  title: string;
}

const RestrictedPage: React.FC<RestrictedPageProps> = ({ children, page, title }) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const { validateSession, verifyPasswordAndCreateSession } = useAccessPasswordManager();

  useEffect(() => {
    const checkSession = async () => {
      // Check if user has a valid server-side session token
      const sessionToken = localStorage.getItem(`session_${page}`);
      
      if (sessionToken) {
        const isValid = await validateSession(page, sessionToken);
        
        if (isValid) {
          setHasAccess(true);
          setIsValidating(false);
          return;
        } else {
          // Session expired or invalid, remove it
          localStorage.removeItem(`session_${page}`);
        }
      }
      
      setIsValidating(false);
      setShowPrompt(true);
    };

    checkSession();
  }, [page, validateSession]);

  const handleAccessGranted = (sessionToken: string) => {
    setHasAccess(true);
    setShowPrompt(false);
    // Store session token in localStorage for server-side validation
    localStorage.setItem(`session_${page}`, sessionToken);
  };

  const handlePromptClose = () => {
    setShowPrompt(false);
    // Redirect to dashboard or previous page
    window.history.back();
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <RestrictedAccessPrompt
      isOpen={showPrompt}
      onClose={handlePromptClose}
      onSuccess={handleAccessGranted}
      page={page}
      title={title}
    />
  );
};

export default RestrictedPage;