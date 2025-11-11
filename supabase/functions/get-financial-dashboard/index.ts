import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getMonthYear(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { academia_id, user_id } = await req.json();
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id é obrigatório' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Buscar alunos do usuário
    const studentsRes = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/students?user_id=eq.${user_id}&status=eq.active`,
      {
        headers: {
          apikey: Deno.env.get('SUPABASE_ANON_KEY'),
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
      }
    );
    const students = await studentsRes.json();

    // Buscar matrículas do usuário
    const enrollmentsRes = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/enrollments?user_id=eq.${user_id}`,
      {
        headers: {
          apikey: Deno.env.get('SUPABASE_ANON_KEY'),
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
          apikey: Deno.env.get('SUPABASE_ANON_KEY'),
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
      }
    );
    const installments = await installmentsRes.json();

    // Receita Total
    const totalRevenue = enrollments.reduce((sum, e) => sum + Number(e.plan_price || 0), 0);

    // Receita Mensal (mês atual)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyRevenue = enrollments.filter(e => {
      const start = new Date(e.start_date);
      return start.getMonth() === currentMonth && start.getFullYear() === currentYear && e.status === 'active';
    }).reduce((sum, e) => sum + Number(e.plan_price || 0), 0);

    // Receita Mensal do mês anterior
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthlyRevenue = enrollments.filter(e => {
      const start = new Date(e.start_date);
      return start.getMonth() === prevMonth && start.getFullYear() === prevYear && e.status === 'active';
    }).reduce((sum, e) => sum + Number(e.plan_price || 0), 0);

    // Percentual de crescimento
    const monthlyGrowth = prevMonthlyRevenue > 0 ? ((monthlyRevenue - prevMonthlyRevenue) / prevMonthlyRevenue) * 100 : 0;

    // Assinaturas Ativas
    const activeSubscriptions = enrollments.filter(e => e.status === 'active').length;

    // Perdas Mensais (matrículas inativas ou expiradas do mês atual)
    const monthlyLosses = enrollments.filter(e => {
      const end = new Date(e.end_date);
      return end.getMonth() === currentMonth && end.getFullYear() === currentYear && (e.status === 'inactive' || e.status === 'expired');
    }).reduce((sum, e) => sum + Number(e.plan_price || 0), 0);

    // Percentual de perdas vs receita total
    const lossRate = totalRevenue > 0 ? (monthlyLosses / totalRevenue) * 100 : 0;

    // Gráfico de evolução financeira (últimos 6 meses)
    const months = [];
    const evolutionData = [];
    const lossesData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const label = `${d.toLocaleString('pt-BR', { month: 'short' })}/${String(year).slice(-2)}`;
      months.push(label);
      // Receita do mês
      const monthRevenue = enrollments.filter(e => {
        const start = new Date(e.start_date);
        return start.getMonth() === month && start.getFullYear() === year && e.status === 'active';
      }).reduce((sum, e) => sum + Number(e.plan_price || 0), 0);
      // Perdas do mês
      const monthLosses = enrollments.filter(e => {
        const end = new Date(e.end_date);
        return end.getMonth() === month && end.getFullYear() === year && (e.status === 'inactive' || e.status === 'expired');
      }).reduce((sum, e) => sum + Number(e.plan_price || 0), 0);
      evolutionData.push({ mes: label, receita: monthRevenue - monthLosses });
      lossesData.push({ mes: label, receita: monthRevenue, perdas: monthLosses });
    }

    // Análise de perdas detalhada
    const inadimplencia = enrollments.filter(e => e.status === 'inactive').reduce((sum, e) => sum + Number(e.plan_price || 0), 0);
    const cancelamentos = enrollments.filter(e => e.status === 'cancelled').reduce((sum, e) => sum + Number(e.plan_price || 0), 0);
    const transferencias = enrollments.filter(e => e.status === 'transferred').reduce((sum, e) => sum + Number(e.plan_price || 0), 0);
    const outros = enrollments.filter(e => ['inactive', 'cancelled', 'transferred', 'active', 'expired'].indexOf(e.status) === -1).reduce((sum, e) => sum + Number(e.plan_price || 0), 0);
    const totalPerdas = inadimplencia + cancelamentos + transferencias + outros;
    const perdasBreakdown = [
      { categoria: 'Inadimplência', valor: inadimplencia, percentual: totalPerdas > 0 ? (inadimplencia / totalPerdas) * 100 : 0, cor: 'red' },
      { categoria: 'Cancelamentos', valor: cancelamentos, percentual: totalPerdas > 0 ? (cancelamentos / totalPerdas) * 100 : 0, cor: 'orange' },
      { categoria: 'Transferências', valor: transferencias, percentual: totalPerdas > 0 ? (transferencias / totalPerdas) * 100 : 0, cor: 'blue' },
      { categoria: 'Outros', valor: outros, percentual: totalPerdas > 0 ? (outros / totalPerdas) * 100 : 0, cor: 'gray' },
    ];

    // Distribuição por planos
    const planos = [
      { nome: 'Mensal', cor: 'blue' },
      { nome: 'Trimestral', cor: 'green' },
      { nome: 'Anual', cor: 'red' },
    ];
    const distribuicaoPlanos = planos.map(plano => {
      const assinantes = enrollments.filter(e => e.plan_name && e.plan_name.toLowerCase().includes(plano.nome.toLowerCase())).length;
      const receita = enrollments.filter(e => e.plan_name && e.plan_name.toLowerCase().includes(plano.nome.toLowerCase())).reduce((sum, e) => sum + Number(e.plan_price || 0), 0);
      return {
        plano: plano.nome,
        assinantes,
        receita,
        cor: plano.cor,
      };
    });

    // Métricas adicionais
    // Ticket médio: receita total / alunos ativos
    const ticketMedio = students.length > 0 ? totalRevenue / students.length : 0;
    // Novos clientes/mês: alunos criados no mês atual
    const novosClientes = students.filter(s => {
      const created = new Date(s.created_at);
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
    }).length;
    // Taxa de perda: cancelamentos definitivos / total de alunos
    const cancelamentosDefinitivos = enrollments.filter(e => e.status === 'cancelled').length;
    const taxaPerda = students.length > 0 ? (cancelamentosDefinitivos / students.length) * 100 : 0;
    // Taxa de retenção: (alunos que permaneceram / total inicial) x 100 (simplificado: ativos / total)
    const taxaRetencao = students.length > 0 ? (activeSubscriptions / students.length) * 100 : 0;

    // Métricas de parcelas
    const totalAPagar = installments.filter(i => i.status === 'pending').reduce((sum, i) => sum + Number(i.amount), 0);
    const totalAtrasado = installments.filter(i => i.status === 'overdue').reduce((sum, i) => sum + Number(i.amount), 0);
    const totalPagoMes = installments.filter(i => {
      if (i.status !== 'paid' || !i.paid_date) return false;
      const paidDate = new Date(i.paid_date);
      return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear;
    }).reduce((sum, i) => sum + Number(i.amount), 0);
    const parcelasAtrasadas = installments.filter(i => i.status === 'overdue').length;
    const taxaInadimplencia = totalAPagar > 0 ? (totalAtrasado / (totalAPagar + totalAtrasado)) * 100 : 0;

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
          total_a_pagar: totalAPagar,
          total_atrasado: totalAtrasado,
          total_pago_mes: totalPagoMes,
          parcelas_atrasadas: parcelasAtrasadas,
          taxa_inadimplencia: taxaInadimplencia,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
