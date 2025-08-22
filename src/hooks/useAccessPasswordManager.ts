import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAccessPasswordManager = () => {
  const [loading, setLoading] = useState(false);

  const verifyPassword = async (page: string, enteredPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      console.log('🔍 DEBUG: Iniciando verificação de senha');
      console.log('📄 Página:', page);
      console.log('🔑 Senha digitada (length):', enteredPassword.length);
      console.log('🔑 Senha digitada (bytes):', Array.from(enteredPassword).map(c => c.charCodeAt(0)));
      console.log('🔑 Senha digitada (trimmed):', enteredPassword.trim());
      
      // Limpar a senha de caracteres invisíveis
      const cleanPassword = enteredPassword.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
      console.log('🧹 Senha limpa:', cleanPassword);
      
      const { data, error } = await supabase
        .from('access_passwords')
        .select('password_hash')
        .eq('page_name', page)
        .single();

      if (error || !data) {
        console.error('❌ Erro ao buscar senha no DB:', error);
        toast({
          title: "Erro",
          description: "Erro ao verificar senha no banco de dados.",
          variant: "destructive",
        });
        return false;
      }

      console.log('🗄️ Hash encontrado no DB:', data.password_hash);
      console.log('🗄️ Hash length:', data.password_hash.length);

      // Testar primeiro com a senha original
      console.log('🧪 Testando senha original...');
      const { data: verifyResult1, error: verifyError1 } = await supabase
        .rpc('verify_password', {
          stored_hash: data.password_hash,
          password_input: enteredPassword
        });

      if (verifyError1) {
        console.error('❌ Erro na verificação 1:', verifyError1);
      } else {
        console.log('✅ Resultado verificação 1:', verifyResult1);
        if (verifyResult1) {
          console.log('🎉 Senha original funcionou!');
          return true;
        }
      }

      // Testar com a senha limpa
      console.log('🧪 Testando senha limpa...');
      const { data: verifyResult2, error: verifyError2 } = await supabase
        .rpc('verify_password', {
          stored_hash: data.password_hash,
          password_input: cleanPassword
        });

      if (verifyError2) {
        console.error('❌ Erro na verificação 2:', verifyError2);
      } else {
        console.log('✅ Resultado verificação 2:', verifyResult2);
        if (verifyResult2) {
          console.log('🎉 Senha limpa funcionou!');
          return true;
        }
      }

      // Testar senhas padrão conhecidas como fallback
      const defaultPasswords = ['financeiro123', 'configuracao123'];
      for (const defaultPass of defaultPasswords) {
        console.log(`🧪 Testando senha padrão: ${defaultPass}`);
        const { data: verifyResult3, error: verifyError3 } = await supabase
          .rpc('verify_password', {
            stored_hash: data.password_hash,
            password_input: defaultPass
          });

        if (verifyError3) {
          console.error(`❌ Erro na verificação padrão (${defaultPass}):`, verifyError3);
        } else {
          console.log(`✅ Resultado verificação padrão (${defaultPass}):`, verifyResult3);
          if (verifyResult3) {
            console.log(`🎉 Senha padrão ${defaultPass} funcionou! Use esta senha.`);
            toast({
              title: "Dica",
              description: `Use a senha: ${defaultPass}`,
              variant: "default",
            });
            return false; // Retorna false para que o usuário digite a senha correta
          }
        }
      }

      console.log('❌ Nenhuma verificação de senha funcionou');
      toast({
        title: "Erro",
        description: "Senha incorreta. Verifique se está digitando corretamente.",
        variant: "destructive",
      });
      
      return false;
    } catch (error) {
      console.error('💥 Erro inesperado:', error);
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