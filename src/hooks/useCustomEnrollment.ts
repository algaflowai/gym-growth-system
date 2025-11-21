import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import dayjs from 'dayjs';

export type EnrollmentType = 'normal' | 'titular' | 'dependent';
export type CustomDuration = 'day' | 'month' | 'quarter' | 'semester' | 'year';

interface DependentData {
  studentId: string;
  studentName: string;
  price: number;
}

interface CreateCustomEnrollmentParams {
  studentId: string;
  studentName: string;
  enrollmentType: EnrollmentType;
  customDuration?: CustomDuration;
  customTitularPrice?: number;
  dependents?: DependentData[];
  isInstallmentPlan?: boolean;
  totalInstallments?: number;
  paymentDay?: number;
  startDate?: string;
}

export const useCustomEnrollment = () => {
  const [loading, setLoading] = useState(false);

  const calculateDurationDays = (duration: CustomDuration): number => {
    switch (duration) {
      case 'day': return 1;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'semester': return 180;
      case 'year': return 365;
      default: return 30;
    }
  };

  const calculateEndDate = (startDate: string, duration: CustomDuration): string => {
    const start = dayjs(startDate);
    const days = calculateDurationDays(duration);
    return start.add(days, 'day').format('YYYY-MM-DD');
  };

  const createCustomEnrollment = async (params: CreateCustomEnrollmentParams) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const {
        studentId,
        studentName,
        enrollmentType,
        customDuration,
        customTitularPrice,
        dependents = [],
        isInstallmentPlan = false,
        totalInstallments,
        paymentDay,
        startDate = dayjs().format('YYYY-MM-DD')
      } = params;

      // Calcular end_date baseado na duração customizada
      const endDate = customDuration 
        ? calculateEndDate(startDate, customDuration)
        : dayjs(startDate).add(30, 'day').format('YYYY-MM-DD');

      // Calcular preço total (titular + dependentes)
      const dependentsTotal = dependents.reduce((sum, dep) => sum + dep.price, 0);
      const totalPrice = (customTitularPrice || 0) + dependentsTotal;

      // Criar matrícula titular
      const enrollmentData: any = {
        user_id: user.id,
        student_id: studentId,
        plan_id: null, // NULL para planos customizados
        plan_name: customDuration 
          ? `Plano Customizado (${customDuration === 'day' ? 'Diária' : 
              customDuration === 'month' ? 'Mensal' : 
              customDuration === 'quarter' ? 'Trimestral' :
              customDuration === 'semester' ? 'Semestral' : 'Anual'})`
          : 'Plano Customizado',
        plan_price: totalPrice,
        titular_price: customTitularPrice,
        custom_plan_duration: customDuration,
        custom_titular_price: customTitularPrice,
        is_custom_plan: true,
        is_family_plan: dependents.length > 0,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        is_installment_plan: isInstallmentPlan,
        total_installments: isInstallmentPlan ? totalInstallments : null,
        payment_day: isInstallmentPlan ? paymentDay : null,
        installment_amount: isInstallmentPlan ? totalPrice / (totalInstallments || 1) : null
      };

      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert(enrollmentData)
        .select()
        .single();

      if (enrollmentError) throw enrollmentError;

      console.log('✅ Matrícula titular customizada criada:', enrollment.id);

      // Criar registros de dependentes se houver
      if (dependents.length > 0 && enrollment) {
        const dependentsRecords = dependents.map(dep => ({
          user_id: user.id,
          enrollment_id: enrollment.id,
          student_id: studentId, // ID do aluno titular
          dependent_student_id: dep.studentId,
          dependent_price: dep.price
        }));

        const { error: depsError } = await supabase
          .from('enrollment_dependents')
          .insert(dependentsRecords);

        if (depsError) {
          console.error('Erro ao criar dependentes:', depsError);
          throw depsError;
        }

        console.log(`✅ ${dependents.length} dependente(s) adicionado(s)`);
      }

      // Gerar parcelas se for parcelamento
      if (isInstallmentPlan && totalInstallments) {
        const { error: installmentsError } = await supabase.functions.invoke('generate-installments', {
          body: {
            enrollment_id: enrollment.id,
            user_id: user.id,
            student_id: studentId,
            total_amount: totalPrice,
            total_installments: totalInstallments,
            start_date: startDate,
            payment_day: paymentDay,
            is_family_plan: dependents.length > 0
          }
        });

        if (installmentsError) {
          console.error('Erro ao gerar parcelas:', installmentsError);
        } else {
          console.log(`✅ ${totalInstallments} parcelas geradas`);
        }
      }

      toast.success(`Matrícula customizada criada com sucesso! ${dependents.length > 0 ? `${dependents.length} dependente(s) adicionado(s).` : ''}`);
      return enrollment;
    } catch (error) {
      console.error('Erro ao criar matrícula customizada:', error);
      toast.error('Erro ao criar matrícula customizada');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const renewCustomEnrollment = async (enrollmentId: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Buscar matrícula atual com dependentes
      const { data: enrollment, error: fetchError } = await supabase
        .from('enrollments')
        .select('*, enrollment_dependents(*)')
        .eq('id', enrollmentId)
        .single();

      if (fetchError) throw fetchError;

      // Calcular nova data de início e fim
      const newStartDate = dayjs(enrollment.end_date).add(1, 'day').format('YYYY-MM-DD');
      const newEndDate = enrollment.custom_plan_duration
        ? calculateEndDate(newStartDate, enrollment.custom_plan_duration as CustomDuration)
        : dayjs(newStartDate).add(30, 'day').format('YYYY-MM-DD');

      // Calcular preço total mantendo valores customizados
      const customTitularPrice = enrollment.custom_titular_price || enrollment.titular_price;
      const dependentsTotal = enrollment.enrollment_dependents?.reduce(
        (sum: number, dep: any) => sum + Number(dep.dependent_price), 0
      ) || 0;
      const totalPrice = customTitularPrice + dependentsTotal;

      // Criar nova matrícula mantendo valores customizados
      const renewalData: any = {
        user_id: user.id,
        student_id: enrollment.student_id,
        plan_id: enrollment.plan_id,
        plan_name: enrollment.plan_name,
        plan_price: totalPrice,
        titular_price: customTitularPrice,
        custom_plan_duration: enrollment.custom_plan_duration,
        custom_titular_price: customTitularPrice, // Manter preço customizado
        is_custom_plan: enrollment.is_custom_plan,
        is_family_plan: enrollment.is_family_plan,
        start_date: newStartDate,
        end_date: newEndDate,
        status: 'active'
      };

      const { data: newEnrollment, error: renewError } = await supabase
        .from('enrollments')
        .insert(renewalData)
        .select()
        .single();

      if (renewError) throw renewError;

      // Recriar dependentes mantendo preços
      if (enrollment.enrollment_dependents && enrollment.enrollment_dependents.length > 0) {
        const dependentsRecords = enrollment.enrollment_dependents.map((dep: any) => ({
          user_id: user.id,
          enrollment_id: newEnrollment.id,
          student_id: enrollment.student_id,
          dependent_student_id: dep.dependent_student_id,
          dependent_price: dep.dependent_price // Manter preço do dependente
        }));

        const { error: depsError } = await supabase
          .from('enrollment_dependents')
          .insert(dependentsRecords);

        if (depsError) throw depsError;
      }

      // Arquivar matrícula antiga
      const { error: archiveError } = await supabase
        .from('enrollment_history')
        .insert({
          user_id: user.id,
          enrollment_id: enrollment.id,
          student_id: enrollment.student_id,
          plan_id: enrollment.plan_id || '',
          plan_name: enrollment.plan_name,
          plan_price: enrollment.plan_price,
          start_date: enrollment.start_date,
          end_date: enrollment.end_date,
          status: enrollment.status
        });

      if (archiveError) console.error('Erro ao arquivar matrícula:', archiveError);

      // Inativar matrícula antiga
      await supabase
        .from('enrollments')
        .update({ status: 'inactive' })
        .eq('id', enrollmentId);

      toast.success('Matrícula renovada mantendo valores customizados!');
      return newEnrollment;
    } catch (error) {
      console.error('Erro ao renovar matrícula:', error);
      toast.error('Erro ao renovar matrícula');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createCustomEnrollment,
    renewCustomEnrollment,
    calculateDurationDays,
    calculateEndDate
  };
};
