
// Este componente foi removido pois o acesso restrito foi simplificado
// As páginas de Financeiro e Configurações agora são acessíveis diretamente

import React from 'react';

interface RestrictedAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  title: string;
}

const RestrictedAccessModal = ({ isOpen, onClose, onSubmit, title }: RestrictedAccessModalProps) => {
  // Componente não é mais utilizado
  return null;
};

export default RestrictedAccessModal;
