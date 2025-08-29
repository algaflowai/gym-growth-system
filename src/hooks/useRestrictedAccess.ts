
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useRestrictedAccess = () => {
  const [financialPasswordSet, setFinancialPasswordSet] = useState(false);
  const [settingsPasswordSet, setSettingsPasswordSet] = useState(false);
  const [loading, setLoading] = useState(true);

  // Security: Default passwords removed for production security

  const checkPasswordStatus = async () => {
    try {
      const { data: financialSetting } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'financial_password_set')
        .single();

      const { data: settingsSetting } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'settings_password_set')
        .single();

      setFinancialPasswordSet(financialSetting?.value === 'true');
      setSettingsPasswordSet(settingsSetting?.value === 'true');
    } catch (error) {
      console.error('Error checking password status:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateFinancialPassword = (password: string): boolean => {
    // Security: Password validation moved to server-side
    console.warn('Client-side password validation deprecated for security');
    return false;
  };

  const validateSettingsPassword = (password: string): boolean => {
    // Security: Password validation moved to server-side
    console.warn('Client-side password validation deprecated for security');
    return false;
  };

  const setFinancialPasswordStatus = async (status: boolean) => {
    try {
      await supabase
        .from('settings')
        .upsert({ key: 'financial_password_set', value: status.toString() });
      setFinancialPasswordSet(status);
    } catch (error) {
      console.error('Error updating financial password status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da senha.",
        variant: "destructive",
      });
    }
  };

  const setSettingsPasswordStatus = async (status: boolean) => {
    try {
      await supabase
        .from('settings')
        .upsert({ key: 'settings_password_set', value: status.toString() });
      setSettingsPasswordSet(status);
    } catch (error) {
      console.error('Error updating settings password status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da senha.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkPasswordStatus();
  }, []);

  return {
    financialPasswordSet,
    settingsPasswordSet,
    loading,
    validateFinancialPassword,
    validateSettingsPassword,
    setFinancialPasswordStatus,
    setSettingsPasswordStatus,
    // Security: Default passwords removed from client-side code
  };
};
