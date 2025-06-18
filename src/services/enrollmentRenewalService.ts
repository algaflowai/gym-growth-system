
import { supabase } from '@/integrations/supabase/client';
import { fetchEnrollmentById, updateEnrollmentInDB } from './enrollmentService';
import { calculateRenewalDates } from '@/utils/enrollmentUtils';

type EnrollmentStatus = "active" | "inactive" | "expired";

export const renewEnrollmentService = async (
  currentEnrollmentId: string,
  planId: string,
  planName: string,
  planPrice: number,
  planDuration: string
) => {
  // Busca a matrícula atual
  const currentEnrollment = await fetchEnrollmentById(currentEnrollmentId);

  // Calcula as novas datas
  const { startDate, endDate } = calculateRenewalDates(currentEnrollment.end_date, planDuration);

  // Primeiro, marca a matrícula atual como inativa
  await updateEnrollmentInDB(currentEnrollmentId, { status: 'inactive' });

  // Cria a nova matrícula (renovação)
  const newEnrollmentData = {
    student_id: currentEnrollment.student_id,
    plan_id: planId,
    plan_name: planName,
    plan_price: planPrice,
    start_date: startDate,
    end_date: endDate,
    status: 'active' as EnrollmentStatus
  };

  const { error: createError } = await supabase
    .from('enrollments')
    .insert([newEnrollmentData]);

  if (createError) {
    // Reverte a mudança na matrícula atual em caso de erro
    await updateEnrollmentInDB(currentEnrollmentId, { status: currentEnrollment.status });
    throw new Error(`Error creating new enrollment: ${createError.message}`);
  }

  return true;
};
