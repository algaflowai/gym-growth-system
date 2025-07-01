
// Simplified access control hook - always returns true since access control was removed
export const useAccessControl = () => {
  const hasAccess = () => true;
  const grantAccess = () => {};
  const revokeAccess = () => {};

  return {
    hasAccess,
    grantAccess,
    revokeAccess,
  };
};
