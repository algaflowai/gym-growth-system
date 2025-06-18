
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Plan } from '@/pages/Index';

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  // Plano fixo "Diária" que sempre existe
  const FIXED_DAILY_PLAN: Plan = {
    id: 'daily-fixed',
    name: 'Diária',
    price: 25,
    duration: 'day',
    active: true
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'plans');

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching plans:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os planos.",
          variant: "destructive",
        });
        return;
      }

      let savedPlans: Plan[] = [];
      if (data && data.length > 0) {
        try {
          savedPlans = JSON.parse(data[0].value || '[]');
        } catch (e) {
          console.error('Error parsing plans data:', e);
          savedPlans = [];
        }
      }

      // Sempre incluir o plano fixo "Diária" no início
      const allPlans = [FIXED_DAILY_PLAN, ...savedPlans];
      setPlans(allPlans);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar os planos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePlans = async (plansToSave: Plan[]) => {
    try {
      // Remove o plano fixo antes de salvar (ele sempre será adicionado automaticamente)
      const plansWithoutFixed = plansToSave.filter(p => p.id !== 'daily-fixed');
      
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'plans',
          value: JSON.stringify(plansWithoutFixed)
        });

      if (error) {
        console.error('Error saving plans:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar os planos.",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar os planos.",
        variant: "destructive",
      });
      return false;
    }
  };

  const addPlan = async (plan: Omit<Plan, 'id'>) => {
    const newPlan = { ...plan, id: Date.now().toString() };
    const updatedPlans = [...plans, newPlan];
    
    const success = await savePlans(updatedPlans);
    if (success) {
      setPlans(updatedPlans);
      toast({
        title: "Sucesso",
        description: `Plano ${plan.name} foi criado e estará disponível em todas as seleções.`,
      });
    }
    return success;
  };

  const updatePlan = async (id: string, updatedPlan: Partial<Plan>) => {
    // Impede a edição ou desativação do plano fixo "Diária"
    if (id === 'daily-fixed') {
      toast({
        title: "Ação não permitida",
        description: "O plano Diária é fixo e não pode ser modificado.",
        variant: "destructive",
      });
      return false;
    }

    const updatedPlans = plans.map(plan => 
      plan.id === id ? { ...plan, ...updatedPlan } : plan
    );
    
    const success = await savePlans(updatedPlans);
    if (success) {
      setPlans(updatedPlans);
      toast({
        title: "Sucesso",
        description: "Plano atualizado com sucesso.",
      });
    }
    return success;
  };

  const deletePlan = async (id: string) => {
    // Impede a exclusão do plano fixo "Diária"
    if (id === 'daily-fixed') {
      toast({
        title: "Ação não permitida",
        description: "O plano Diária é fixo e não pode ser excluído.",
        variant: "destructive",
      });
      return false;
    }

    const updatedPlans = plans.filter(plan => plan.id !== id);
    
    const success = await savePlans(updatedPlans);
    if (success) {
      setPlans(updatedPlans);
      toast({
        title: "Sucesso",
        description: "Plano excluído com sucesso.",
      });
    }
    return success;
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    loading,
    addPlan,
    updatePlan,
    deletePlan,
    fetchPlans
  };
};
