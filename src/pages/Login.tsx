
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Users, CreditCard, BarChart3, Brain, Shield, Clock, Check, Crown, Zap, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onForgotPassword?: () => void;
  onShowSignup?: () => void;
}

const Login = ({ onLogin, onForgotPassword, onShowSignup }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPricing, setShowPricing] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Credenciais inválidas",
            description: "E-mail ou senha incorretos. Tente novamente.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        onLogin(email, password);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        toast({
          title: "Erro no login com Google",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no login com Google:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer login com Google. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      alert('Funcionalidade de recuperação de senha em desenvolvimento. Entre em contato com o administrador.');
    }
  };

  const handleSubscribe = async (planId: string) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A integração com pagamento será implementada em breve.",
    });
  };

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

  const features = [
    {
      icon: Users,
      title: 'Gestão de Alunos',
      description: 'Controle completo de matrículas e dados dos alunos'
    },
    {
      icon: CreditCard,
      title: 'Financeiro',
      description: 'Relatórios financeiros e controle de pagamentos'
    },
    {
      icon: BarChart3,
      title: 'Relatórios',
      description: 'Dashboards e análises detalhadas'
    },
    {
      icon: Brain,
      title: 'IA Trainer',
      description: 'Recomendações de treino personalizadas com IA'
    },
    {
      icon: Shield,
      title: 'Segurança',
      description: 'Dados protegidos e acesso controlado'
    },
    {
      icon: Clock,
      title: '24/7 Disponível',
      description: 'Acesso ao sistema a qualquer momento'
    }
  ];

  if (showPricing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <div className="text-white font-bold text-2xl">AG</div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
              AlgaGymManager
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Escolha seu plano e transforme a gestão da sua academia
            </p>
          </div>

          {/* Pricing Plans */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
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
                      className={`w-full h-12 bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold transition-all duration-200`}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-3">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA to Login */}
          <div className="text-center">
            <Button
              onClick={() => setShowPricing(false)}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Continuar para Login
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Todos os planos incluem suporte técnico e atualizações regulares
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-screen">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg">
                <div className="text-white font-bold text-2xl">AG</div>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  AlgaGymManager
                </CardTitle>
                <CardDescription className="text-lg mt-2 text-gray-600 dark:text-gray-300">
                  Sistema de Gestão de Academia
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@algagym.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base border-2 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base border-2 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Acessar Sistema'}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Ou</span>
                </div>
              </div>
              
              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full h-12 text-base border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Entrar com Google</span>
                </div>
              </Button>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ainda não tem conta?{' '}
                  <button
                    onClick={onShowSignup}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors duration-200"
                  >
                    Cadastre-se
                  </button>
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Desenvolvido para gestão profissional de academias
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
