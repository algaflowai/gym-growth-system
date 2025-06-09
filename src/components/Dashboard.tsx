
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserPlus, Calendar, AlertTriangle, Gift, Loader2 } from 'lucide-react';
import { useStudents } from '@/hooks/useStudents';
import { useEnrollments } from '@/hooks/useEnrollments';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const { students, loading: studentsLoading } = useStudents();
  const { enrollments, loading: enrollmentsLoading } = useEnrollments();
  const [birthdayStudents, setBirthdayStudents] = useState<string[]>([]);
  const [pendingPayments, setPendingPayments] = useState<string[]>([]);

  const loading = studentsLoading || enrollmentsLoading;

  // Calculate statistics
  const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
  const expiredEnrollments = enrollments.filter(e => e.status === 'expired').length;
  
  // Calculate students with birthdays today
  useEffect(() => {
    const today = new Date();
    const todayString = `${today.getMonth() + 1}-${today.getDate()}`;
    
    const birthdaysToday = students.filter(student => {
      if (!student.birth_date) return false;
      const birthDate = new Date(student.birth_date);
      const birthString = `${birthDate.getMonth() + 1}-${birthDate.getDate()}`;
      return birthString === todayString;
    }).map(student => student.name);

    setBirthdayStudents(birthdaysToday);
  }, [students]);

  // Calculate expired enrollments (pending payments)
  useEffect(() => {
    const pending = enrollments
      .filter(enrollment => {
        const today = new Date();
        const endDate = new Date(enrollment.end_date);
        return endDate < today && enrollment.status === 'active';
      })
      .map(enrollment => enrollment.student?.name || 'Nome não disponível');

    setPendingPayments(pending);
  }, [enrollments]);

  // Mock data for chart (we can replace this with real monthly data later)
  const chartData = [
    { month: 'Jan', enrollments: Math.max(0, activeEnrollments - 50) },
    { month: 'Fev', enrollments: Math.max(0, activeEnrollments - 40) },
    { month: 'Mar', enrollments: Math.max(0, activeEnrollments - 30) },
    { month: 'Abr', enrollments: Math.max(0, activeEnrollments - 20) },
    { month: 'Mai', enrollments: Math.max(0, activeEnrollments - 10) },
    { month: 'Jun', enrollments: activeEnrollments },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-2">Bem-vindo ao AlgaGymManager</h2>
          <p className="text-blue-100 text-lg">Gerencie sua academia de forma eficiente e acompanhe o crescimento</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando dados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2">Bem-vindo ao AlgaGymManager</h2>
        <p className="text-blue-100 text-lg">Gerencie sua academia de forma eficiente e acompanhe o crescimento</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Matrículas Ativas
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">{activeEnrollments}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              Total de alunos ativos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total de Alunos
            </CardTitle>
            <UserPlus className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">{students.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Cadastrados na academia</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Aniversariantes do Dia
            </CardTitle>
            <Gift className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">{birthdayStudents.length}</div>
            <p className="text-xs text-purple-600 mt-1">Hoje</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Matrículas Vencidas
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">{pendingPayments.length}</div>
            <p className="text-xs text-red-600 mt-1">Requer atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Evolução de Matrículas</CardTitle>
            <CardDescription>
              Crescimento de matrículas ativas ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
                <YAxis className="text-gray-600 dark:text-gray-400" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="enrollments" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às funções principais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => onNavigate('new-enrollment')}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 h-12 text-base"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Nova Matrícula
            </Button>
            
            <Button 
              onClick={() => onNavigate('enrollments')}
              variant="outline" 
              className="w-full h-12 text-base border-2"
            >
              <Users className="h-5 w-5 mr-2" />
              Gerenciar Matrículas
            </Button>
            
            <Button 
              onClick={() => onNavigate('students')}
              variant="outline" 
              className="w-full h-12 text-base border-2"
            >
              <Users className="h-5 w-5 mr-2" />
              Ver Todos os Alunos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Birthday Alerts */}
        <Card className="border-0 shadow-md border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
              <Gift className="h-5 w-5" />
              <span>Aniversariantes do Dia</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {birthdayStudents.length > 0 ? (
              <div className="space-y-2">
                {birthdayStudents.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <span className="font-medium text-gray-800 dark:text-white">{student}</span>
                    <Gift className="h-4 w-4 text-purple-600" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Nenhum aniversariante hoje</p>
            )}
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card className="border-0 shadow-md border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="h-5 w-5" />
              <span>Matrículas Vencidas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingPayments.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pendingPayments.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="font-medium text-gray-800 dark:text-white">{student}</span>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Nenhuma matrícula vencida</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
