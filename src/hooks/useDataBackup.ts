import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useDataBackup = () => {
  const [isExporting, setIsExporting] = useState(false);

  const fetchAllData = async () => {
    try {
      // Buscar todos os dados em paralelo
      const [studentsResult, enrollmentsResult, historyResult] = await Promise.all([
        supabase.from('students').select('*').order('created_at', { ascending: false }),
        supabase.from('enrollments').select('*').order('created_at', { ascending: false }),
        supabase.from('enrollment_history').select('*').order('archived_at', { ascending: false })
      ]);

      if (studentsResult.error) throw studentsResult.error;
      if (enrollmentsResult.error) throw enrollmentsResult.error;
      if (historyResult.error) throw historyResult.error;

      return {
        students: studentsResult.data || [],
        enrollments: enrollmentsResult.data || [],
        enrollment_history: historyResult.data || []
      };
    } catch (error) {
      console.error('Error fetching data for backup:', error);
      throw error;
    }
  };

  const exportToJSON = async () => {
    setIsExporting(true);
    try {
      const data = await fetchAllData();
      
      const backup = {
        export_date: new Date().toISOString(),
        version: '1.0',
        data: data
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-algagym-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Concluído",
        description: "Dados exportados em formato JSON com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro no Backup",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data: any[], headers: string[]) => {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escapar valores que contenham vírgulas ou aspas
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    );
    return [csvHeaders, ...csvRows].join('\n');
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const data = await fetchAllData();

      // Headers para cada tipo de dado
      const studentsHeaders = ['id', 'name', 'email', 'phone', 'cpf', 'rg', 'birth_date', 'gender', 
                               'address', 'city', 'zip_code', 'emergency_contact', 'health_issues', 
                               'restrictions', 'main_goal', 'status', 'created_at'];
      
      const enrollmentsHeaders = ['id', 'student_id', 'plan_id', 'plan_name', 'plan_price', 
                                   'start_date', 'end_date', 'status', 'created_at'];
      
      const historyHeaders = ['id', 'enrollment_id', 'student_id', 'plan_id', 'plan_name', 
                              'plan_price', 'start_date', 'end_date', 'status', 'archived_at'];

      // Converter cada tabela para CSV
      const studentsCSV = convertToCSV(data.students, studentsHeaders);
      const enrollmentsCSV = convertToCSV(data.enrollments, enrollmentsHeaders);
      const historyCSV = convertToCSV(data.enrollment_history, historyHeaders);

      // Criar arquivo ZIP simulado (múltiplos downloads)
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Download de cada CSV
      [
        { content: studentsCSV, name: `alunos-${timestamp}.csv` },
        { content: enrollmentsCSV, name: `matriculas-${timestamp}.csv` },
        { content: historyCSV, name: `historico-${timestamp}.csv` }
      ].forEach(({ content, name }) => {
        const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });

      toast({
        title: "Backup Concluído",
        description: "3 arquivos CSV foram baixados com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro no Backup",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToJSON,
    exportToCSV,
    isExporting
  };
};
