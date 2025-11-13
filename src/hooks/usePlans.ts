import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plan } from '@/pages/Index';
import { toast } from 'sonner';

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setPlans([]);
        return;
      }

      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedPlans: Plan[] = (data || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        price: Number(plan.price),
        duration: plan.duration,
        durationDays: plan.duration_days,
        active: plan.active
      }));

      setPlans(formattedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Erro ao carregar planos');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const addPlan = async (plan: Omit<Plan, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('plans')
        .insert([{ 
          user_id: user.id,
          name: plan.name,
          price: plan.price,
          duration: plan.duration,
          duration_days: plan.durationDays,
          active: plan.active
        }])
        .select()
        .single();

      if (error) throw error;

      const formattedPlan: Plan = {
        id: data.id,
        name: data.name,
        price: Number(data.price),
        duration: data.duration,
        durationDays: data.duration_days,
        active: data.active
      };

      setPlans(prev => [...prev, formattedPlan]);
      toast.success('Plano criado com sucesso');
      return formattedPlan;
    } catch (error) {
      console.error('Error adding plan:', error);
      toast.error('Erro ao criar plano');
      throw error;
    }
  };

  const updatePlan = async (id: string, updates: Partial<Plan>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.durationDays !== undefined) dbUpdates.duration_days = updates.durationDays;
      if (updates.active !== undefined) dbUpdates.active = updates.active;

      const { error } = await supabase
        .from('plans')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      toast.success('Plano atualizado com sucesso');
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Erro ao atualizar plano');
      throw error;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPlans(prev => prev.filter(p => p.id !== id));
      toast.success('Plano excluído com sucesso');
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Erro ao excluir plano');
      throw error;
    }
  };

  useEffect(() => {
    fetchPlans();

    const channel = supabase
      .channel('plans-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'plans'
        },
        () => {
          fetchPlans();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    plans,
    loading,
    addPlan,
    updatePlan,
    deletePlan,
    refetch: fetchPlans
  };
};
