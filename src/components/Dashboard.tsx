
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserPlus, Calendar, AlertTriangle, Gift } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  // Mock data for demonstration
  const stats = {
    activeEnrollments: 156,
    newThisMonth: 23,
    birthdaysToday: 3,
    monthlyGrowth: 12.5,
    pendingPayments: 8
  };

  const birthdayStudents = [
    'Maria Silva',
    'João Santos', 
    'Ana Costa'
  ];

  const pendingPayments = [
    'Carlos Oliveira',
    'Fernanda Lima',
    'Roberto Alves',
    'Juliana Pereira',
    'Marcos Souza',
    'Patricia Rocha',
    'Diego Ferreira',
    'Camila Dias'
  ];

  const chartData = [
    { month: 'Jan', enrollments: 45 },
    { month: 'Feb', enrollments: 52 },
    { month: 'Mar', enrollments: 48 },
    { month: 'Abr', enrollments: 61 },
    { month: 'Mai', enrollments: 55 },
    { month: 'Jun', enrollments: 67 },
    { month: 'Jul', enrollments: 73 },
    { month: 'Ago', enrollments: 69 },
    { month: 'Set', enrollments: 78 },
    { month: 'Out', enrollments: 85 },
    { month: 'Nov', enrollments: 92 },
    { month: 'Dez', enrollments: 98 }
  ];

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
            <div className="text-3xl font-bold text-gray-800 dark:text-white">{stats.activeEnrollments}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              +{stats.monthlyGrowth}% este mês
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Novas Matrículas
            </CardTitle>
            <UserPlus className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">{stats.newThisMonth}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Este mês</p>
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
            <div className="text-3xl font-bold text-gray-800 dark:text-white">{stats.birthdaysToday}</div>
            <p className="text-xs text-purple-600 mt-1">Hoje</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Pagamentos Pendentes
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">{stats.pendingPayments}</div>
            <p className="text-xs text-red-600 mt-1">Requer atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Crescimento de Matrículas</CardTitle>
            <CardDescription>
              Evolução mensal de novas matrículas
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
              <span>Pagamentos Pendentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pendingPayments.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="font-medium text-gray-800 dark:text-white">{student}</span>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
