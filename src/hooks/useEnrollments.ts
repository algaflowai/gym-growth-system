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
        return 1;
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
      
      const { error } = await supabase
        .from('enrollments')
        .update({ status: 'expired' })
        .lt('end_date', today)
        .eq('status', 'active');

      if (error) {
        console.error('Error updating expired enrollments:', error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      // Primeiro atualiza matrículas expiradas
      await updateExpiredEnrollments();

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          student:students(*)
        `)
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

      // Calcula as novas datas
      const currentDate = new Date();
      const enrollmentEndDate = new Date(currentEnrollment.end_date);
      
      // Se o plano já expirou, usa a data atual. Senão, usa o dia seguinte ao término
      const startDate = enrollmentEndDate < currentDate 
        ? currentDate 
        : new Date(enrollmentEndDate.getTime() + 24 * 60 * 60 * 1000);

      const durationInDays = calculateDurationInDays(planDuration);
      const endDate = new Date(startDate.getTime() + (durationInDays * 24 * 60 * 60 * 1000));

      // Primeiro, marca a matrícula atual como inativa
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({ status: 'inactive' })
        .eq('id', currentEnrollmentId);

      if (updateError) {
        console.error('Error updating current enrollment:', updateError);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a matrícula atual.",
          variant: "destructive",
        });
        return false;
      }

      // Cria a nova matrícula (renovação)
      const newEnrollmentData = {
        student_id: currentEnrollment.student_id,
        plan_id: planId,
        plan_name: planName,
        plan_price: planPrice,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active' as EnrollmentStatus
      };

      const { error: createError } = await supabase
        .from('enrollments')
        .insert([newEnrollmentData]);

      if (createError) {
        console.error('Error creating new enrollment:', createError);
        // Reverte a mudança na matrícula atual em caso de erro
        await supabase
          .from('enrollments')
          .update({ status: currentEnrollment.status })
          .eq('id', currentEnrollmentId);
        
        toast({
          title: "Erro",
          description: "Não foi possível criar a nova matrícula.",
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
