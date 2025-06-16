
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

  const createStudent = useCallback(async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([studentData])
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
      const { error } = await supabase
        .from('students')
        .update({ status: 'deleted', deleted_at: new Date().toISOString() })
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
