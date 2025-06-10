
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { DollarSign, TrendingUp, Calendar, CreditCard, TrendingDown, AlertTriangle } from 'lucide-react';

const FinancialSection = () => {
  // Mock data for demonstration
  const monthlyRevenue = 45600;
  const totalRevenue = 547200;
  const monthlyGrowth = 15.3;
  const activeSubscriptions = 156;
  const monthlyLosses = 3200;
  const lossRate = 7.0;

  const monthlyData = [
    { month: 'Jan', revenue: 38500, losses: 2800 },
    { month: 'Fev', revenue: 42300, losses: 3100 },
    { month: 'Mar', revenue: 39800, losses: 2900 },
    { month: 'Abr', revenue: 44600, losses: 3400 },
    { month: 'Mai', revenue: 41200, losses: 2600 },
    { month: 'Jun', revenue: 45600, losses: 3200 },
    { month: 'Jul', revenue: 47300, losses: 3000 },
    { month: 'Ago', revenue: 43900, losses: 3500 },
    { month: 'Set', revenue: 48700, losses: 2800 },
    { month: 'Out', revenue: 52100, losses: 3600 },
    { month: 'Nov', revenue: 49800, losses: 3100 },
    { month: 'Dez', revenue: 45600, losses: 3200 },
  ];

  const evolutionData = [
    { month: 'Jan', value: 38500 },
    { month: 'Fev', value: 42300 },
    { month: 'Mar', value: 39800 },
    { month: 'Abr', value: 44600 },
    { month: 'Mai', value: 41200 },
    { month: 'Jun', value: 45600 },
  ];

  const planData = [
    { name: 'Mensal', value: 45, revenue: 20250, color: '#2563eb' },
    { name: 'Trimestral', value: 30, revenue: 21600, color: '#16a34a' },
    { name: 'Anual', value: 25, revenue: 22250, color: '#dc2626' },
  ];

  const lossAnalysisData = [
    { category: 'Inadimplência', value: 45, amount: 1440, color: '#dc2626' },
    { category: 'Cancelamentos', value: 30, amount: 960, color: '#f59e0b' },
    { category: 'Transferências', value: 15, amount: 480, color: '#3b82f6' },
    { category: 'Outros', value: 10, amount: 320, color: '#6b7280' },
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
              Perdas Mensais
            </CardTitle>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              R$ {monthlyLosses.toLocaleString()}
            </div>
            <p className="text-xs text-red-600 flex items-center mt-1">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {lossRate}% da receita
            </p>
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

      {/* Evolution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Evolution Line Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Evolução Financeira</CardTitle>
            <CardDescription>
              Tendência de crescimento da receita
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={evolutionData}>
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
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563eb" 
                  fill="url(#colorRevenue)"
                  strokeWidth={3}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Loss Analysis Pie Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Análise de Perdas</CardTitle>
            <CardDescription>
              Principais fontes de perdas financeiras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={lossAnalysisData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {lossAnalysisData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentual']} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-3">
                {lossAnalysisData.map((loss, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: loss.color }}
                      ></div>
                      <div>
                        <div className="font-medium">{loss.category}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{loss.value}%</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">-R$ {loss.amount.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Losses Comparison */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Receitas vs Perdas</CardTitle>
          <CardDescription>
            Comparativo mensal entre receitas e perdas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip 
                formatter={(value, name) => [
                  `R$ ${Number(value).toLocaleString()}`, 
                  name === 'revenue' ? 'Receita' : 'Perdas'
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} name="revenue" />
              <Bar dataKey="losses" fill="#dc2626" radius={[4, 4, 0, 0]} name="losses" />
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

      {/* Additional Financial Metrics */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Métricas Adicionais</CardTitle>
          <CardDescription>
            Outras informações financeiras importantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

            <div className="text-center p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{lossRate}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Perda</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSection;
