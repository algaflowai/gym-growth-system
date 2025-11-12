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

    const { enrollment_id, user_id, student_id, total_amount, total_installments, start_date, payment_day, is_family_plan } = await req.json();

    console.log('📋 Gerando parcelas:', { enrollment_id, user_id, student_id, total_amount, total_installments, payment_day });

    if (!enrollment_id || !user_id || !student_id || !total_amount || !total_installments) {
      throw new Error('Parâmetros obrigatórios faltando');
    }

    // Calcular valor de cada parcela
    const installment_amount = (total_amount / total_installments).toFixed(2);
    
    // Gerar parcelas
    const installments = [];
    const baseDate = start_date ? new Date(start_date) : new Date();
    
    for (let i = 1; i <= total_installments; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));
      
      // Ajustar para o dia específico do mês
      if (payment_day) {
        dueDate.setDate(payment_day);
      }
      
      installments.push({
        user_id,
        enrollment_id,
        student_id,
        installment_number: i,
        total_installments,
        amount: parseFloat(installment_amount),
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending',
        is_family_plan: is_family_plan || false
      });
    }

    // Inserir todas as parcelas
    const { data, error } = await supabase
      .from('payment_installments')
      .insert(installments)
      .select();

    if (error) {
      console.error('❌ Erro ao criar parcelas:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ ${total_installments} parcelas geradas para enrollment ${enrollment_id}`);

    return new Response(JSON.stringify({ success: true, installments: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Log detailed error server-side only
    console.error('❌ Erro ao gerar parcelas:', error);
    
    // Return generic error to client
    return new Response(JSON.stringify({ 
      error: 'Erro ao gerar parcelas',
      code: 'INTERNAL_ERROR'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
