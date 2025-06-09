
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
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
  );
};

export default Login;
