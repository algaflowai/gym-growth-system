import React, { useState, useEffect } from 'react';
import RestrictedAccessPrompt from './RestrictedAccessPrompt';

interface RestrictedPageProps {
  children: React.ReactNode;
  page: string;
  title: string;
}

const RestrictedPage: React.FC<RestrictedPageProps> = ({ children, page, title }) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user already has access stored in session
    const accessKey = `access_${page}`;
    const hasStoredAccess = sessionStorage.getItem(accessKey) === 'true';
    
    if (hasStoredAccess) {
      setHasAccess(true);
    } else {
      setShowPrompt(true);
    }
  }, [page]);

  const handleAccessGranted = () => {
    setHasAccess(true);
    setShowPrompt(false);
    // Store access in session storage
    sessionStorage.setItem(`access_${page}`, 'true');
  };

  const handlePromptClose = () => {
    setShowPrompt(false);
    // Redirect to dashboard or previous page
    window.history.back();
  };

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