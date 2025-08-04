
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Check, Crown, Zap, Star, Users, BarChart3, Smartphone, Shield, Calendar, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  durationDays: number;
  active: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status and redirect accordingly
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setLoading(false);

      // If user is authenticated, redirect to dashboard
      if (session) {
        navigate('/');
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        
        // Redirect authenticated users to dashboard
        if (session) {
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

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
        'Suporte por email'
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
        'Gestão completa',
        'Relatórios avançados',
        'IA Trainer'
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
        'Suporte VIP 24/7'
      ],
      buttonText: 'Assinar Anualmente',
      popular: false,
      savings: 'Economize R$ 310,80/ano'
    }
  ];

  const features = [
    {
      icon: Users,
      title: 'Gestão Completa de Alunos',
      description: 'Cadastro, histórico e acompanhamento personalizado de cada aluno'
    },
    {
      icon: BarChart3,
      title: 'Relatórios Inteligentes',
      description: 'Análises detalhadas de performance e crescimento da sua academia'
    },
    {
      icon: Smartphone,
      title: 'Acesso Mobile',
      description: 'Gerencie sua academia de qualquer lugar com nossa interface responsiva'
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Seus dados protegidos com criptografia de nível empresarial'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // This is now a presentation page for unauthenticated users
  return (
    <ThemeProvider defaultTheme="light" storageKey="algagym-ui-theme">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
                <img 
                  src="/lovable-uploads/19a3b703-3706-4ccb-9561-29eacc5d0f04.png" 
                  alt="AlgaGymManager Logo" 
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-orbitron font-bold text-gray-800 dark:text-white">AlgaGymManager</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Sistema Completo de Gestão para Academias</p>
              </div>
              <div className="flex sm:absolute sm:top-6 sm:right-6">
                <ThemeToggle />
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                onClick={() => navigate('/login')}
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg"
              >
                Entrar na Plataforma
              </Button>
              <Button 
                onClick={() => navigate('/signup')}
                variant="outline"
                className="h-12 px-8 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold text-lg"
              >
                Criar Conta Grátis
              </Button>
            </div>
          </div>

          {/* Features Section */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-8">
              Por que escolher o <span className="font-orbitron">AlgaGymManager</span>?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Plans Section */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Escolha seu Plano
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Selecione o plano ideal para sua academia e comece a transformar sua gestão hoje mesmo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto px-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card 
                  key={plan.id} 
                  className={`relative overflow-hidden ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''} hover:shadow-xl transition-all duration-300`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-xs sm:text-sm font-semibold">
                        MAIS POPULAR
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    
                    <CardTitle className="text-xl sm:text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
                      {plan.description}
                    </CardDescription>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                          {plan.price}
                        </span>
                        {plan.originalPrice && (
                          <span className="text-base sm:text-lg text-gray-500 line-through">
                            {plan.originalPrice}
                          </span>
                        )}
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{plan.period}</p>
                      {plan.savings && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          {plan.savings}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 sm:space-y-6">
                    <ul className="space-y-2 sm:space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      onClick={() => navigate('/signup')}
                      className={`w-full h-10 sm:h-12 bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold text-sm sm:text-base transition-all duration-200 transform hover:scale-105`}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Pronto para revolucionar sua academia?
            </h3>
            <Button 
              onClick={() => navigate('/signup')}
              className="h-12 px-8 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold text-lg"
            >
              Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
