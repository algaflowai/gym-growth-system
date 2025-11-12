import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Student } from './useStudents';
import dayjs, { BRAZIL_TZ } from '@/lib/dayjs';

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
  user_id: string;
  student?: Student;
}

// Defina o tipo de status esperado para matrículas
type EnrollmentStatus = "active" | "inactive" | "expired";

export const useEnrollments = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para calcular duração em dias baseada no tipo do plano
  const calculateDurationInDays = (duration: string): number => {
    switch (duration.toLowerCase()) {
      case 'diária':
      case 'daily':
      case 'day':
        return 1; // Plano diário vence em 24 horas (1 dia)
      case 'mensal':
      case 'monthly':
      case 'month':
        return 30;
      case 'trimestral':
      case 'quarterly':
      case 'quarter':
        return 90;
      case 'semestral':
      case 'semester':
        return 180;
      case 'anual':
      case 'yearly':
      case 'year':
        return 365;
      default:
        return 30;
    }
  };

  // Função para atualizar status automaticamente baseado na data
  const updateExpiredEnrollments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = dayjs.tz(new Date(), BRAZIL_TZ).format('YYYY-MM-DD');
      
      // First mark expired enrollments only for the current user
      const { error: expiredError } = await supabase
        .from('enrollments')
        .update({ status: 'expired' })
        .lt('end_date', today)
        .eq('status', 'active')
        .eq('user_id', user.id);

      if (expiredError) {
        console.error('Error updating expired enrollments:', expiredError);
      }

      // Then inactivate enrollments that have been expired for more than 7 days (handled by RPC)
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
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated');
        setEnrollments([]);
        setLoading(false);
        return;
      }

      // Primeiro atualiza matrículas expiradas e inativa as antigas
      await updateExpiredEnrollments();

      // Fetch all enrollments (active, inactive, and expired) for current user
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          student:students(*)
        `)
        .in('status', ['active', 'inactive', 'expired']) // Show all statuses
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('🔍 [useEnrollments] Matrículas buscadas:', data?.length || 0);
      console.log('📋 [useEnrollments] Dados completos:', data);
      console.log('❌ [useEnrollments] Erro:', error);

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

  const createEnrollment = async (
    enrollmentData: Omit<Enrollment, 'id' | 'created_at' | 'updated_at' | 'student' | 'user_id'>,
    isInstallmentPlan = false,
    installmentConfig?: { total_installments: number; payment_day: number }
  ) => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar uma matrícula.",
          variant: "destructive",
        });
        return null;
      }

      // Primeiro, verificar se o aluno já tem uma matrícula ativa
      const { data: existingEnrollments, error: checkError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', enrollmentData.student_id)
        .eq('status', 'active')
        .eq('user_id', user.id);

      if (checkError) {
        console.error('Error checking existing enrollments:', checkError);
        toast({
          title: "Erro",
          description: "Erro ao verificar matrículas existentes.",
          variant: "destructive",
        });
        return null;
      }

      // Se já existe uma matrícula ativa, salvar no histórico e excluir
      if (existingEnrollments && existingEnrollments.length > 0) {
        for (const enrollment of existingEnrollments) {
          // Salva no histórico
          const { error: historyError } = await supabase
            .from('enrollment_history')
            .insert([{
              enrollment_id: enrollment.id,
              student_id: enrollment.student_id,
              plan_id: enrollment.plan_id,
              plan_name: enrollment.plan_name,
              plan_price: enrollment.plan_price,
              start_date: enrollment.start_date,
              end_date: enrollment.end_date,
              status: enrollment.status,
              user_id: user.id
            }]);

          if (historyError) {
            console.error('Error creating enrollment history:', historyError);
          }

          // Exclui a matrícula anterior
          const { error: deleteError } = await supabase
            .from('enrollments')
            .delete()
            .eq('id', enrollment.id)
            .eq('user_id', user.id);

          if (deleteError) {
            console.error('Error deleting existing enrollment:', deleteError);
          }
        }
      }

      // Se datas personalizadas foram fornecidas, usar elas; senão calcular baseado no plano
      let startDate: string;
      let endDate: string;

      if (enrollmentData.start_date && enrollmentData.end_date) {
        // Datas personalizadas fornecidas - apenas normalizar no timezone do Brasil
        startDate = dayjs.tz(enrollmentData.start_date, BRAZIL_TZ).format('YYYY-MM-DD');
        endDate = dayjs.tz(enrollmentData.end_date, BRAZIL_TZ).format('YYYY-MM-DD');
      } else {
        // Calcular datas automaticamente baseado no plano
        const start = dayjs.tz(new Date(), BRAZIL_TZ).startOf('day');
        startDate = start.format('YYYY-MM-DD');
        
        const durationInDays = calculateDurationInDays(enrollmentData.plan_name || enrollmentData.plan_id);
        
        if (durationInDays === 1 && (enrollmentData.plan_name?.toLowerCase().includes('diária') || 
                                     enrollmentData.plan_name?.toLowerCase().includes('daily') || 
                                     enrollmentData.plan_id?.toLowerCase().includes('day'))) {
          // Para plano diário, data de vencimento = data de início + 1 dia
          endDate = dayjs.tz(startDate, BRAZIL_TZ).add(1, 'day').format('YYYY-MM-DD');
        } else {
          // Para outros planos, adicionar duração ao início
          endDate = dayjs.tz(startDate, BRAZIL_TZ).add(durationInDays, 'day').format('YYYY-MM-DD');
        }
      }

      const correctedEnrollmentData = {
        ...enrollmentData,
        start_date: startDate,
        end_date: endDate,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('enrollments')
        .insert([correctedEnrollmentData])
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

      // Se for plano parcelado, gerar parcelas
      if (isInstallmentPlan && installmentConfig && data) {
        console.log('Gerando parcelas para a matrícula:', data.id);
        const { error: installmentsError } = await supabase.functions.invoke('generate-installments', {
          body: {
            enrollment_id: data.id,
            user_id: user.id,
            student_id: data.student_id,
            total_amount: data.plan_price,
            total_installments: installmentConfig.total_installments,
            start_date: data.start_date,
            payment_day: installmentConfig.payment_day
          }
        });

        if (installmentsError) {
          console.error('Erro ao gerar parcelas:', installmentsError);
          toast({
            title: "Aviso",
            description: "Matrícula criada, mas houve erro ao gerar parcelas.",
            variant: "destructive",
          });
        } else {
          // Atualizar enrollment com flag de parcelado
          await supabase
            .from('enrollments')
            .update({
              is_installment_plan: true,
              total_installments: installmentConfig.total_installments,
              installment_amount: data.plan_price / installmentConfig.total_installments,
              payment_day: installmentConfig.payment_day
            })
            .eq('id', data.id);
          
          console.log('Parcelas geradas com sucesso');
        }
      }

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

  const reactivateStudent = async (
    studentId: string,
    planId: string,
    planName: string,
    titularPrice: number,
    planDuration: string,
    dependents?: Array<{ dependent_student_id: string; dependent_price: number }>,
    totalPrice?: number
  ) => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para reativar um aluno.",
          variant: "destructive",
        });
        return false;
      }

      // Calcula as novas datas - sempre iniciando hoje no timezone brasileiro
      const start = dayjs.tz(new Date(), BRAZIL_TZ).startOf('day');
      const startDate = start.toDate();

      const durationInDays = calculateDurationInDays(planDuration);
      let endDate;

      if (durationInDays === 1 && (planDuration.toLowerCase().includes('diária') || 
                                   planDuration.toLowerCase().includes('daily') || 
                                   planDuration.toLowerCase().includes('day'))) {
        // Para plano diário, data de vencimento = data de início + 1 dia
        const expires = start.add(1, 'day').endOf('day');
        endDate = expires.toDate();
      } else {
        // Para outros planos, adiciona os dias de duração
        const expires = start.add(durationInDays, 'day').endOf('day');
        endDate = expires.toDate();
      }

      // Buscar a matrícula inativa existente do aluno
      const { data: inactiveEnrollment, error: fetchError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', studentId)
        .eq('user_id', user.id)
        .eq('status', 'inactive')
        .single();

      if (fetchError || !inactiveEnrollment) {
        console.error('Matrícula inativa não encontrada:', fetchError);
        toast({
          title: "Erro",
          description: "Não foi possível encontrar a matrícula inativa do aluno.",
          variant: "destructive",
        });
        return false;
      }

      // Calcular valores finais
      const isFamilyPlan = dependents && dependents.length > 0;
      const finalPrice = totalPrice || titularPrice;

      // Atualizar a matrícula existente com titular_price
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({
          plan_id: planId,
          plan_name: planName,
          titular_price: titularPrice, // Atualiza apenas titular
          plan_price: finalPrice, // Preço total calculado
          is_family_plan: isFamilyPlan,
          start_date: dayjs.tz(startDate, BRAZIL_TZ).format('YYYY-MM-DD'),
          end_date: dayjs.tz(endDate, BRAZIL_TZ).format('YYYY-MM-DD'),
          status: 'active' as EnrollmentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', inactiveEnrollment.id)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating enrollment:', updateError);
        toast({
          title: "Erro",
          description: "Não foi possível reativar o aluno.",
          variant: "destructive",
        });
        return false;
      }

      // Limpar dependentes antigos
      await supabase
        .from('enrollment_dependents')
        .delete()
        .eq('enrollment_id', inactiveEnrollment.id);

      // Recriar dependentes selecionados
      if (dependents && dependents.length > 0) {
        const dependentsData = dependents.map(dep => ({
          enrollment_id: inactiveEnrollment.id,
          student_id: studentId,
          dependent_student_id: dep.dependent_student_id,
          dependent_price: dep.dependent_price,
          user_id: user.id
        }));

        const { error: depsError } = await supabase
          .from('enrollment_dependents')
          .insert(dependentsData);

        if (depsError) {
          console.error('Error inserting dependents:', depsError);
          // Continuar mesmo se houver erro nos dependentes
        }
      }

      // Atualizar status do aluno para ativo
      const { error: studentUpdateError } = await supabase
        .from('students')
        .update({ status: 'active' })
        .eq('id', studentId)
        .eq('user_id', user.id);

      if (studentUpdateError) {
        console.error('Error updating student status:', studentUpdateError);
        toast({
          title: "Aviso",
          description: "Aluno reativado, mas houve erro ao atualizar o status.",
          variant: "destructive",
        });
      }

      toast({
        title: "Sucesso",
        description: "Aluno reativado com sucesso!",
      });

      await fetchEnrollments();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao reativar o aluno.",
        variant: "destructive",
      });
      return false;
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
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para renovar uma matrícula.",
          variant: "destructive",
        });
        return false;
      }

      // Busca a matrícula atual
      const { data: currentEnrollment, error: fetchError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('id', currentEnrollmentId)
        .eq('user_id', user.id)
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
          status: currentEnrollment.status,
          user_id: user.id
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

      // Calcula as novas datas - sempre iniciando hoje no timezone brasileiro
      const start = dayjs.tz(new Date(), BRAZIL_TZ).startOf('day');
      const startDate = start.toDate();

      const durationInDays = calculateDurationInDays(planDuration);
      let endDate;

      if (durationInDays === 1 && (planDuration.toLowerCase().includes('diária') || 
                                   planDuration.toLowerCase().includes('daily') || 
                                   planDuration.toLowerCase().includes('day'))) {
        // Para plano diário, data de vencimento = data de início + 1 dia
        const expires = start.add(1, 'day').endOf('day');
        endDate = expires.toDate();
      } else {
        // Para outros planos, adiciona os dias de duração
        const expires = start.add(durationInDays, 'day').endOf('day');
        endDate = expires.toDate();
      }

      // Atualiza a matrícula existente com o novo plano
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({
          plan_id: planId,
          plan_name: planName,
          plan_price: planPrice,
          start_date: dayjs.tz(startDate, BRAZIL_TZ).format('YYYY-MM-DD'),
          end_date: dayjs.tz(endDate, BRAZIL_TZ).format('YYYY-MM-DD'),
          status: 'active' as EnrollmentStatus
        })
        .eq('id', currentEnrollmentId)
        .eq('user_id', user.id);

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
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para atualizar uma matrícula.",
          variant: "destructive",
        });
        return false;
      }

      console.log(`Atualizando matrícula ${id} para usuário ${user.id}`);

      const { error } = await supabase
        .from('enrollments')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id); // Garantir que só atualiza se pertencer ao usuário

      if (error) {
        console.error('Error updating enrollment:', error);
        toast({
          title: "Erro",
          description: `Não foi possível atualizar a matrícula: ${error.message}`,
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
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro de Autenticação",
          description: "Você precisa estar logado para excluir uma matrícula.",
          variant: "destructive",
        });
        return false;
      }

      console.log(`Tentando excluir matrícula ${id} para usuário ${user.id}`);

      // Busca a matrícula antes de excluir para salvar no histórico e verificar se pertence ao usuário
      const { data: enrollment, error: fetchError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id) // Garantir que só busca se pertencer ao usuário
        .single();

      if (fetchError) {
        console.error('Error fetching enrollment for deletion:', fetchError);
        if (fetchError.code === 'PGRST116') {
          toast({
            title: "Erro de Acesso",
            description: "Matrícula não encontrada ou você não tem permissão para excluí-la.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro",
            description: `Erro ao buscar matrícula: ${fetchError.message}`,
            variant: "destructive",
          });
        }
        return false;
      }

      if (!enrollment) {
        toast({
          title: "Erro",
          description: "Matrícula não encontrada ou você não tem permissão para excluí-la.",
          variant: "destructive",
        });
        return false;
      }

      console.log(`Matrícula encontrada, salvando no histórico...`);

      // Salva no histórico antes de excluir
      const { error: historyError } = await supabase
        .from('enrollment_history')
        .insert([{
          enrollment_id: enrollment.id,
          student_id: enrollment.student_id,
          plan_id: enrollment.plan_id,
          plan_name: enrollment.plan_name,
          plan_price: enrollment.plan_price,
          start_date: enrollment.start_date,
          end_date: enrollment.end_date,
          status: enrollment.status,
          user_id: user.id
        }]);

      if (historyError) {
        console.error('Error creating enrollment history:', historyError);
        toast({
          title: "Aviso",
          description: "Não foi possível salvar no histórico, mas a exclusão continuará.",
          variant: "destructive",
        });
      } else {
        console.log('Histórico salvo com sucesso');
      }

      console.log(`Excluindo matrícula ${id}...`);

      // Exclui a matrícula (RLS garante que só pode excluir se user_id = auth.uid())
      const { error: deleteError } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting enrollment:', deleteError);
        toast({
          title: "Erro na Exclusão",
          description: `Não foi possível excluir a matrícula: ${deleteError.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log(`Exclusão realizada com sucesso para a matrícula ${id}`);

      toast({
        title: "Sucesso",
        description: "Matrícula excluída com sucesso!",
      });

      await fetchEnrollments();
      return true;
    } catch (error: any) {
      console.error('Unexpected error during deletion:', error);
      toast({
        title: "Erro Inesperado",
        description: `Erro inesperado ao excluir a matrícula: ${error?.message || 'Erro desconhecido'}`,
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
    reactivateStudent,
    updateEnrollment,
    deleteEnrollment,
  };
};
