
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Student {
  id: string;
  name: string;
  phone: string;
  cpf: string;
  rg?: string;
  email: string;
  address?: string;
  city?: string;
  zip_code?: string;
  birth_date?: string;
  emergency_contact?: string;
  health_issues?: string;
  restrictions?: string;
  main_goal?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'deleted';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  user_id: string;
}

type StudentStatus = "active" | "inactive" | "deleted";

// Global state for students
let globalStudents: Student[] = [];
let globalLoading = true;
let subscribers: Array<() => void> = [];

const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};

const subscribe = (callback: () => void) => {
  subscribers.push(callback);
  return () => {
    subscribers = subscribers.filter(sub => sub !== callback);
  };
};

export const useGlobalStudents = () => {
  const [students, setStudents] = useState<Student[]>(globalStudents);
  const [loading, setLoading] = useState(globalLoading);

  const fetchStudents = useCallback(async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated');
        globalStudents = [];
        globalLoading = false;
        notifySubscribers();
        return;
      }

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .neq('status', 'deleted')
        .order('name');

      if (error) {
        console.error('Error fetching students:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os alunos.",
          variant: "destructive",
        });
        return;
      }

      const studentsData = (data || []).map((student: any) => ({
        ...student,
        status: student.status as StudentStatus,
      }));

      // Update global state
      globalStudents = studentsData;
      globalLoading = false;
      
      // Notify all subscribers
      notifySubscribers();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar os alunos.",
        variant: "destructive",
      });
    }
  }, []);

  const createStudent = useCallback(async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar um aluno.",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('students')
        .insert([{ ...studentData, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error creating student:', error);
        toast({
          title: "Erro",
          description: "Não foi possível criar o aluno.",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Sucesso",
        description: "Aluno criado com sucesso!",
      });

      await fetchStudents();
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar o aluno.",
        variant: "destructive",
      });
      return null;
    }
  }, [fetchStudents]);

  const updateStudent = useCallback(async (id: string, updates: Partial<Student>) => {
    try {
      const { error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating student:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o aluno.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Aluno atualizado com sucesso!",
      });

      await fetchStudents();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar o aluno.",
        variant: "destructive",
      });
      return false;
    }
  }, [fetchStudents]);

  const deleteStudent = useCallback(async (id: string) => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para excluir um aluno.",
          variant: "destructive",
        });
        return false;
      }

      // First check if student has any active enrollments
      const { data: activeEnrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', id)
        .in('status', ['active', 'expired']);

      if (enrollmentError) {
        console.error('Error checking enrollments:', enrollmentError);
        toast({
          title: "Erro",
          description: "Erro ao verificar matrículas do aluno.",
          variant: "destructive",
        });
        return false;
      }

      // If student has active or expired enrollments, move them to history first
      if (activeEnrollments && activeEnrollments.length > 0) {
        for (const enrollment of activeEnrollments) {
          // Get full enrollment data
          const { data: fullEnrollment, error: getError } = await supabase
            .from('enrollments')
            .select('*')
            .eq('id', enrollment.id)
            .single();

          if (!getError && fullEnrollment) {
            // Save to history
            const { error: historyError } = await supabase
              .from('enrollment_history')
              .insert([{
                enrollment_id: fullEnrollment.id,
                student_id: fullEnrollment.student_id,
                plan_id: fullEnrollment.plan_id,
                plan_name: fullEnrollment.plan_name,
                plan_price: fullEnrollment.plan_price,
                start_date: fullEnrollment.start_date,
                end_date: fullEnrollment.end_date,
                status: fullEnrollment.status,
                user_id: user.id
              }]);

            if (historyError) {
              console.error('Error creating enrollment history:', historyError);
            }

            // Delete the enrollment
            const { error: deleteEnrollmentError } = await supabase
              .from('enrollments')
              .delete()
              .eq('id', enrollment.id);

            if (deleteEnrollmentError) {
              console.error('Error deleting enrollment:', deleteEnrollmentError);
            }
          }
        }
      }

      // Now delete the student by marking as deleted
      const { error } = await supabase
        .from('students')
        .update({ 
          status: 'deleted', 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) {
        console.error('Error deleting student:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o aluno.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Aluno excluído com sucesso!",
      });

      await fetchStudents();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao excluir o aluno.",
        variant: "destructive",
      });
      return false;
    }
  }, [fetchStudents]);

  // Subscribe to global state changes
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setStudents([...globalStudents]);
      setLoading(globalLoading);
    });

    // Initial fetch if not loaded yet
    if (globalLoading) {
      fetchStudents();
    } else {
      setStudents([...globalStudents]);
      setLoading(false);
    }

    return unsubscribe;
  }, [fetchStudents]);

  return {
    students,
    loading,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  };
};
