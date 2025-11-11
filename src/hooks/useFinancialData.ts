import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

export interface FinancialDashboard {
  cards: {
    receita_mensal: { valor: number; crescimento: number; cor: string };
    receita_total: { valor: number; tendencia: string };
    perdas_mensais: { valor: number; percentual: number; cor: string };
    assinaturas_ativas: { valor: number };
  };
  evolucao_financeira: Array<{ mes: string; receita: number }>;
  receitas_vs_perdas: Array<{ mes: string; receita: number; perdas: number }>;
  perdas_breakdown: Array<{ categoria: string; valor: number; percentual: number; cor: string }>;
  distribuicao_planos: Array<{ plano: string; assinantes: number; receita: number; cor: string }>;
  metricas_adicionais: {
    ticket_medio: number;
    taxa_retencao: number;
    novos_clientes_mes: number;
    taxa_perda: number;
  };
  metricas_parcelas?: {
    total_a_pagar: number;
    total_atrasado: number;
    total_pago_mes: number;
    parcelas_atrasadas: number;
    taxa_inadimplencia: number;
  };
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
        `https://wuuzmuxyiessejxsrzjl.supabase.co/functions/v1/get-financial-dashboard`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dXptdXh5aWVzc2VqeHNyempsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTI4ODQsImV4cCI6MjA2NTA2ODg4NH0.UfQg8NH5S7T5V8Ro7BEDLYYF-4t6y5AbGYjUZwcnpE8`
          },
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