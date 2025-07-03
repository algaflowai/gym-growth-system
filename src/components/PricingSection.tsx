
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const PricingSection = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const plans = [
    {
      id: 'trial',
      name: 'Teste Gratuito',
      price: 'R$ 0,00',
      period: '30 dias',
      description: 'Experimente todas as funcionalidades',
      icon: Zap,
      color: 'from-green-500 to-emerald-600',
      features: [
        'Até 50 alunos',
        'Gestão básica de matrículas',
        'Relatórios simples',
        'Suporte por email',
        'Acesso por 30 dias'
      ],
      buttonText: 'Começar Teste Gratuito',
      popular: false
    },
    {
      id: 'monthly',
      name: 'Plano Mensal',
      price: 'R$ 79,90',
      period: 'por mês',
      description: 'Ideal para academias pequenas e médias',
      icon: Crown,
      color: 'from-blue-500 to-purple-600',
      features: [
        'Alunos ilimitados',
        'Gestão completa de matrículas',
        'Relatórios avançados',
        'IA Trainer para recomendações',
        'Suporte prioritário',
        'Backup automático',
        'Integração com sistemas'
      ],
      buttonText: 'Assinar Mensalmente',
      popular: true
    },
    {
      id: 'annual',
      name: 'Plano Anual',
      price: 'R$ 54,00',
      period: 'por mês',
      originalPrice: 'R$ 79,90',
      description: 'Melhor custo-benefício',
      icon: Star,
      color: 'from-purple-500 to-pink-600',
      features: [
        'Tudo do plano mensal',
        '32% de desconto',
        'Consultoria gratuita',
        'Personalização avançada',
        'Suporte VIP 24/7',
        'Treinamento da equipe',
        'Atualizações prioritárias'
      ],
      buttonText: 'Assinar Anualmente',
      popular: false,
      savings: 'Economize R$ 310,80/ano'
    }
  ];

  const handleSubscribe = async (planId: string) => {
    setIsLoading(planId);
    
    try {
      // Simulação de integração com Stripe
      toast({
        title: "Redirecionando...",
        description: "Você será redirecionado para o pagamento.",
      });
      
      // Aqui seria feita a integração real com Stripe
      setTimeout(() => {
        toast({
          title: "Funcionalidade em desenvolvimento",
          description: "A integração com Stripe será implementada em breve.",
        });
        setIsLoading(null);
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao processar assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a assinatura. Tente novamente.",
        variant: "destructive",
      });
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Escolha seu Plano
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Selecione o plano ideal para sua academia e comece a transformar sua gestão hoje mesmo
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''} hover:shadow-xl transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                    MAIS POPULAR
                  </div>
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {plan.description}
                </CardDescription>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        {plan.originalPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{plan.period}</p>
                  {plan.savings && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {plan.savings}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading === plan.id}
                  className={`w-full h-12 bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold transition-all duration-200`}
                >
                  {isLoading === plan.id ? 'Processando...' : plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Todos os planos incluem suporte técnico e atualizações regulares
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cancele a qualquer momento • Sem taxas ocultas • Pagamento seguro
        </p>
      </div>
    </div>
  );
};

export default PricingSection;
