import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useSecurityLogger } from './useSecurityLogger';
import { useInputSanitizer } from './useInputSanitizer';

export const useAccessPasswordManager = () => {
  const [loading, setLoading] = useState(false);
  const { logPasswordVerification } = useSecurityLogger();
  const { sanitizeText } = useInputSanitizer();

  const verifyPassword = async (page: string, enteredPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Clean and sanitize password
      const cleanPassword = sanitizeText(enteredPassword.trim().replace(/[\u200B-\u200D\uFEFF]/g, ''));
      
      // Verify password using secure RPC function (doesn't expose password hashes to client)
      const { data: isValid, error } = await supabase
        .rpc('verify_page_access', {
          page_name_input: page,
          password_input: cleanPassword
        });

      if (error) {
        console.error('Error verifying password:', error);
        toast({
          title: "Erro",
          description: "Erro ao verificar senha.",
          variant: "destructive",
        });
        return false;
      }

      if (isValid) {
        await logPasswordVerification(page, true);
        return true;
      }

      await logPasswordVerification(page, false);
      toast({
        title: "Erro",
        description: "Senha incorreta.",
        variant: "destructive",
      });
      
      return false;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao verificar senha.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (page: string, newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .rpc('update_access_password', {
          page_name: page,
          new_password: newPassword
        });

      if (error) {
        console.error('Error updating password:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a senha.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: `Senha da página ${page} atualizada com sucesso!`,
      });
      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar senha.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyPasswordAndCreateSession = async (page: string, enteredPassword: string): Promise<string | null> => {
    try {
      setLoading(true);
      
      // Clean and sanitize password
      const cleanPassword = sanitizeText(enteredPassword.trim().replace(/[\u200B-\u200D\uFEFF]/g, ''));
      
      // Create session using secure RPC function
      const { data, error } = await supabase
        .rpc('create_page_access_session', {
          page_name_input: page,
          password_input: cleanPassword
        });

      if (error) {
        console.error('Error creating session:', error);
        toast({
          title: "Erro",
          description: "Erro ao verificar senha.",
          variant: "destructive",
        });
        return null;
      }

      if (data && typeof data === 'object' && 'success' in data && data.success) {
        await logPasswordVerification(page, true);
        return (data as { success: boolean; session_token: string }).session_token;
      }

      await logPasswordVerification(page, false);
      return null;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao verificar senha.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const validateSession = async (page: string, sessionToken: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('validate_page_access_session', {
        page_name_input: page,
        session_token_input: sessionToken
      });

      if (error) {
        console.error('Error validating session:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  };

  return {
    verifyPassword,
    verifyPasswordAndCreateSession,
    validateSession,
    updatePassword,
    loading,
  };
};