import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useDataBackup = () => {
  const [isExporting, setIsExporting] = useState(false);

  const fetchAllData = async () => {
    try {
      // Buscar todos os dados em paralelo - TODAS as tabelas relevantes
      const [
        studentsResult, 
        enrollmentsResult, 
        historyResult,
        installmentsResult,
        dependentsResult,
        expensesResult,
        plansResult,
        settingsResult
      ] = await Promise.all([
        supabase.from('students').select('*').order('created_at', { ascending: false }),
        supabase.from('enrollments').select('*').order('created_at', { ascending: false }),
        supabase.from('enrollment_history').select('*').order('archived_at', { ascending: false }),
        supabase.from('payment_installments').select('*').order('created_at', { ascending: false }),
        supabase.from('enrollment_dependents').select('*').order('created_at', { ascending: false }),
        supabase.from('fixed_expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('plans').select('*').order('created_at', { ascending: false }),
        supabase.from('system_settings').select('*').order('created_at', { ascending: false })
      ]);

      if (studentsResult.error) throw studentsResult.error;
      if (enrollmentsResult.error) throw enrollmentsResult.error;
      if (historyResult.error) throw historyResult.error;
      if (installmentsResult.error) throw installmentsResult.error;
      if (dependentsResult.error) throw dependentsResult.error;
      if (expensesResult.error) throw expensesResult.error;
      if (plansResult.error) throw plansResult.error;
      if (settingsResult.error) throw settingsResult.error;

      return {
        students: studentsResult.data || [],
        enrollments: enrollmentsResult.data || [],
        enrollment_history: historyResult.data || [],
        payment_installments: installmentsResult.data || [],
        enrollment_dependents: dependentsResult.data || [],
        fixed_expenses: expensesResult.data || [],
        plans: plansResult.data || [],
        system_settings: settingsResult.data || []
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
                                   'start_date', 'end_date', 'status', 'is_family_plan', 'is_custom_plan',
                                   'titular_price', 'is_installment_plan', 'total_installments', 'created_at'];
      
      const historyHeaders = ['id', 'enrollment_id', 'student_id', 'plan_id', 'plan_name', 
                              'plan_price', 'start_date', 'end_date', 'status', 'archived_at'];

      const installmentsHeaders = ['id', 'enrollment_id', 'student_id', 'installment_number', 
                                   'total_installments', 'amount', 'due_date', 'paid_date', 
                                   'status', 'payment_method', 'is_family_plan', 'created_at'];

      const dependentsHeaders = ['id', 'enrollment_id', 'student_id', 'dependent_student_id', 
                                 'dependent_price', 'created_at'];

      const expensesHeaders = ['id', 'name', 'amount', 'due_day', 'category', 'description', 
                               'is_active', 'created_at'];

      const plansHeaders = ['id', 'name', 'price', 'duration', 'duration_days', 'active', 'created_at'];

      const settingsHeaders = ['id', 'key', 'value', 'created_at'];

      // Converter cada tabela para CSV
      const studentsCSV = convertToCSV(data.students, studentsHeaders);
      const enrollmentsCSV = convertToCSV(data.enrollments, enrollmentsHeaders);
      const historyCSV = convertToCSV(data.enrollment_history, historyHeaders);
      const installmentsCSV = convertToCSV(data.payment_installments, installmentsHeaders);
      const dependentsCSV = convertToCSV(data.enrollment_dependents, dependentsHeaders);
      const expensesCSV = convertToCSV(data.fixed_expenses, expensesHeaders);
      const plansCSV = convertToCSV(data.plans, plansHeaders);
      const settingsCSV = convertToCSV(data.system_settings, settingsHeaders);

      // Criar arquivo ZIP simulado (múltiplos downloads)
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Download de cada CSV
      [
        { content: studentsCSV, name: `alunos-${timestamp}.csv` },
        { content: enrollmentsCSV, name: `matriculas-${timestamp}.csv` },
        { content: historyCSV, name: `historico-${timestamp}.csv` },
        { content: installmentsCSV, name: `parcelas-${timestamp}.csv` },
        { content: dependentsCSV, name: `dependentes-${timestamp}.csv` },
        { content: expensesCSV, name: `despesas-${timestamp}.csv` },
        { content: plansCSV, name: `planos-${timestamp}.csv` },
        { content: settingsCSV, name: `configuracoes-${timestamp}.csv` }
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
        description: "8 arquivos CSV foram baixados com sucesso!",
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
