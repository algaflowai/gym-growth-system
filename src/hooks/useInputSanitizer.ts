export const useInputSanitizer = () => {
  const sanitizeText = (input: string): string => {
    if (!input) return '';
    
    // Remove potential XSS characters and normalize whitespace
    return input
      .replace(/[<>'"]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1000); // Limit length
  };

  const sanitizeEmail = (email: string): string => {
    if (!email) return '';
    
    // Basic email sanitization
    return email
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9@._-]/g, '')
      .slice(0, 254); // RFC 5321 limit
  };

  const sanitizePhone = (phone: string): string => {
    if (!phone) return '';
    
    // Keep only digits, spaces, parentheses, dashes, and plus
    return phone
      .replace(/[^0-9\s()\-+]/g, '')
      .trim()
      .slice(0, 20);
  };

  const sanitizeCPF = (cpf: string): string => {
    if (!cpf) return '';
    
    // Keep only digits and format characters
    return cpf
      .replace(/[^0-9.-]/g, '')
      .slice(0, 14);
  };

  const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (!password) {
      return { isValid: false, message: 'Senha é obrigatória' };
    }

    if (password.length < 8) {
      return { isValid: false, message: 'Senha deve ter pelo menos 8 caracteres' };
    }

    if (password.length > 128) {
      return { isValid: false, message: 'Senha muito longa' };
    }

    // Check for at least one uppercase, lowercase, and number
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasUpper || !hasLower || !hasNumber) {
      return { 
        isValid: false, 
        message: 'Senha deve conter ao menos uma letra maiúscula, minúscula e um número' 
      };
    }

    return { isValid: true };
  };

  return {
    sanitizeText,
    sanitizeEmail,
    sanitizePhone,
    sanitizeCPF,
    validatePassword
  };
};
