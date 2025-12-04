import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getMonthYear(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatDateBR(date: Date) {
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { academia_id, user_id, start_date, end_date } = await req.json();
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id é obrigatório' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Define date range (use provided dates or default to last 6 months)
    const now = new Date();
    const startDate = start_date ? new Date(start_date) : new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const endDate = end_date ? new Date(end_date) : now;
    
    // Current month boundaries
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Next 7 days
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Buscar alunos do usuário
    const studentsRes = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/students?user_id=eq.${user_id}&deleted_at=is.null`,
      {
        headers: {
          apikey: Deno.env.get('SUPABASE_ANON_KEY')!,
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
      }
    );
    const allStudents = await studentsRes.json();
    const activeStudents = allStudents.filter((s: any) => s.status === 'active');

    // Buscar matrículas do usuário
    const enrollmentsRes = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/enrollments?user_id=eq.${user_id}`,
      {
        headers: {
          apikey: Deno.env.get('SUPABASE_ANON_KEY')!,
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
      }
    );
    const enrollments = await enrollmentsRes.json();

    // Buscar parcelas do usuário
    const installmentsRes = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/payment_installments?user_id=eq.${user_id}`,
      {
        headers: {
          apikey: Deno.env.get('SUPABASE_ANON_KEY')!,
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
      }
    );
    const installments = await installmentsRes.json();

    // Buscar despesas fixas do usuário
    const expensesRes = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/fixed_expenses?user_id=eq.${user_id}&is_active=eq.true`,
      {
        headers: {
          apikey: Deno.env.get('SUPABASE_ANON_KEY')!,
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
      }
    );
    const expenses = await expensesRes.json();

    // ========== MÉTRICAS DE PARCELAS (CORRIGIDAS) ==========
    
    // A Receber Este Mês: parcelas PENDENTES com vencimento no mês atual
    const aReceberEsteMes = installments.filter((i: any) => {
      if (i.status !== 'pending') return false;
      const dueDate = new Date(i.due_date);
      return dueDate >= currentMonthStart && dueDate <= currentMonthEnd;
    }).reduce((sum: number, i: any) => sum + Number(i.amount), 0);

    // A Receber Próximos 7 Dias: parcelas PENDENTES com vencimento nos próximos 7 dias
    const aReceberProximos7Dias = installments.filter((i: any) => {
      if (i.status !== 'pending') return false;
      const dueDate = new Date(i.due_date);
      return dueDate >= now && dueDate <= next7Days;
    }).reduce((sum: number, i: any) => sum + Number(i.amount), 0);

    // Total de Parcelas Pendentes (todas)
    const totalPendente = installments.filter((i: any) => i.status === 'pending')
      .reduce((sum: number, i: any) => sum + Number(i.amount), 0);

    // Total Atrasado (parcelas com status overdue)
    const totalAtrasado = installments.filter((i: any) => i.status === 'overdue')
      .reduce((sum: number, i: any) => sum + Number(i.amount), 0);

    // Parcelas que deveriam estar atrasadas (pending com due_date < hoje)
    const parcelasPendentesAtrasadas = installments.filter((i: any) => {
      if (i.status !== 'pending') return false;
      const dueDate = new Date(i.due_date);
      return dueDate < now;
    });
    const totalPendentesAtrasadas = parcelasPendentesAtrasadas.reduce((sum: number, i: any) => sum + Number(i.amount), 0);

    // Receita Recebida Este Mês (parcelas PAGAS com paid_date no mês atual)
    const receitaRecebidaEsteMes = installments.filter((i: any) => {
      if (i.status !== 'paid' || !i.paid_date) return false;
      const paidDate = new Date(i.paid_date);
      return paidDate >= currentMonthStart && paidDate <= currentMonthEnd;
    }).reduce((sum: number, i: any) => sum + Number(i.amount), 0);

    // Quantidade de parcelas atrasadas
    const parcelasAtrasadas = installments.filter((i: any) => i.status === 'overdue').length;
    
    // Taxa de inadimplência: valor atrasado / (valor a receber + valor atrasado)
    const taxaInadimplencia = (totalPendente + totalAtrasado) > 0 
      ? (totalAtrasado / (totalPendente + totalAtrasado)) * 100 
      : 0;

    // ========== RECEITA E MATRÍCULAS ==========
    
    // Filtrar enrollments por período (para relatórios filtrados)
    const filteredEnrollments = enrollments.filter((e: any) => {
      const start = new Date(e.start_date);
      return start >= startDate && start <= endDate;
    });

    // Calcular despesas fixas
    const totalMonthlyExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    const monthsDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const totalExpensesForPeriod = totalMonthlyExpenses * monthsDiff;

    // Receita Total das matrículas (não dependentes para evitar duplicação)
    const totalRevenueEnrollments = filteredEnrollments
      .filter((e: any) => !e.is_dependent)
      .reduce((sum: number, e: any) => sum + Number(e.plan_price || 0), 0);
    
    // Receita Total baseada em parcelas pagas no período
    const totalReceitaParcelasPagas = installments.filter((i: any) => {
      if (i.status !== 'paid' || !i.paid_date) return false;
      const paidDate = new Date(i.paid_date);
      return paidDate >= startDate && paidDate <= endDate;
    }).reduce((sum: number, i: any) => sum + Number(i.amount), 0);

    // Usar receita de parcelas pagas como receita principal (mais preciso)
    const totalRevenue = totalReceitaParcelasPagas > 0 ? totalReceitaParcelasPagas : totalRevenueEnrollments;
    const netProfit = totalRevenue - totalExpensesForPeriod;

    // Receita Mensal (baseada em parcelas pagas no mês atual)
    const monthlyRevenue = receitaRecebidaEsteMes;

    // Receita Mensal do mês anterior
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const prevMonthlyRevenue = installments.filter((i: any) => {
      if (i.status !== 'paid' || !i.paid_date) return false;
      const paidDate = new Date(i.paid_date);
      return paidDate >= prevMonthStart && paidDate <= prevMonthEnd;
    }).reduce((sum: number, i: any) => sum + Number(i.amount), 0);

    // Percentual de crescimento
    const monthlyGrowth = prevMonthlyRevenue > 0 
      ? ((monthlyRevenue - prevMonthlyRevenue) / prevMonthlyRevenue) * 100 
      : 0;

    // Assinaturas Ativas
    const activeSubscriptions = enrollments.filter((e: any) => e.status === 'active' && !e.is_dependent).length;

    // Perdas Mensais (matrículas inativas ou expiradas do mês atual)
    const monthlyLosses = enrollments.filter((e: any) => {
      const end = new Date(e.end_date);
      return end >= currentMonthStart && end <= currentMonthEnd && 
             (e.status === 'inactive' || e.status === 'expired') && 
             !e.is_dependent;
    }).reduce((sum: number, e: any) => sum + Number(e.plan_price || 0), 0);

    // Percentual de perdas vs receita total
    const lossRate = totalRevenue > 0 ? (monthlyLosses / totalRevenue) * 100 : 0;

    // ========== GRÁFICO DE EVOLUÇÃO FINANCEIRA (últimos 6 meses) ==========
    const evolutionData = [];
    const lossesData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const label = formatDateBR(monthStart);
      
      // Receita do mês (baseada em parcelas pagas)
      const monthRevenue = installments.filter((inst: any) => {
        if (inst.status !== 'paid' || !inst.paid_date) return false;
        const paidDate = new Date(inst.paid_date);
        return paidDate >= monthStart && paidDate <= monthEnd;
      }).reduce((sum: number, inst: any) => sum + Number(inst.amount), 0);
      
      // Perdas do mês
      const monthLosses = enrollments.filter((e: any) => {
        const end = new Date(e.end_date);
        return end >= monthStart && end <= monthEnd && 
               (e.status === 'inactive' || e.status === 'expired') &&
               !e.is_dependent;
      }).reduce((sum: number, e: any) => sum + Number(e.plan_price || 0), 0);
      
      evolutionData.push({ mes: label, receita: monthRevenue - monthLosses });
      lossesData.push({ mes: label, receita: monthRevenue, perdas: monthLosses });
    }

    // ========== ANÁLISE DE PERDAS DETALHADA ==========
    const inadimplencia = enrollments.filter((e: any) => e.status === 'inactive' && !e.is_dependent)
      .reduce((sum: number, e: any) => sum + Number(e.plan_price || 0), 0);
    const cancelamentos = enrollments.filter((e: any) => e.status === 'cancelled' && !e.is_dependent)
      .reduce((sum: number, e: any) => sum + Number(e.plan_price || 0), 0);
    const transferencias = enrollments.filter((e: any) => e.status === 'transferred' && !e.is_dependent)
      .reduce((sum: number, e: any) => sum + Number(e.plan_price || 0), 0);
    const outros = enrollments.filter((e: any) => 
      !['inactive', 'cancelled', 'transferred', 'active', 'expired'].includes(e.status) && !e.is_dependent
    ).reduce((sum: number, e: any) => sum + Number(e.plan_price || 0), 0);
    
    const totalPerdas = inadimplencia + cancelamentos + transferencias + outros;
    const perdasBreakdown = [
      { categoria: 'Inadimplência', valor: inadimplencia, percentual: totalPerdas > 0 ? (inadimplencia / totalPerdas) * 100 : 0, cor: 'red' },
      { categoria: 'Cancelamentos', valor: cancelamentos, percentual: totalPerdas > 0 ? (cancelamentos / totalPerdas) * 100 : 0, cor: 'orange' },
      { categoria: 'Transferências', valor: transferencias, percentual: totalPerdas > 0 ? (transferencias / totalPerdas) * 100 : 0, cor: 'blue' },
      { categoria: 'Outros', valor: outros, percentual: totalPerdas > 0 ? (outros / totalPerdas) * 100 : 0, cor: 'gray' },
    ];

    // ========== DISTRIBUIÇÃO POR PLANOS (DINÂMICA) ==========
    const planCounts: Record<string, { assinantes: number; receita: number }> = {};
    const colors = ['blue', 'green', 'red', 'purple', 'orange', 'cyan', 'pink', 'yellow'];
    
    enrollments.filter((e: any) => e.status === 'active' && !e.is_dependent).forEach((e: any) => {
      const planName = e.plan_name || 'Sem plano';
      if (!planCounts[planName]) {
        planCounts[planName] = { assinantes: 0, receita: 0 };
      }
      planCounts[planName].assinantes++;
      planCounts[planName].receita += Number(e.plan_price || 0);
    });
    
    const distribuicaoPlanos = Object.entries(planCounts).map(([plano, data], index) => ({
      plano,
      assinantes: data.assinantes,
      receita: data.receita,
      cor: colors[index % colors.length],
    }));

    // ========== MÉTRICAS ADICIONAIS ==========
    const ticketMedio = activeStudents.length > 0 ? totalRevenue / activeStudents.length : 0;
    
    const novosClientes = allStudents.filter((s: any) => {
      const created = new Date(s.created_at);
      return created >= currentMonthStart && created <= currentMonthEnd;
    }).length;
    
    const cancelamentosDefinitivos = enrollments.filter((e: any) => e.status === 'cancelled' && !e.is_dependent).length;
    const taxaPerda = allStudents.length > 0 ? (cancelamentosDefinitivos / allStudents.length) * 100 : 0;
    const taxaRetencao = allStudents.length > 0 ? (activeSubscriptions / allStudents.length) * 100 : 0;

    // ========== RESPONSE ==========
    return new Response(
      JSON.stringify({
        cards: {
          receita_mensal: {
            valor: monthlyRevenue,
            crescimento: monthlyGrowth,
            cor: monthlyGrowth >= 0 ? 'green' : 'red',
          },
          receita_total: {
            valor: totalRevenue,
            tendencia: 'Desde o início',
          },
          perdas_mensais: {
            valor: monthlyLosses,
            percentual: lossRate,
            cor: monthlyLosses > 0 ? 'red' : 'green',
          },
          assinaturas_ativas: {
            valor: activeSubscriptions,
          },
        },
        evolucao_financeira: evolutionData,
        receitas_vs_perdas: lossesData,
        perdas_breakdown: perdasBreakdown,
        distribuicao_planos: distribuicaoPlanos,
        metricas_adicionais: {
          ticket_medio: ticketMedio,
          taxa_retencao: taxaRetencao,
          novos_clientes_mes: novosClientes,
          taxa_perda: taxaPerda,
        },
        metricas_parcelas: {
          a_receber_este_mes: aReceberEsteMes,
          a_receber_proximos_7_dias: aReceberProximos7Dias,
          total_pendente: totalPendente,
          total_atrasado: totalAtrasado,
          total_pendentes_atrasadas: totalPendentesAtrasadas,
          receita_recebida_mes: receitaRecebidaEsteMes,
          parcelas_atrasadas: parcelasAtrasadas,
          parcelas_pendentes_atrasadas: parcelasPendentesAtrasadas.length,
          taxa_inadimplencia: taxaInadimplencia,
        },
        despesas_fixas: {
          total_mensal: totalMonthlyExpenses,
          total_periodo: totalExpensesForPeriod,
          detalhamento: expenses.map((e: any) => ({
            nome: e.name,
            valor: Number(e.amount),
            vencimento: e.due_day,
            categoria: e.category || 'Geral'
          }))
        },
        lucro_liquido: {
          valor: netProfit,
          margem: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro no dashboard financeiro:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao processar dados financeiros',
        code: 'INTERNAL_ERROR'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
