import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

export interface FinancialDashboard {
  cards: any;
  evolucao_financeira: any;
  receitas_vs_perdas: any;
  perdas_breakdown: any;
  distribuicao_planos: any;
  metricas_adicionais: any;
}

export const useFinancialData = (academia_id: string, user_id: string) => {
  const [financialData, setFinancialData] = useState<FinancialDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (academia_id && user_id) fetchFinancialData();
    // eslint-disable-next-line
  }, [academia_id, user_id]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/get-financial-dashboard`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ academia_id, user_id }),
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setFinancialData(data);
    } catch (error: any) {
      console.error('Erro ao buscar dados financeiros:', error);
      toast({
        title: 'Erro ao carregar dados financeiros',
        description: error.message || 'Verifique sua conexão e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return { financialData, loading, refetch: fetchFinancialData };
};