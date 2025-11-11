import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

export interface EnrollmentDependent {
  id: string;
  enrollment_id: string;
  student_id: string;
  dependent_student_id: string;
  dependent_price: number;
  created_at: string;
  updated_at: string;
}

// Schema de validação
const dependentSchema = z.object({
  enrollment_id: z.string().uuid(),
  student_id: z.string().uuid(),
  dependent_student_id: z.string().uuid(),
  dependent_price: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
});

export const useEnrollmentDependents = (enrollmentId?: string) => {
  const [dependents, setDependents] = useState<EnrollmentDependent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDependents = async (id: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('enrollment_dependents')
        .select('*')
        .eq('enrollment_id', id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching dependents:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dependentes",
          variant: "destructive",
        });
        return;
      }

      setDependents(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dependentes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addDependent = async (
    enrollmentId: string,
    studentId: string,
    dependentStudentId: string,
    dependentPrice: number
  ): Promise<boolean> => {
    try {
      // Validar dados
      const validation = dependentSchema.safeParse({
        enrollment_id: enrollmentId,
        student_id: studentId,
        dependent_student_id: dependentStudentId,
        dependent_price: dependentPrice,
      });

      if (!validation.success) {
        toast({
          title: "Erro de Validação",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return false;
      }

      // Verificar se não é o mesmo aluno
      if (studentId === dependentStudentId) {
        toast({
          title: "Erro",
          description: "Um aluno não pode ser dependente de si mesmo",
          variant: "destructive",
        });
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('enrollment_dependents')
        .insert({
          enrollment_id: enrollmentId,
          student_id: studentId,
          dependent_student_id: dependentStudentId,
          dependent_price: dependentPrice,
          user_id: user.id,
        });

      if (error) {
        console.error('Error adding dependent:', error);
        
        if (error.code === '23505') { // Unique violation
          toast({
            title: "Erro",
            description: "Este dependente já está vinculado a esta matrícula",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro",
            description: "Não foi possível adicionar o dependente",
            variant: "destructive",
          });
        }
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Dependente adicionado com sucesso",
      });

      await fetchDependents(enrollmentId);
      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar dependente",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeDependent = async (dependentId: string, enrollmentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('enrollment_dependents')
        .delete()
        .eq('id', dependentId);

      if (error) {
        console.error('Error removing dependent:', error);
        toast({
          title: "Erro",
          description: "Não foi possível remover o dependente",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Dependente removido com sucesso",
      });

      await fetchDependents(enrollmentId);
      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao remover dependente",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateDependentPrice = async (
    dependentId: string,
    enrollmentId: string,
    newPrice: number
  ): Promise<boolean> => {
    try {
      // Validar preço
      if (newPrice < 0) {
        toast({
          title: "Erro de Validação",
          description: "Preço deve ser maior ou igual a zero",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('enrollment_dependents')
        .update({ dependent_price: newPrice })
        .eq('id', dependentId);

      if (error) {
        console.error('Error updating dependent price:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o preço do dependente",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Preço atualizado com sucesso",
      });

      await fetchDependents(enrollmentId);
      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar preço",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (enrollmentId) {
      fetchDependents(enrollmentId);
    }
  }, [enrollmentId]);

  return {
    dependents,
    loading,
    fetchDependents,
    addDependent,
    removeDependent,
    updateDependentPrice,
  };
};
