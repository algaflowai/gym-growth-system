import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Check, Crown, Zap, Star, Users, BarChart3, Smartphone, Shield, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeProvider } from '@/components/ThemeProvider';
import ForgotPassword from '@/components/ForgotPassword';

const AuthLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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
    },
    {
      icon: Calendar,
      title: 'Teste Grátis por 30 dias',
      description: 'Use o aplicativo e explore todas as nossas funcionalidades gratuitamente por 30 dias, sem compromisso.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao AlgaGymManager",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes",
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
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = async (planId: string) => {
    setIsLoadingPlan(planId);
    
    try {
      toast({
        title: "Redirecionando...",
        description: "Você será redirecionado para o pagamento.",
      });
      
      setTimeout(() => {
        toast({
          title: "Funcionalidade em desenvolvimento",
          description: "A integração com Stripe será implementada em breve.",
        });
        setIsLoadingPlan(null);
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao processar assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a assinatura. Tente novamente.",
        variant: "destructive",
      });
      setIsLoadingPlan(null);
    }
  };

  if (showForgotPassword) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="algagym-ui-theme">
        <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />
      </ThemeProvider>
    );
  }

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
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-12 lg:mb-16">
              {/* Login Form */}
              <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
                <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader className="space-y-1 pb-6 sm:pb-8">
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-white">
                      Bem-vindo de volta
                    </CardTitle>
                    <CardDescription className="text-center text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                      Faça login para acessar sua conta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 sm:h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">Senha</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 sm:h-12 pr-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          Esqueceu sua senha?
                        </button>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base sm:text-lg transition-all duration-200 transform hover:scale-105"
                      >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                      </Button>
                    </form>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Ou continue com</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleLogin}
                      className="w-full h-11 sm:h-12 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continuar com Google
                    </Button>

                    <div className="text-center">
                      <span className="text-gray-600 dark:text-gray-300">Não tem uma conta? </span>
                      <Link
                        to="/signup"
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
                      >
                        Cadastre-se aqui
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Features Section */}
              <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-6 sm:mb-8 text-center">
                  Por que escolher o <span className="font-orbitron">AlgaGymManager</span>?
                </h2>
                <div className="grid gap-4 sm:gap-6">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white mb-1 text-sm sm:text-base">{feature.title}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isLoadingPlan === plan.id}
                        className={`w-full h-10 sm:h-12 bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold text-sm sm:text-base transition-all duration-200 transform hover:scale-105`}
                      >
                        {isLoadingPlan === plan.id ? 'Processando...' : plan.buttonText}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AuthLogin;