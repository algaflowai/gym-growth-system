import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface FinancialData {
  monthlyRevenue: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activeSubscriptions: number;
  monthlyLosses: number;
  lossRate: number;
  evolutionData: Array<{ month: string; value: number }>;
  lossAnalysisData: Array<{ category: string; value: number; amount: number; color: string }>;
}

export const useFinancialData = () => {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      // Buscar matrículas ativas
      const { data: activeEnrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('status', 'active');

      if (enrollmentsError) throw enrollmentsError;

      // Buscar dados históricos dos últimos 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: enrollmentHistory, error: historyError } = await supabase
        .from('enrollment_history')
        .select('*')
        .gte('created_at', sixMonthsAgo.toISOString());

      if (historyError) throw historyError;

      // Calcular dados financeiros
      const activeSubscriptions = activeEnrollments?.length || 0;
      
      // Receita mensal atual (soma dos preços das matrículas ativas)
      const monthlyRevenue = activeEnrollments?.reduce((sum, enrollment) => sum + Number(enrollment.plan_price), 0) || 0;
      
      // Receita total (histórico completo)
      const { data: allHistory, error: allHistoryError } = await supabase
        .from('enrollment_history')
        .select('plan_price');

      if (allHistoryError) throw allHistoryError;
      
      const totalRevenue = (allHistory?.reduce((sum, record) => sum + Number(record.plan_price), 0) || 0) + monthlyRevenue;

      // Dados de evolução mensal (últimos 6 meses)
      const evolutionData = [];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = monthNames[date.getMonth()];
        
        // Calcular receita do mês específico
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthlyEnrollments = enrollmentHistory?.filter(enrollment => {
          const enrollmentDate = new Date(enrollment.created_at);
          return enrollmentDate >= monthStart && enrollmentDate <= monthEnd;
        }) || [];
        
        const monthlyValue = monthlyEnrollments.reduce((sum, enrollment) => sum + Number(enrollment.plan_price), 0);
        
        evolutionData.push({
          month: monthName,
          value: monthlyValue
        });
      }

      // Calcular crescimento mensal
      const currentMonth = evolutionData[evolutionData.length - 1]?.value || 0;
      const previousMonth = evolutionData[evolutionData.length - 2]?.value || 0;
      const monthlyGrowth = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;

      // Análise de perdas baseada no status dos registros históricos
      const inactiveEnrollments = enrollmentHistory?.filter(enrollment => 
        enrollment.status !== 'active' && enrollment.status !== 'expired'
      ) || [];

      const lossAnalysis = {
        'Inadimplência': inactiveEnrollments.filter(e => e.status === 'inactive').length,
        'Cancelamentos': inactiveEnrollments.filter(e => e.status === 'cancelled').length,
        'Transferências': inactiveEnrollments.filter(e => e.status === 'transferred').length,
        'Outros': inactiveEnrollments.filter(e => !['inactive', 'cancelled', 'transferred'].includes(e.status)).length,
      };

      const totalLosses = Object.values(lossAnalysis).reduce((sum, count) => sum + count, 0);
      const monthlyLosses = totalLosses > 0 ? (totalLosses * (monthlyRevenue / activeSubscriptions)) : 0;
      const lossRate = monthlyRevenue > 0 ? (monthlyLosses / monthlyRevenue) * 100 : 0;

      const lossAnalysisData = [
        { 
          category: 'Inadimplência', 
          value: totalLosses > 0 ? Math.round((lossAnalysis['Inadimplência'] / totalLosses) * 100) : 0,
          amount: Math.round((lossAnalysis['Inadimplência'] / Math.max(totalLosses, 1)) * monthlyLosses),
          color: '#dc2626' 
        },
        { 
          category: 'Cancelamentos', 
          value: totalLosses > 0 ? Math.round((lossAnalysis['Cancelamentos'] / totalLosses) * 100) : 0,
          amount: Math.round((lossAnalysis['Cancelamentos'] / Math.max(totalLosses, 1)) * monthlyLosses),
          color: '#f59e0b' 
        },
        { 
          category: 'Transferências', 
          value: totalLosses > 0 ? Math.round((lossAnalysis['Transferências'] / totalLosses) * 100) : 0,
          amount: Math.round((lossAnalysis['Transferências'] / Math.max(totalLosses, 1)) * monthlyLosses),
          color: '#3b82f6' 
        },
        { 
          category: 'Outros', 
          value: totalLosses > 0 ? Math.round((lossAnalysis['Outros'] / totalLosses) * 100) : 0,
          amount: Math.round((lossAnalysis['Outros'] / Math.max(totalLosses, 1)) * monthlyLosses),
          color: '#6b7280' 
        },
      ];

      setFinancialData({
        monthlyRevenue,
        totalRevenue,
        monthlyGrowth: Number(monthlyGrowth.toFixed(1)),
        activeSubscriptions,
        monthlyLosses: Math.round(monthlyLosses),
        lossRate: Number(lossRate.toFixed(1)),
        evolutionData,
        lossAnalysisData
      });

    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
      toast({
        title: "Erro ao carregar dados financeiros",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { financialData, loading, refetch: fetchFinancialData };
};