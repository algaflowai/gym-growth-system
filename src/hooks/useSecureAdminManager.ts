import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useSecurityLogger } from './useSecurityLogger';

export const useSecureAdminManager = () => {
  const [loading, setLoading] = useState(false);
  const { logAdminAction } = useSecurityLogger();

  const initializeFirstAdmin = async (userEmail: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('initialize_first_admin', {
        user_email: userEmail
      });

      if (error) {
        console.error('Error initializing first admin:', error);
        toast({
          title: "Erro",
          description: error.message || "Não foi possível criar o primeiro administrador.",
          variant: "destructive",
        });
        return false;
      }

      await logAdminAction('first_admin_initialized', { user_email: userEmail });
      
      toast({
        title: "Sucesso",
        description: "Primeiro administrador criado com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar administrador.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const assignAdminRole = async (targetUserId: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error } = await supabase.rpc('assign_admin_role', {
        target_user_id: targetUserId
      });

      if (error) {
        console.error('Error assigning admin role:', error);
        toast({
          title: "Erro",
          description: error.message || "Não foi possível atribuir papel de administrador.",
          variant: "destructive",
        });
        return false;
      }

      await logAdminAction('admin_role_assigned', { target_user_id: targetUserId });
      
      toast({
        title: "Sucesso",
        description: "Papel de administrador atribuído com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atribuir papel de administrador.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('get_current_user_role');
      
      if (error) {
        console.error('Error checking user role:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Unexpected error checking role:', error);
      return null;
    }
  };

  return {
    initializeFirstAdmin,
    assignAdminRole,
    checkUserRole,
    loading
  };
};