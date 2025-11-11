import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Installment {
  id: string;
  enrollment_id: string;
  student_id: string;
  installment_number: number;
  total_installments: number;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: 'pending' | 'paid' | 'overdue';
  payment_method?: string;
  notes?: string;
  is_family_plan?: boolean;
  student?: {
    id: string;
    name: string;
    cpf: string;
  };
}

export const useInstallments = () => {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchInstallments = async (enrollmentId?: string, studentId?: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('payment_installments')
        .select('*, student:students(id, name, cpf)')
        .eq('user_id', user.id);

      if (enrollmentId) query = query.eq('enrollment_id', enrollmentId);
      if (studentId) query = query.eq('student_id', studentId);

      const { data, error } = await query.order('due_date', { ascending: true });

      if (error) throw error;
      
      const typedData = (data || []) as Installment[];
      setInstallments(typedData);
      return typedData;
    } catch (error) {
      console.error('Erro ao buscar parcelas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as parcelas.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (installmentId: string, paymentMethod: string, notes?: string) => {
    try {
      const { data: installment, error: fetchError } = await supabase
        .from('payment_installments')
        .select('enrollment_id, student_id')
        .eq('id', installmentId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('payment_installments')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0],
          payment_method: paymentMethod,
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', installmentId);

      if (error) throw error;

      // Verificar se há parcelas atrasadas restantes
      const { data: overdueInstallments } = await supabase
        .from('payment_installments')
        .select('id')
        .eq('enrollment_id', installment.enrollment_id)
        .eq('status', 'overdue');

      // Se não houver mais parcelas atrasadas, reativar matrícula
      if (!overdueInstallments || overdueInstallments.length === 0) {
        await supabase
          .from('enrollments')
          .update({ status: 'active' })
          .eq('id', installment.enrollment_id);

        await supabase
          .from('students')
          .update({ status: 'active' })
          .eq('id', installment.student_id);

        toast({
          title: "Sucesso!",
          description: "Pagamento confirmado e matrícula reativada!",
        });
      } else {
        toast({
          title: "Sucesso!",
          description: "Pagamento confirmado!",
        });
      }

      await fetchInstallments(installment.enrollment_id);
      return true;
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      toast({
        title: "Erro",
        description: "Não foi possível confirmar o pagamento.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    installments,
    loading,
    fetchInstallments,
    markAsPaid,
  };
};
