
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Settings, User, Bell, Shield, Database, Lock, KeyRound } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { usePasswordManager } from '@/hooks/usePasswordManager';

const SettingsSection = () => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [restrictedPasswordForm, setRestrictedPasswordForm] = useState({
    financePassword: '',
    configPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUpdatingRestrictedPasswords, setIsUpdatingRestrictedPasswords] = useState(false);

  const { updatePassword } = usePasswordManager();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword) {
      toast({
        title: "Erro",
        description: "A senha atual é obrigatória.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "A nova senha e a confirmação não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    
    // Simular verificação da senha atual
    setTimeout(() => {
      if (passwordForm.currentPassword === 'admin') {
        toast({
          title: "Sucesso",
          description: "Senha alterada com sucesso!",
        });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast({
          title: "Erro",
          description: "Senha atual incorreta.",
          variant: "destructive",
        });
      }
      setIsChangingPassword(false);
    }, 1500);
  };

  const handleRestrictedPasswordsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restrictedPasswordForm.financePassword && !restrictedPasswordForm.configPassword) {
      toast({
        title: "Erro",
        description: "Preencha pelo menos uma senha para atualizar.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingRestrictedPasswords(true);
    
    try {
      let success = true;

      // Atualizar senha do financeiro se fornecida
      if (restrictedPasswordForm.financePassword) {
        if (restrictedPasswordForm.financePassword.length < 6) {
          toast({
            title: "Erro",
            description: "A senha do financeiro deve ter pelo menos 6 caracteres.",
            variant: "destructive",
          });
          setIsUpdatingRestrictedPasswords(false);
          return;
        }

        const financeResult = await updatePassword('financeiro', restrictedPasswordForm.financePassword);
        if (!financeResult) success = false;
      }

      // Atualizar senha das configurações se fornecida
      if (restrictedPasswordForm.configPassword) {
        if (restrictedPasswordForm.configPassword.length < 6) {
          toast({
            title: "Erro",
            description: "A senha das configurações deve ter pelo menos 6 caracteres.",
            variant: "destructive",
          });
          setIsUpdatingRestrictedPasswords(false);
          return;
        }

        const configResult = await updatePassword('configuracoes', restrictedPasswordForm.configPassword);
        if (!configResult) success = false;
      }

      if (success) {
        setRestrictedPasswordForm({ financePassword: '', configPassword: '' });
        toast({
          title: "Sucesso",
          description: "Senhas de acesso atualizadas com sucesso!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar senhas.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRestrictedPasswords(false);
    }
  };

  const handleSaveSettings = () => {
    toast({
      title: "Sucesso",
      description: "Configurações salvas com sucesso!",
    });
  };

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
            <Button 
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
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
          
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              Atualizar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Lock className="h-5 w-5" />
            <span>Alterar Senha de Login</span>
          </CardTitle>
          <CardDescription>
            Altere sua senha de acesso ao sistema (requer senha atual)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="h-12"
                />
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Atenção:</strong> Para alterar sua senha, você deve inserir sua senha atual. 
                A nova senha deve ter pelo menos 6 caracteres.
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit"
                disabled={isChangingPassword}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Restricted Areas Password Management */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <KeyRound className="h-5 w-5" />
            <span>Senhas para Áreas Restritas</span>
          </CardTitle>
          <CardDescription>
            Altere as senhas de acesso ao módulo financeiro e configurações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRestrictedPasswordsUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="financePassword">Nova Senha - Módulo Financeiro</Label>
                <Input
                  id="financePassword"
                  type="password"
                  placeholder="••••••••"
                  value={restrictedPasswordForm.financePassword}
                  onChange={(e) => setRestrictedPasswordForm(prev => ({ ...prev, financePassword: e.target.value }))}
                  className="h-12"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Deixe em branco para manter a senha atual
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="configPassword">Nova Senha - Configurações</Label>
                <Input
                  id="configPassword"
                  type="password"
                  placeholder="••••••••"
                  value={restrictedPasswordForm.configPassword}
                  onChange={(e) => setRestrictedPasswordForm(prev => ({ ...prev, configPassword: e.target.value }))}
                  className="h-12"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Deixe em branco para manter a senha atual
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="font-medium text-blue-800 dark:text-blue-200">Senhas Padrão Atuais</div>
              <div className="text-sm text-blue-600 dark:text-blue-300 mt-1 space-y-1">
                <div><strong>Financeiro:</strong> financeiro123</div>
                <div><strong>Configurações:</strong> configuracao123</div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit"
                disabled={isUpdatingRestrictedPasswords}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isUpdatingRestrictedPasswords ? 'Atualizando...' : 'Atualizar Senhas de Acesso'}
              </Button>
            </div>
          </form>
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
