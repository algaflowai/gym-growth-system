
// This component is no longer used since access control was removed
import React from 'react';

interface RestrictedAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  title: string;
}

const RestrictedAccessModal = ({ isOpen, onClose, onSubmit, title }: RestrictedAccessModalProps) => {
  // Component no longer renders anything since access control was removed
  return null;
};

export default RestrictedAccessModal;
