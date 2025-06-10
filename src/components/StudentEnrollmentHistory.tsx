
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, CreditCardIcon, HistoryIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Enrollment } from '@/hooks/useEnrollments';
import { Student } from '@/hooks/useStudents';

interface StudentEnrollmentHistoryProps {
  studentId: string;
  student?: Student;
}

const StudentEnrollmentHistory = ({ studentId, student }: StudentEnrollmentHistoryProps) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudentEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', studentId)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching student enrollments:', error);
        return;
      }

      setEnrollments(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudentEnrollments();
    }
  }, [studentId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expirado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDurationLabel = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('diário') || name.includes('diaria')) return 'Diário';
    if (name.includes('mensal')) return 'Mensal';
    if (name.includes('trimestral')) return 'Trimestral';
    if (name.includes('semestral')) return 'Semestral';
    if (name.includes('anual')) return 'Anual';
    return 'N/A';
  };

  const getMonthsCovered = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = [];

    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= endMonth) {
      months.push(current.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  };

  const getTotalValue = () => {
    return enrollments.reduce((total, enrollment) => total + enrollment.plan_price, 0);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando histórico...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5" />
            Histórico de Matrículas
          </CardTitle>
          <CardDescription>
            {student?.name && `Histórico completo de planos de ${student.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{enrollments.length}</div>
              <div className="text-sm text-blue-600">Total de Planos</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {enrollments.filter(e => e.status === 'active').length}
              </div>
              <div className="text-sm text-green-600">Planos Ativos</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                R$ {getTotalValue().toFixed(2)}
              </div>
              <div className="text-sm text-purple-600">Valor Total Pago</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {enrollments.map((enrollment, index) => {
          const monthsCovered = getMonthsCovered(enrollment.start_date, enrollment.end_date);
          
          return (
            <Card key={enrollment.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCardIcon className="h-5 w-5" />
                    {enrollment.plan_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(enrollment.status)}
                    <Badge variant="outline">
                      {getDurationLabel(enrollment.plan_name)}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-lg font-semibold text-green-600">
                  R$ {enrollment.plan_price.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Período</div>
                      <div className="font-medium">
                        {new Date(enrollment.start_date).toLocaleDateString('pt-BR')} até{' '}
                        {new Date(enrollment.end_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Data de Contratação</div>
                    <div className="font-medium">
                      {new Date(enrollment.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Meses Cobertos por este Plano:</div>
                  <div className="flex flex-wrap gap-2">
                    {monthsCovered.map((month, monthIndex) => (
                      <Badge key={monthIndex} variant="secondary" className="text-xs">
                        {month}
                      </Badge>
                    ))}
                  </div>
                </div>

                {index === 0 && enrollment.status === 'active' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-green-800">
                      ✓ Este é o plano ativo atual
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {enrollments.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <HistoryIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Nenhum histórico de matrícula encontrado</p>
              <p className="text-sm text-gray-400">
                Este aluno ainda não possui matrículas registradas
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentEnrollmentHistory;
