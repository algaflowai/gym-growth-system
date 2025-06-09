
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';

const FinancialSection = () => {
  // Mock data for demonstration
  const monthlyRevenue = 45600;
  const totalRevenue = 547200;
  const monthlyGrowth = 15.3;
  const activeSubscriptions = 156;

  const monthlyData = [
    { month: 'Jan', revenue: 38500 },
    { month: 'Fev', revenue: 42300 },
    { month: 'Mar', revenue: 39800 },
    { month: 'Abr', revenue: 44600 },
    { month: 'Mai', revenue: 41200 },
    { month: 'Jun', revenue: 45600 },
    { month: 'Jul', revenue: 47300 },
    { month: 'Ago', revenue: 43900 },
    { month: 'Set', revenue: 48700 },
    { month: 'Out', revenue: 52100 },
    { month: 'Nov', revenue: 49800 },
    { month: 'Dez', revenue: 45600 },
  ];

  const planData = [
    { name: 'Mensal', value: 45, revenue: 20250, color: '#2563eb' },
    { name: 'Trimestral', value: 30, revenue: 21600, color: '#16a34a' },
    { name: 'Anual', value: 25, revenue: 22250, color: '#dc2626' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Módulo Financeiro</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Acompanhe a performance financeira da academia</p>
      </div>

      {/* Financial Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Receita Mensal
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              R$ {monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{monthlyGrowth}% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Receita Total
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              R$ {totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Desde o início</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Média Mensal
            </CardTitle>
            <Calendar className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              R$ {Math.round(totalRevenue / 12).toLocaleString()}
            </div>
            <p className="text-xs text-purple-600 mt-1">Últimos 12 meses</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Assinaturas Ativas
            </CardTitle>
            <CreditCard className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">{activeSubscriptions}</div>
            <p className="text-xs text-orange-600 mt-1">Matrículas ativas</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Evolução da Receita Mensal</CardTitle>
            <CardDescription>
              Receita arrecadada mês a mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
                <YAxis className="text-gray-600 dark:text-gray-400" />
                <Tooltip 
                  formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, 'Receita']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plans Distribution Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Distribuição por Planos</CardTitle>
            <CardDescription>
              Receita e quantidade de assinantes por plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {planData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-3">
                {planData.map((plan, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: plan.color }}
                      ></div>
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{plan.value} assinantes</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">R$ {plan.revenue.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Financial Metrics */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Métricas Adicionais</CardTitle>
          <CardDescription>
            Outras informações financeiras importantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">R$ 292</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ticket Médio</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">94.2%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Retenção</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">23</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Novos Clientes/Mês</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSection;
