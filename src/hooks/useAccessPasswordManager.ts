import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAccessPasswordManager = () => {
  const [loading, setLoading] = useState(false);

  const verifyPassword = async (page: string, enteredPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Security: Removed debug logging of sensitive data
      
      // Clean password of invisible characters
      const cleanPassword = enteredPassword.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
      
      const { data, error } = await supabase
        .from('access_passwords')
        .select('password_hash')
        .eq('page_name', page)
        .maybeSingle();

      if (error) {
        console.error('Error querying password:', error);
        toast({
          title: "Erro",
          description: "Erro ao verificar senha.",
          variant: "destructive",
        });
        return false;
      }

      if (!data) {
        toast({
          title: "Erro",
          description: "Senha não encontrada para esta página.",
          variant: "destructive",
        });
        return false;
      }

      // Verify password using secure RPC function
      const { data: verifyResult, error: verifyError } = await supabase
        .rpc('verify_password', {
          stored_hash: data.password_hash,
          password_input: cleanPassword
        });

      if (verifyError) {
        console.error('Error verifying password:', verifyError);
        toast({
          title: "Erro",
          description: "Erro ao verificar senha.",
          variant: "destructive",
        });
        return false;
      }

      if (verifyResult) {
        return true;
      }

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

  return {
    verifyPassword,
    updatePassword,
    loading,
  };
};