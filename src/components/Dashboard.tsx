
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
  const { enrollments, loading: enrollmentsLoading, updateEnrollment } = useEnrollments();
  const [birthdayStudents, setBirthdayStudents] = useState<string[]>([]);
  const [expiringEnrollments, setExpiringEnrollments] = useState<string[]>([]);

  const loading = studentsLoading || enrollmentsLoading;

  // Calculate students with birthdays today
  useEffect(() => {
    console.log('Checking birthdays for students:', students);
    
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    const birthdaysToday = students.filter(student => {
      if (!student.birth_date) return false;
      
      // Parse birth date and format it consistently
      const birthDate = new Date(student.birth_date);
      const studentBirthday = `${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;
      const todayFormatted = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      console.log(`Student ${student.name}: birthday ${studentBirthday}, today ${todayFormatted}`);
      
      return studentBirthday === todayFormatted;
    }).map(student => student.name);

    console.log('Birthday students found:', birthdaysToday);
    setBirthdayStudents(birthdaysToday);
  }, [students]);

  // Auto-inactivate expired enrollments and calculate expiring ones
  useEffect(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    console.log('Processing enrollments for auto-inactivation and expiring alerts');
    
    // Auto-inactivate expired enrollments that are 7+ days overdue
    enrollments.forEach(enrollment => {
      const endDate = new Date(enrollment.end_date);
      
      if (enrollment.status === 'active' && endDate < sevenDaysAgo) {
        console.log(`Auto-inactivating enrollment for ${enrollment.student?.name || 'Unknown'} - expired on ${enrollment.end_date}`);
        updateEnrollment(enrollment.id, { status: 'expired' });
      }
    });
    
    // Calculate enrollments expiring within 7 days
    const expiring = enrollments
      .filter(enrollment => {
        const endDate = new Date(enrollment.end_date);
        return endDate >= today && endDate <= sevenDaysFromNow && enrollment.status === 'active';
      })
      .map(enrollment => enrollment.student?.name || 'Nome não disponível');

    setExpiringEnrollments(expiring);
  }, [enrollments, updateEnrollment]);

  // Calculate statistics
  const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
  const expiredEnrollments = enrollments.filter(e => e.status === 'expired').length;

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
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white shadow-xl">
          <h2 className="text-xl sm:text-3xl font-bold mb-2">Bem-vindo ao AlgaGymManager</h2>
          <p className="text-blue-100 text-sm sm:text-lg">Gerencie sua academia de forma eficiente e acompanhe o crescimento</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando dados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white shadow-xl">
        <h2 className="text-xl sm:text-3xl font-bold mb-2">Bem-vindo ao AlgaGymManager</h2>
        <p className="text-blue-100 text-sm sm:text-lg">Gerencie sua academia de forma eficiente e acompanhe o crescimento</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
              Matrículas Ativas
            </CardTitle>
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-white">{activeEnrollments}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              Total de alunos ativos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
              Total de Alunos
            </CardTitle>
            <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-white">{students.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Cadastrados na academia</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
              Aniversariantes
            </CardTitle>
            <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-white">{birthdayStudents.length}</div>
            <p className="text-xs text-purple-600 mt-1">Hoje</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
              Matrículas Vencendo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-white">{expiringEnrollments.length}</div>
            <p className="text-xs text-red-600 mt-1">Próximos 7 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Growth Chart */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Evolução de Matrículas</CardTitle>
            <CardDescription className="text-sm">
              Crescimento de matrículas ativas ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <ResponsiveContainer width="100%" height={250}>
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
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Ações Rápidas</CardTitle>
            <CardDescription className="text-sm">
              Acesso rápido às funções principais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <Button 
              onClick={() => onNavigate('new-enrollment')}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 h-10 sm:h-12 text-sm sm:text-base"
            >
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Nova Matrícula
            </Button>
            
            <Button 
              onClick={() => onNavigate('enrollments')}
              variant="outline" 
              className="w-full h-10 sm:h-12 text-sm sm:text-base border-2"
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Gerenciar Matrículas
            </Button>
            
            <Button 
              onClick={() => onNavigate('students')}
              variant="outline" 
              className="w-full h-10 sm:h-12 text-sm sm:text-base border-2"
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Ver Todos os Alunos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Birthday Alerts */}
        <Card className="border-0 shadow-md border-l-4 border-l-purple-500">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 text-sm sm:text-base">
              <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Aniversariantes do Dia</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {birthdayStudents.length > 0 ? (
              <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                {birthdayStudents.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <span className="font-medium text-gray-800 dark:text-white text-sm sm:text-base">{student}</span>
                    <Gift className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum aniversariante hoje</p>
            )}
          </CardContent>
        </Card>

        {/* Expiring Enrollments */}
        <Card className="border-0 shadow-md border-l-4 border-l-red-500">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-red-700 dark:text-red-300 text-sm sm:text-base">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Matrículas Vencendo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {expiringEnrollments.length > 0 ? (
              <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                {expiringEnrollments.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="font-medium text-gray-800 dark:text-white text-sm sm:text-base">{student}</span>
                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma matrícula vencendo nos próximos 7 dias</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
