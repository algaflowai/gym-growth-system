
import { supabase } from '@/integrations/supabase/client';
import { Enrollment } from '@/hooks/useEnrollments';

export const fetchEnrollmentsFromDB = async () => {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      student:students(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching enrollments: ${error.message}`);
  }

  return data || [];
};

export const createEnrollmentInDB = async (enrollmentData: Omit<Enrollment, 'id' | 'created_at' | 'updated_at' | 'student'>) => {
  const { data, error } = await supabase
    .from('enrollments')
    .insert([enrollmentData])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating enrollment: ${error.message}`);
  }

  return data;
};

export const updateEnrollmentInDB = async (id: string, updates: Partial<Enrollment>) => {
  const { error } = await supabase
    .from('enrollments')
    .update(updates)
    .eq('id', id);

  if (error) {
    throw new Error(`Error updating enrollment: ${error.message}`);
  }

  return true;
};

export const deleteEnrollmentFromDB = async (id: string) => {
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting enrollment: ${error.message}`);
  }

  return true;
};

export const fetchEnrollmentById = async (id: string) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error fetching enrollment: ${error.message}`);
  }

  return data;
};

export const updateExpiredEnrollmentsInDB = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  const { error } = await supabase
    .from('enrollments')
    .update({ status: 'expired' })
    .lt('end_date', today)
    .eq('status', 'active');

  if (error) {
    throw new Error(`Error updating expired enrollments: ${error.message}`);
  }
};
