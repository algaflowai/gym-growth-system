
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Settings, User, Bell, Shield, Database } from 'lucide-react';

const SettingsSection = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Configurações</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Gerencie as configurações do sistema</p>
      </div>

      {/* System Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Settings className="h-5 w-5" />
            <span>Configurações do Sistema</span>
          </CardTitle>
          <CardDescription>
            Configurações gerais do AlgaGymManager
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gymName">Nome da Academia</Label>
              <Input
                id="gymName"
                placeholder="AlgaGym Academia"
                defaultValue="AlgaGym Academia"
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gymPhone">Telefone</Label>
              <Input
                id="gymPhone"
                placeholder="(11) 99999-9999"
                defaultValue="(11) 99999-9999"
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gymEmail">Email da Academia</Label>
              <Input
                id="gymEmail"
                type="email"
                placeholder="contato@algagym.com"
                defaultValue="contato@algagym.com"
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gymAddress">Endereço</Label>
              <Input
                id="gymAddress"
                placeholder="Rua das Academias, 123"
                defaultValue="Rua das Academias, 123"
                className="h-12"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <User className="h-5 w-5" />
            <span>Configurações do Usuário</span>
          </CardTitle>
          <CardDescription>
            Gerencie sua conta e preferências
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="userName">Nome do Usuário</Label>
              <Input
                id="userName"
                placeholder="Administrador"
                defaultValue="Administrador"
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userEmail">Email do Usuário</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="admin@algagym.com"
                defaultValue="admin@algagym.com"
                className="h-12"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 dark:text-white">Alterar Senha</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  className="h-12"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              Atualizar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Bell className="h-5 w-5" />
            <span>Preferências</span>
          </CardTitle>
          <CardDescription>
            Configure suas preferências do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div className="font-medium">Tema do Sistema</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Alternar entre tema claro e escuro</div>
              </div>
              <ThemeToggle />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div className="font-medium">Notificações de Email</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Receber notificações por email</div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div className="font-medium">Alertas de Vencimento</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Alertas de matrículas vencendo</div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div className="font-medium">Relatórios Automáticos</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Envio automático de relatórios mensais</div>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Shield className="h-5 w-5" />
            <span>Segurança</span>
          </CardTitle>
          <CardDescription>
            Configurações de segurança do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restrictedPassword">Senha para Áreas Restritas</Label>
              <Input
                id="restrictedPassword"
                type="password"
                placeholder="••••••••"
                defaultValue="admin123"
                className="h-12"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Senha para acessar o módulo financeiro e configurações
              </p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div className="font-medium">Autenticação de Dois Fatores</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Adicione uma camada extra de segurança</div>
              </div>
              <Switch />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              Salvar Configurações de Segurança
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Database className="h-5 w-5" />
            <span>Gerenciamento de Dados</span>
          </CardTitle>
          <CardDescription>
            Backup e gerenciamento dos dados do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-12">
              Fazer Backup dos Dados
            </Button>
            
            <Button variant="outline" className="h-12">
              Exportar Relatórios
            </Button>
          </div>
          
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="font-medium text-yellow-800 dark:text-yellow-200">Área de Risco</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
              As ações abaixo são irreversíveis. Use com cautela.
            </div>
            <div className="mt-4 space-x-2">
              <Button variant="destructive" size="sm">
                Limpar Cache do Sistema
              </Button>
              <Button variant="destructive" size="sm">
                Reset Configurações
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection;
