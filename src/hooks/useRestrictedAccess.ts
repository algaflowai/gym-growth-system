
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useRestrictedAccess = () => {
  const [financialPasswordSet, setFinancialPasswordSet] = useState(false);
  const [settingsPasswordSet, setSettingsPasswordSet] = useState(false);
  const [loading, setLoading] = useState(true);

  // Senhas padrão - em produção, essas devem ser configuráveis pelo administrador
  const DEFAULT_FINANCIAL_PASSWORD = 'financeiro123';
  const DEFAULT_SETTINGS_PASSWORD = 'configuracao123';

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
    return password === DEFAULT_FINANCIAL_PASSWORD;
  };

  const validateSettingsPassword = (password: string): boolean => {
    return password === DEFAULT_SETTINGS_PASSWORD;
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
    defaultPasswords: {
      financial: DEFAULT_FINANCIAL_PASSWORD,
      settings: DEFAULT_SETTINGS_PASSWORD,
    },
  };
};
