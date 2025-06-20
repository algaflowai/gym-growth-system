import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Student } from './useStudents';

export interface Enrollment {
  id: string;
  student_id: string;
  plan_id: string;
  plan_name: string;
  plan_price: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
  updated_at: string;
  student?: Student;
}

// Defina o tipo de status esperado para matrículas
type EnrollmentStatus = "active" | "inactive" | "expired";

export const useEnrollments = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para calcular duração em dias baseada no tipo do plano
  const calculateDurationInDays = (duration: string): number => {
    switch (duration) {
      case 'day':
        return 1; // Plano diário é válido por 1 dia (vence no mesmo dia)
      case 'month':
        return 30;
      case 'quarter':
        return 90;
      case 'semester':
        return 180;
      case 'year':
        return 365;
      default:
        return 30;
    }
  };

  // Função para atualizar status automaticamente baseado na data
  const updateExpiredEnrollments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // First mark expired enrollments
      const { error: expiredError } = await supabase
        .from('enrollments')
        .update({ status: 'expired' })
        .lt('end_date', today)
        .eq('status', 'active');

      if (expiredError) {
        console.error('Error updating expired enrollments:', expiredError);
      }

      // Then inactivate enrollments that have been expired for more than 5 days
      const { error: inactivateError } = await supabase
        .rpc('inactivate_expired_enrollments');

      if (inactivateError) {
        console.error('Error inactivating expired enrollments:', inactivateError);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      // Primeiro atualiza matrículas expiradas e inativa as antigas
      await updateExpiredEnrollments();

      // Fetch only active and expired enrollments (hide inactive ones)
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          student:students(*)
        `)
        .in('status', ['active', 'expired']) // Only show active and expired enrollments
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching enrollments:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as matrículas.",
          variant: "destructive",
        });
        return;
      }

      // Mapeia os dados convertendo explicitamente o status
      const enrollmentsData = (data || []).map((enrollment: any) => ({
        ...enrollment,
        status: enrollment.status as EnrollmentStatus,
      }));

      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar as matrículas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createEnrollment = async (enrollmentData: Omit<Enrollment, 'id' | 'created_at' | 'updated_at' | 'student'>) => {
    try {
      // Primeiro, verificar se o aluno já tem uma matrícula ativa
      const { data: existingEnrollments, error: checkError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', enrollmentData.student_id)
        .eq('status', 'active');

      if (checkError) {
        console.error('Error checking existing enrollments:', checkError);
        toast({
          title: "Erro",
          description: "Erro ao verificar matrículas existentes.",
          variant: "destructive",
        });
        return null;
      }

      // Se já existe uma matrícula ativa, inativar ela primeiro
      if (existingEnrollments && existingEnrollments.length > 0) {
        const { error: updateError } = await supabase
          .from('enrollments')
          .update({ status: 'inactive' })
          .eq('student_id', enrollmentData.student_id)
          .eq('status', 'active');

        if (updateError) {
          console.error('Error inactivating existing enrollment:', updateError);
          toast({
            title: "Erro",
            description: "Erro ao inativar matrícula anterior.",
            variant: "destructive",
          });
          return null;
        }
      }

      const { data, error } = await supabase
        .from('enrollments')
        .insert([enrollmentData])
        .select()
        .single();

      if (error) {
        console.error('Error creating enrollment:', error);
        toast({
          title: "Erro",
          description: "Não foi possível criar a matrícula.",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Sucesso",
        description: "Matrícula criada com sucesso!",
      });

      await fetchEnrollments();
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar a matrícula.",
        variant: "destructive",
      });
      return null;
    }
  };

  const renewEnrollment = async (
    currentEnrollmentId: string,
    planId: string,
    planName: string,
    planPrice: number,
    planDuration: string
  ) => {
    try {
      // Busca a matrícula atual
      const { data: currentEnrollment, error: fetchError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('id', currentEnrollmentId)
        .single();

      if (fetchError || !currentEnrollment) {
        console.error('Error fetching current enrollment:', fetchError);
        toast({
          title: "Erro",
          description: "Não foi possível encontrar a matrícula atual.",
          variant: "destructive",
        });
        return false;
      }

      // Primeiro, inativar qualquer matrícula ativa existente do mesmo aluno
      const { error: inactivateError } = await supabase
        .from('enrollments')
        .update({ status: 'inactive' })
        .eq('student_id', currentEnrollment.student_id)
        .eq('status', 'active');

      if (inactivateError) {
        console.error('Error inactivating existing enrollments:', inactivateError);
        toast({
          title: "Erro",
          description: "Erro ao inativar matrículas anteriores.",
          variant: "destructive",
        });
        return false;
      }

      // Calcula as novas datas - sempre iniciando hoje
      const today = new Date();
      const startDate = today;

      const durationInDays = calculateDurationInDays(planDuration);
      let endDate;

      if (planDuration === 'day') {
        // Para plano diário, vence no mesmo dia
        endDate = new Date(startDate);
      } else {
        // Para outros planos, adiciona os dias de duração
        endDate = new Date(startDate.getTime() + (durationInDays * 24 * 60 * 60 * 1000));
      }

      // Salva o histórico da matrícula atual
      const { error: historyError } = await supabase
        .from('enrollment_history')
        .insert([{
          enrollment_id: currentEnrollment.id,
          student_id: currentEnrollment.student_id,
          plan_id: currentEnrollment.plan_id,
          plan_name: currentEnrollment.plan_name,
          plan_price: currentEnrollment.plan_price,
          start_date: currentEnrollment.start_date,
          end_date: currentEnrollment.end_date,
          status: currentEnrollment.status
        }]);

      if (historyError) {
        console.error('Error creating enrollment history:', historyError);
        toast({
          title: "Erro",
          description: "Erro ao salvar histórico da matrícula.",
          variant: "destructive",
        });
        return false;
      }

      // Atualiza a matrícula existente com o novo plano
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({
          plan_id: planId,
          plan_name: planName,
          plan_price: planPrice,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active' as EnrollmentStatus
        })
        .eq('id', currentEnrollmentId);

      if (updateError) {
        console.error('Error updating enrollment:', updateError);
        toast({
          title: "Erro",
          description: "Não foi possível renovar a matrícula.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Plano renovado com sucesso!",
      });

      await fetchEnrollments();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao renovar o plano.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateEnrollment = async (id: string, updates: Partial<Enrollment>) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating enrollment:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a matrícula.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Matrícula atualizada com sucesso!",
      });

      await fetchEnrollments();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar a matrícula.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteEnrollment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting enrollment:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a matrícula.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Matrícula excluída com sucesso!",
      });

      await fetchEnrollments();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao excluir a matrícula.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  return {
    enrollments,
    loading,
    fetchEnrollments,
    createEnrollment,
    renewEnrollment,
    updateEnrollment,
    deleteEnrollment,
  };
};
