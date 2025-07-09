
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
    const { studentData } = await req.json();
    
    if (!studentData) {
      return new Response(
        JSON.stringify({ error: 'Dados do aluno são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      // Retorna uma recomendação básica se não houver chave da OpenAI
      const basicRecommendation = `
RECOMENDAÇÃO DE TREINO PERSONALIZADA
=====================================

ALUNO: ${studentData.name}
OBJETIVO: ${studentData.main_goal || 'Condicionamento físico geral'}
GÊNERO: ${studentData.gender || 'Não informado'}

📋 ANÁLISE DO PERFIL:
- Aluno com foco em ${studentData.main_goal || 'condicionamento físico geral'}
- Considerações especiais: ${studentData.health_issues || 'Nenhuma'}
- Restrições: ${studentData.restrictions || 'Nenhuma'}

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

    // Prompt personalizado conforme especificado
    const customPrompt = `Crie um treino personalizado com base nas informações do aluno: objetivo, restrições físicas ou lesões, e gênero. Para treinos femininos, dê mais foco a membros inferiores; para masculinos, priorize membros superiores.

Dados do aluno:
- Nome: ${studentData.name}
- Gênero: ${studentData.gender || 'Não informado'}
- Objetivo: ${studentData.main_goal || 'Condicionamento físico geral'}
- Restrições/Lesões: ${studentData.restrictions || 'Nenhuma'}
- Problemas de saúde: ${studentData.health_issues || 'Nenhum'}
- Idade: ${studentData.age || 'Não informada'}

Formato da resposta:
1. ANÁLISE DO PERFIL
2. PROGRAMA SEMANAL DETALHADO (3-4 treinos)
3. EXERCÍCIOS ESPECÍFICOS (séries, repetições, descanso)
4. CONSIDERAÇÕES ESPECIAIS
5. DICAS DE NUTRIÇÃO BÁSICAS

Seja específico e prático, considerando o gênero para a divisão de treinos conforme solicitado.`;

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
            content: 'Você é um personal trainer especializado e experiente. Crie treinos personalizados, detalhados e seguros baseados nas informações fornecidas. Para treinos femininos, priorize membros inferiores (pernas, glúteos). Para treinos masculinos, priorize membros superiores (peito, costas, ombros, braços).' 
          },
          { 
            role: 'user', 
            content: customPrompt 
          }
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
