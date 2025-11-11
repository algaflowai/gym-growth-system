import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, CreditCardIcon, HistoryIcon, DollarSign, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Enrollment } from '@/hooks/useEnrollments';
import { Student } from '@/hooks/useStudents';
import dayjs from '@/lib/dayjs';
import { nowInBrazil, BRAZIL_TZ } from '@/lib/dayjs';
import { useInstallments, Installment } from '@/hooks/useInstallments';
import { EnrollmentDependentsView } from './EnrollmentDependentsView';

interface StudentEnrollmentHistoryProps {
  studentId: string;
  student?: Student;
}

// Define the type of status expected for enrollments
type EnrollmentStatus = "active" | "inactive" | "expired";

const StudentEnrollmentHistory = ({ studentId, student }: StudentEnrollmentHistoryProps) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const { installments, loading: installmentsLoading, fetchInstallments, markAsPaid } = useInstallments();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState<string | null>(null);

  const fetchStudentEnrollments = async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated');
        setEnrollments([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', studentId)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching student enrollments:', error);
        return;
      }

      // Map the data and cast the status to the expected type
      const enrollmentsData = (data || []).map((enrollment: any) => ({
        ...enrollment,
        status: enrollment.status as EnrollmentStatus,
      }));

      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudentEnrollments();
      fetchInstallments(undefined, studentId);
    }
  }, [studentId]);

  // Helper function to get the display status based on actual dates
  const getDisplayStatus = (enrollment: Enrollment): EnrollmentStatus => {
    const now = nowInBrazil().startOf('day');
    const endDate = dayjs(enrollment.end_date).tz(BRAZIL_TZ).startOf('day');
    
    // If the end date has passed, show as expired
    if (endDate.isBefore(now)) {
      return 'expired';
    }
    
    return enrollment.status as EnrollmentStatus;
  };
  
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

  const getInstallmentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Pago</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Atrasado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const handleConfirmPayment = async (installmentId: string, method: string) => {
    await markAsPaid(installmentId, method);
    setShowPaymentDialog(null);
    setSelectedPaymentMethod('');
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
                {enrollments.filter(e => getDisplayStatus(e) === 'active').length}
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
          const isActivePlan = index === 0 && getDisplayStatus(enrollment) === 'active';
          
          return (
            <Card key={enrollment.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCardIcon className="h-5 w-5" />
                    {enrollment.plan_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(getDisplayStatus(enrollment))}
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
                {isActivePlan ? (
                  <Tabs defaultValue="detalhes" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                      <TabsTrigger value="parcelas">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Parcelas
                      </TabsTrigger>
                      <TabsTrigger value="dependentes">
                        <Users className="h-4 w-4 mr-1" />
                        Dependentes
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="detalhes" className="space-y-4 mt-4">
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

                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-sm font-medium text-green-800">
                          ✓ Este é o plano ativo atual
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="parcelas" className="mt-4">
                      {installments.filter(i => i.enrollment_id === enrollment.id).length > 0 ? (
                        <div className="space-y-3">
                          {installments
                            .filter(i => i.enrollment_id === enrollment.id)
                            .map((installment) => (
                              <div key={installment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm">
                                      Parcela {installment.installment_number}/{installment.total_installments}
                                    </span>
                                    {getInstallmentStatusBadge(installment.status)}
                                  </div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-4">
                                    <span>Vencimento: {dayjs(installment.due_date).format('DD/MM/YYYY')}</span>
                                    <span className="font-semibold text-foreground">
                                      R$ {Number(installment.amount).toFixed(2)}
                                    </span>
                                  </div>
                                  {installment.paid_date && (
                                    <p className="text-xs text-green-600 mt-1">
                                      Pago em {dayjs(installment.paid_date).format('DD/MM/YYYY')}
                                      {installment.payment_method && ` via ${installment.payment_method}`}
                                    </p>
                                  )}
                                </div>
                                {installment.status !== 'paid' && (
                                  <div className="ml-4">
                                    {showPaymentDialog === installment.id ? (
                                      <div className="flex flex-col gap-2">
                                        <select
                                          value={selectedPaymentMethod}
                                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                          className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs"
                                        >
                                          <option value="">Método</option>
                                          <option value="dinheiro">Dinheiro</option>
                                          <option value="pix">PIX</option>
                                          <option value="cartao_debito">Débito</option>
                                          <option value="cartao_credito">Crédito</option>
                                        </select>
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            onClick={() => handleConfirmPayment(installment.id, selectedPaymentMethod)}
                                            disabled={!selectedPaymentMethod}
                                          >
                                            Confirmar
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setShowPaymentDialog(null);
                                              setSelectedPaymentMethod('');
                                            }}
                                          >
                                            Cancelar
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={() => setShowPaymentDialog(installment.id)}
                                      >
                                        Confirmar
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          Nenhuma parcela configurada para este plano
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="dependentes" className="mt-4">
                      <EnrollmentDependentsView 
                        enrollmentId={enrollment.id} 
                        studentId={studentId}
                        isActive={true}
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="space-y-4">
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

      {/* Seção de Parcelas removida - agora está nas abas do plano ativo */}
    </div>
  );
};

export default StudentEnrollmentHistory;
