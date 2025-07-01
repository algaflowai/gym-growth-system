
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, studentData } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      // Retorna uma recomendação básica se não houver chave da OpenAI
      const basicRecommendation = `
RECOMENDAÇÃO DE TREINO PERSONALIZADA
=====================================

ALUNO: ${studentData.name}
OBJETIVO: ${studentData.goal}
IDADE: ${studentData.age} anos

📋 ANÁLISE DO PERFIL:
- Aluno com foco em ${studentData.goal}
- Considerações especiais: ${studentData.healthIssues}
- Restrições: ${studentData.restrictions}

🏋️ PROGRAMA SEMANAL SUGERIDO:

SEGUNDA-FEIRA - TREINO A (Peito, Tríceps, Ombros)
• Supino reto: 3x10-12
• Supino inclinado: 3x10-12  
• Crucifixo: 3x12-15
• Desenvolvimento: 3x10-12
• Tríceps testa: 3x12-15

QUARTA-FEIRA - TREINO B (Costas, Bíceps)
• Puxada frontal: 3x10-12
• Remada curvada: 3x10-12
• Remada unilateral: 3x10-12
• Rosca direta: 3x12-15
• Rosca martelo: 3x12-15

SEXTA-FEIRA - TREINO C (Pernas, Glúteos)
• Agachamento: 3x12-15
• Leg press: 3x15-20
• Extensora: 3x15-20
• Flexora: 3x15-20
• Panturrilha: 4x20-25

⚠️ OBSERVAÇÕES IMPORTANTES:
- Sempre realizar aquecimento de 10 minutos
- Alongamento ao final de cada treino
- Hidratação constante durante o exercício
- Progressão gradual de cargas

💡 DICAS NUTRICIONAIS:
- Manter hidratação adequada
- Consumir proteínas em todas as refeições
- Carboidratos antes do treino
- Proteína pós-treino para recuperação

Configure a chave da OpenAI para recomendações mais detalhadas e personalizadas.
      `;
      
      return new Response(JSON.stringify({ 
        recommendation: basicRecommendation,
        isBasic: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um personal trainer experiente e especializado em criar programas de treino personalizados. Sempre forneça recomendações seguras, detalhadas e baseadas em evidências científicas.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const recommendation = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      recommendation,
      isBasic: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-workout function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      recommendation: 'Erro ao gerar recomendação. Tente novamente mais tarde.',
      isBasic: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
