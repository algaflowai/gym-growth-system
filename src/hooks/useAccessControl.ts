
// Este hook foi removido pois o controle de acesso foi simplificado
// As páginas de Financeiro e Configurações agora são acessíveis diretamente

export const useAccessControl = () => {
  // Retorna sempre true para manter compatibilidade
  const hasAccess = () => true;
  const grantAccess = () => {};
  const revokeAccess = () => {};

  return {
    hasAccess,
    grantAccess,
    revokeAccess,
  };
};
