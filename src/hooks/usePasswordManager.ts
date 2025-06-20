
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
      
      console.log('Verifying password for page:', page);
      console.log('Entered password:', enteredPassword);
      
      // Busca a senha criptografada para a página
      const { data, error } = await supabase
        .from('senhas_acesso')
        .select('senha')
        .eq('pagina', page)
        .single();

      if (error) {
        console.error('Error fetching password:', error);
        
        // Se não encontrar a senha no banco, verifica contra as senhas padrão
        const defaultPasswords: { [key: string]: string } = {
          'financeiro': 'financeiro123',
          'configuracoes': 'configuracao123'
        };
        
        if (defaultPasswords[page] && enteredPassword === defaultPasswords[page]) {
          console.log('Using default password for page:', page);
          return true;
        }
        
        toast({
          title: "Erro",
          description: "Erro ao verificar senha.",
          variant: "destructive",
        });
        return false;
      }

      console.log('Found stored hash for page:', page);

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

      console.log('Password verification result:', verificationResult);

      if (!verificationResult) {
        toast({
          title: "Acesso Negado",
          description: "Senha incorreta.",
          variant: "destructive",
        });
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
      
      // Verifica se já existe uma entrada para a página
      const { data: existingPassword, error: fetchError } = await supabase
        .from('senhas_acesso')
        .select('id')
        .eq('pagina', page)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing password:', fetchError);
        toast({
          title: "Erro",
          description: "Erro ao verificar senha existente.",
          variant: "destructive",
        });
        return false;
      }

      if (existingPassword) {
        // Atualiza a senha existente
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
      } else {
        // Cria nova entrada com senha criptografada
        const { error } = await supabase
          .from('senhas_acesso')
          .insert([{
            pagina: page,
            senha: newPassword // Será criptografada por um trigger no banco
          }]);

        if (error) {
          console.error('Error creating password:', error);
          toast({
            title: "Erro",
            description: "Erro ao criar senha.",
            variant: "destructive",
          });
          return false;
        }
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
