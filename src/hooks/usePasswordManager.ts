
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AccessPassword {
  id: string;
  pagina: string;
  senha: string;
  created_at: string;
  updated_at: string;
}

export const usePasswordManager = () => {
  const [loading, setLoading] = useState(false);

  const verifyPassword = async (page: string, enteredPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Busca a senha criptografada para a página
      const { data, error } = await supabase
        .from('senhas_acesso')
        .select('senha')
        .eq('pagina', page)
        .single();

      if (error) {
        console.error('Error fetching password:', error);
        toast({
          title: "Erro",
          description: "Erro ao verificar senha.",
          variant: "destructive",
        });
        return false;
      }

      // Verifica a senha usando a função crypt do PostgreSQL
      const { data: verificationResult, error: verifyError } = await supabase
        .rpc('verify_password', {
          stored_hash: data.senha,
          password_input: enteredPassword
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

      return verificationResult === true;
    } catch (error) {
      console.error('Error:', error);
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
      
      // Atualiza a senha usando a função crypt do PostgreSQL
      const { error } = await supabase
        .rpc('update_encrypted_password', {
          page_name: page,
          new_password: newPassword
        });

      if (error) {
        console.error('Error updating password:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar senha.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Senha atualizada com sucesso!",
      });

      return true;
    } catch (error) {
      console.error('Error:', error);
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
