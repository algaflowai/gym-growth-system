import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SystemSettings {
  gym_name: string;
  gym_email: string;
  gym_phone: string;
  gym_address: string;
}

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    gym_name: '',
    gym_email: '',
    gym_phone: '',
    gym_address: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['gym_name', 'gym_email', 'gym_phone', 'gym_address']);

      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }

      const settingsMap = data.reduce((acc, item) => {
        acc[item.key as keyof SystemSettings] = item.value || '';
        return acc;
      }, {} as SystemSettings);

      setSettings(settingsMap);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: SystemSettings): Promise<boolean> => {
    try {
      setLoading(true);

      const updates = Object.entries(newSettings).map(([key, value]) => ({
        key,
        value
      }));

      const { error } = await supabase
        .from('system_settings')
        .upsert(updates);

      if (error) {
        console.error('Error updating settings:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar as configurações.",
          variant: "destructive",
        });
        return false;
      }

      setSettings(newSettings);
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar configurações.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    updateSettings,
    loading,
    refetch: fetchSettings
  };
};