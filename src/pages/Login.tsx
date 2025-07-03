
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Users, CreditCard, BarChart3, Brain, Shield, Clock } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onForgotPassword?: () => void;
}

const Login = ({ onLogin, onForgotPassword }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onLogin(email, password);
      setIsLoading(false);
    }, 1000);
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      alert('Funcionalidade de recuperação de senha em desenvolvimento. Entre em contato com o administrador.');
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Login Form */}
          <div className="flex justify-center">
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
                
                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Desenvolvido para gestão profissional de academias
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Recursos do Sistema
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Tudo que você precisa para gerenciar sua academia
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
