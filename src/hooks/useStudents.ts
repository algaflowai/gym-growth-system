
import { useState, useEffect } from 'react';
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
  gender?: string; // Novo campo para gênero
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

// Defina o tipo de status esperado para alunos
type StudentStatus = "active" | "inactive" | "deleted";

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated');
        setStudents([]);
        setLoading(false);
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

      // Mapeia os dados convertendo explicitamente o status
      const studentsData = (data || []).map((student: any) => ({
        ...student,
        status: student.status as StudentStatus,
      }));

      setStudents(studentsData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar os alunos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
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
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
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
  };

  const deleteStudent = async (id: string) => {
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
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  };
};
