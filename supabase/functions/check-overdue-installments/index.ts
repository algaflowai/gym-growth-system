import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = new Date().toISOString().split('T')[0];

    console.log('🔍 Verificando parcelas vencidas em:', today);

    // Buscar parcelas pendentes vencidas
    const { data: overdueInstallments, error: fetchError } = await supabase
      .from('payment_installments')
      .select('*')
      .eq('status', 'pending')
      .lt('due_date', today);

    if (fetchError) {
      console.error('❌ Erro ao buscar parcelas:', fetchError);
      throw fetchError;
    }

    if (!overdueInstallments || overdueInstallments.length === 0) {
      console.log('✅ Nenhuma parcela atrasada encontrada');
      return new Response(JSON.stringify({ message: 'Nenhuma parcela atrasada encontrada' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`⚠️ Encontradas ${overdueInstallments.length} parcelas atrasadas`);

    // Atualizar status para 'overdue'
    const installmentIds = overdueInstallments.map(i => i.id);
    const { error: updateError } = await supabase
      .from('payment_installments')
      .update({ status: 'overdue' })
      .in('id', installmentIds);

    if (updateError) {
      console.error('❌ Erro ao atualizar parcelas:', updateError);
      throw updateError;
    }

    // Bloquear matrículas
    const enrollmentIds = [...new Set(overdueInstallments.map(i => i.enrollment_id))];
    const { error: enrollmentError } = await supabase
      .from('enrollments')
      .update({ status: 'inactive' })
      .in('id', enrollmentIds);

    if (enrollmentError) {
      console.error('❌ Erro ao bloquear matrículas:', enrollmentError);
    }

    // Bloquear estudantes
    const studentIds = [...new Set(overdueInstallments.map(i => i.student_id))];
    const { error: studentError } = await supabase
      .from('students')
      .update({ status: 'inactive' })
      .in('id', studentIds);

    if (studentError) {
      console.error('❌ Erro ao bloquear estudantes:', studentError);
    }

    console.log(`✅ ${overdueInstallments.length} parcelas marcadas como atrasadas`);
    console.log(`✅ ${enrollmentIds.length} matrículas bloqueadas`);
    console.log(`✅ ${studentIds.length} estudantes bloqueados`);

    return new Response(JSON.stringify({
      overdue_installments: overdueInstallments.length,
      blocked_enrollments: enrollmentIds.length,
      blocked_students: studentIds.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Log detailed error server-side only
    console.error('❌ Erro geral:', error);
    
    // Return generic error to client
    return new Response(JSON.stringify({ 
      error: 'Erro ao processar verificação de parcelas',
      code: 'INTERNAL_ERROR'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
