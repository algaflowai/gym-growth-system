
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { DollarSign, TrendingUp, Calendar, CreditCard, TrendingDown, AlertTriangle, Loader2 } from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

const FinancialSection = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const { financialData, loading } = useFinancialData(userId || '', userId || '');

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Módulo Financeiro</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Acompanhe a performance financeira da academia</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando dados financeiros...</span>
        </div>
      </div>
    );
  }

  if (!financialData) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Módulo Financeiro</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Acompanhe a performance financeira da academia</p>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Não foi possível carregar os dados financeiros.</p>
        </div>
      </div>
    );
  }

  const {
    cards,
    evolucao_financeira,
    perdas_breakdown,
    receitas_vs_perdas,
    distribuicao_planos,
    metricas_adicionais
  } = financialData;

  const monthlyRevenue = cards?.receita_mensal?.valor || 0;
  const totalRevenue = cards?.receita_total?.valor || 0;
  const monthlyGrowth = cards?.receita_mensal?.crescimento || 0;
  const activeSubscriptions = cards?.assinaturas_ativas?.valor || 0;
  const monthlyLosses = cards?.perdas_mensais?.valor || 0;
  const lossRate = cards?.perdas_mensais?.percentual || 0;
  const evolutionData = evolucao_financeira || [];
  const lossAnalysisData = perdas_breakdown || [];
  const revenueVsLossesData = receitas_vs_perdas || [];
  const planDistributionData = distribuicao_planos || [];

  // Dados formatados para os gráficos
  const monthlyData = revenueVsLossesData.map(item => ({
    month: item.mes,
    revenue: item.receita,
    losses: item.perdas
  }));

  const planData = planDistributionData.map(plan => ({
    name: plan.plano,
    value: plan.assinantes,
    revenue: plan.receita,
    color: plan.cor === 'blue' ? '#2563eb' : plan.cor === 'green' ? '#16a34a' : '#dc2626'
  }));

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
                <XAxis dataKey="mes" className="text-gray-600 dark:text-gray-400" />
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
                  dataKey="receita" 
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
                    dataKey="percentual"
                  >
                    {lossAnalysisData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor === 'red' ? '#dc2626' : entry.cor === 'orange' ? '#ea580c' : entry.cor === 'blue' ? '#2563eb' : '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Percentual']} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-3">
                {lossAnalysisData.map((loss, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: loss.cor === 'red' ? '#dc2626' : loss.cor === 'orange' ? '#ea580c' : loss.cor === 'blue' ? '#2563eb' : '#6b7280' }}
                      ></div>
                      <div>
                        <div className="font-medium">{loss.categoria}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{loss.percentual.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">-R$ {loss.valor.toLocaleString()}</div>
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
              <div className="text-2xl font-bold text-gray-800 dark:text-white">R$ {metricas_adicionais?.ticket_medio?.toFixed(0) || '0'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ticket Médio</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{metricas_adicionais?.taxa_retencao?.toFixed(1) || '0'}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Retenção</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{metricas_adicionais?.novos_clientes_mes || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Novos Clientes/Mês</div>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{metricas_adicionais?.taxa_perda?.toFixed(1) || '0'}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Perda</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSection;
