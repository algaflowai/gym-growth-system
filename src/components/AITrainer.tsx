
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, User, Target, Zap, AlertCircle } from 'lucide-react';
import { useStudents, Student } from '@/hooks/useStudents';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const AITrainer = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [recommendation, setRecommendation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { students, loading } = useStudents();
  const { toast } = useToast();

  const handleGenerateRecommendation = async () => {
    if (!selectedStudent) {
      toast({
        title: "Erro",
        description: "Selecione um aluno primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Preparar dados do aluno com informações mais completas
      const studentData = {
        name: selectedStudent.name,
        gender: selectedStudent.gender || 'Não informado',
        main_goal: selectedStudent.main_goal || 'Condicionamento físico geral',
        health_issues: selectedStudent.health_issues || 'Nenhum',
        restrictions: selectedStudent.restrictions || 'Nenhuma',
        age: selectedStudent.birth_date ? 
          new Date().getFullYear() - new Date(selectedStudent.birth_date).getFullYear() : 
          'Não informada'
      };

      // Chamar a edge function atualizada (sem prompt customizado, pois agora é gerado na função)
      const response = await supabase.functions.invoke('generate-workout', {
        body: { studentData }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setRecommendation(response.data.recommendation || 'Recomendação gerada com sucesso!');
      
      toast({
        title: "Sucesso!",
        description: "Recomendação de treino gerada com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao gerar recomendação:', error);
      
      // Fallback com recomendação básica
      const basicRecommendation = `
RECOMENDAÇÃO DE TREINO PERSONALIZADA
=====================================

ALUNO: ${selectedStudent.name}
OBJETIVO: ${selectedStudent.main_goal || 'Condicionamento físico geral'}

📋 ANÁLISE DO PERFIL:
- Aluno com foco em ${selectedStudent.main_goal || 'condicionamento físico geral'}
- Considerações especiais: ${selectedStudent.health_issues || 'Nenhuma'}
- Restrições: ${selectedStudent.restrictions || 'Nenhuma'}

🏋️ PROGRAMA SEMANAL SUGERIDO:

SEGUNDA-FEIRA - TREINO A (Peito, Tríceps, Ombros)
• Supino reto: 3x10-12
• Supino inclinado: 3x10-12  
• Crucifixo: 3x12-15
• Desenvolvimento: 3x10-12
• Tríceps testa: 3x12-15
• Tríceps na polia: 3x12-15

QUARTA-FEIRA - TREINO B (Costas, Bíceps)
• Puxada frontal: 3x10-12
• Remada curvada: 3x10-12
• Remada unilateral: 3x10-12
• Rosca direta: 3x12-15
• Rosca martelo: 3x12-15
• Rosca concentrada: 3x12-15

SEXTA-FEIRA - TREINO C (Pernas, Glúteos)
• Agachamento: 3x12-15
• Leg press: 3x15-20
• Extensora: 3x15-20
• Flexora: 3x15-20
• Panturrilha: 4x20-25
• Glúteo quatro apoios: 3x15-20

⚠️ OBSERVAÇÕES IMPORTANTES:
- Sempre realizar aquecimento de 10 minutos
- Alongamento ao final de cada treino
- Hidratação constante durante o exercício
- Progressão gradual de cargas
- Respeitar os dias de descanso

💡 DICAS NUTRICIONAIS:
- Manter hidratação adequada (35ml/kg peso)
- Consumir proteínas em todas as refeições
- Carboidratos antes do treino para energia
- Proteína pós-treino para recuperação

Esta é uma recomendação básica. Para análise mais detalhada, configure a integração com OpenAI.
      `;
      
      setRecommendation(basicRecommendation);
      
      toast({
        title: "Aviso",
        description: "Recomendação básica gerada. Configure OpenAI para análises mais detalhadas.",
        variant: "default",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setSelectedStudent(student || null);
    setRecommendation(''); // Limpar recomendação anterior
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Carregando alunos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-full p-3">
            <Brain className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          IA Trainer
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Gere recomendações de treino personalizadas com inteligência artificial
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Seleção de Aluno */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Seleção de Aluno
            </CardTitle>
            <CardDescription>
              Escolha o aluno para gerar a recomendação personalizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select onValueChange={handleStudentSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um aluno..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedStudent && (
              <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {selectedStudent.name}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span><strong>Objetivo:</strong> {selectedStudent.main_goal || 'Não informado'}</span>
                  </div>
                  {selectedStudent.health_issues && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span><strong>Problemas de saúde:</strong> {selectedStudent.health_issues}</span>
                    </div>
                  )}
                  {selectedStudent.restrictions && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span><strong>Restrições:</strong> {selectedStudent.restrictions}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={handleGenerateRecommendation}
              disabled={!selectedStudent || isGenerating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {isGenerating ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Gerando Recomendação...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Gerar Recomendação
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recomendação Gerada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Recomendação Personalizada
            </CardTitle>
            <CardDescription>
              Treino gerado especificamente para o aluno selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendation ? (
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Recomendação Gerada
                </Badge>
                <Textarea
                  value={recommendation}
                  readOnly
                  className="min-h-[400px] text-sm"
                />
                <Button
                  onClick={() => navigator.clipboard.writeText(recommendation)}
                  variant="outline"
                  className="w-full"
                >
                  Copiar Recomendação
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um aluno e clique em "Gerar Recomendação" para começar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                Sobre a IA Trainer
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Esta funcionalidade utiliza inteligência artificial avançada para gerar recomendações de treino personalizadas.
                O sistema considera o gênero do aluno para criar treinos específicos: <strong>treinos femininos</strong> focam em membros inferiores, 
                <strong>treinos masculinos</strong> priorizam membros superiores. Configure a integração com OpenAI para análises mais detalhadas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AITrainer;
