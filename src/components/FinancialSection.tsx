
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { DollarSign, TrendingUp, Calendar, CreditCard, TrendingDown, AlertTriangle, Loader2, Download, Filter } from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useFinancialExport } from '@/hooks/useFinancialExport';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExpenseManagement } from './ExpenseManagement';

const FinancialSection = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isFiltering, setIsFiltering] = useState(false);
  const { exportToPDF, exportToExcel } = useFinancialExport();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const { financialData, loading, refetch } = useFinancialData(
    userId || '', 
    userId || '',
    isFiltering ? startDate : undefined,
    isFiltering ? endDate : undefined
  );

  const applyDateFilter = () => {
    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        alert('Data de início deve ser anterior à data de fim');
        return;
      }
      setIsFiltering(true);
    }
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setIsFiltering(false);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!financialData) return;
    
    const period = isFiltering 
      ? `${new Date(startDate).toLocaleDateString('pt-BR')} - ${new Date(endDate).toLocaleDateString('pt-BR')}`
      : undefined;

    if (format === 'pdf') {
      exportToPDF(financialData, period);
    } else {
      exportToExcel(financialData);
    }
  };

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
    metricas_adicionais,
    metricas_parcelas
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Módulo Financeiro</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Acompanhe a performance financeira da academia</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport('pdf')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button onClick={() => handleExport('excel')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filtro por Data */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Data Início</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Data Fim</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={applyDateFilter} disabled={!startDate || !endDate}>
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              {isFiltering && (
                <Button variant="outline" onClick={clearFilter}>
                  Limpar
                </Button>
              )}
            </div>
          </div>
          {isFiltering && (
            <p className="text-sm text-muted-foreground mt-3">
              Mostrando dados de {new Date(startDate).toLocaleDateString('pt-BR')} até {new Date(endDate).toLocaleDateString('pt-BR')}
            </p>
          )}
        </CardContent>
      </Card>

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

        {/* Cards de Despesas e Lucro */}
        {financialData.despesas_fixas && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Despesas Fixas Mensais
              </CardTitle>
              <TrendingDown className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                R$ {financialData.despesas_fixas.total_mensal?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {financialData.despesas_fixas.detalhamento?.length || 0} despesas cadastradas
              </p>
            </CardContent>
          </Card>
        )}

        {financialData.lucro_liquido && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-700 dark:text-teal-300">
                Lucro Líquido
              </CardTitle>
              <DollarSign className="h-5 w-5 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-900 dark:text-teal-100">
                R$ {financialData.lucro_liquido.valor?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                Margem: {financialData.lucro_liquido.margem?.toFixed(1) || '0'}%
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cards de Parcelas */}
      {metricas_parcelas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                A Receber Este Mês
              </CardTitle>
              <Calendar className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                R$ {(metricas_parcelas.a_receber_este_mes || 0).toLocaleString()}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Parcelas do mês atual</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                Próximos 7 Dias
              </CardTitle>
              <Calendar className="h-5 w-5 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                R$ {(metricas_parcelas.a_receber_proximos_7_dias || 0).toLocaleString()}
              </div>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">A vencer em breve</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
                Atrasado
              </CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                R$ {(metricas_parcelas.total_atrasado || 0).toLocaleString()}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {metricas_parcelas.parcelas_atrasadas || 0} parcelas vencidas
              </p>
              {(metricas_parcelas.parcelas_pendentes_atrasadas || 0) > 0 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  ⚠️ {metricas_parcelas.parcelas_pendentes_atrasadas} pendentes em atraso
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Recebido no Mês
              </CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                R$ {(metricas_parcelas.receita_recebida_mes || 0).toLocaleString()}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Parcelas pagas</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Taxa de Inadimplência
              </CardTitle>
              <TrendingDown className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {(metricas_parcelas.taxa_inadimplencia || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Do total a receber</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Evolution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Evolution Line Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white">Evolução Financeira</CardTitle>
            <CardDescription className="dark:text-gray-300">
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
            <CardTitle className="text-xl text-gray-900 dark:text-white">Análise de Perdas</CardTitle>
            <CardDescription className="dark:text-gray-300">
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
                        <div className="font-medium text-gray-900 dark:text-white">{loss.categoria}</div>
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
          <CardTitle className="text-xl text-gray-900 dark:text-white">Receitas vs Perdas</CardTitle>
          <CardDescription className="dark:text-gray-300">
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
          <CardTitle className="text-xl text-gray-900 dark:text-white">Distribuição por Planos</CardTitle>
          <CardDescription className="dark:text-gray-300">
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
                      <div className="font-medium text-gray-900 dark:text-white">{plan.name}</div>
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
          <CardTitle className="text-xl text-gray-900 dark:text-white">Métricas Adicionais</CardTitle>
          <CardDescription className="dark:text-gray-300">
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

      {/* Gestão de Despesas Fixas */}
      <ExpenseManagement />
    </div>
  );
};

export default FinancialSection;
