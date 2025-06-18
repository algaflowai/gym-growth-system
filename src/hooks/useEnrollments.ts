
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Student } from './useStudents';
import { 
  fetchEnrollmentsFromDB, 
  createEnrollmentInDB, 
  updateEnrollmentInDB, 
  deleteEnrollmentFromDB,
  updateExpiredEnrollmentsInDB
} from '@/services/enrollmentService';
import { renewEnrollmentService } from '@/services/enrollmentRenewalService';
import { mapEnrollmentStatus } from '@/utils/enrollmentUtils';

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

export const useEnrollments = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = async () => {
    try {
      // Primeiro atualiza matrículas expiradas
      await updateExpiredEnrollmentsInDB();

      const data = await fetchEnrollmentsFromDB();
      
      // Mapeia os dados convertendo explicitamente o status
      const enrollmentsData = mapEnrollmentStatus(data);
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as matrículas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createEnrollment = async (enrollmentData: Omit<Enrollment, 'id' | 'created_at' | 'updated_at' | 'student'>) => {
    try {
      const data = await createEnrollmentInDB(enrollmentData);

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
        description: "Não foi possível criar a matrícula.",
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
      await renewEnrollmentService(currentEnrollmentId, planId, planName, planPrice, planDuration);

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
      await updateEnrollmentInDB(id, updates);

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
        description: "Não foi possível atualizar a matrícula.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteEnrollment = async (id: string) => {
    try {
      await deleteEnrollmentFromDB(id);

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
        description: "Não foi possível excluir a matrícula.",
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
