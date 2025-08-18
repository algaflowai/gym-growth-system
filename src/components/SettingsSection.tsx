
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Settings, Bell, Database, KeyRound } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAccessPasswordManager } from '@/hooks/useAccessPasswordManager';
import { useSystemSettings } from '@/hooks/useSystemSettings';

const SettingsSection = () => {
  const [restrictedPasswordForm, setRestrictedPasswordForm] = useState({
    financePassword: '',
    configPassword: ''
  });
  const [isUpdatingRestrictedPasswords, setIsUpdatingRestrictedPasswords] = useState(false);
  const [systemForm, setSystemForm] = useState({
    gym_name: '',
    gym_email: '',
    gym_phone: '',
    gym_address: ''
  });

  const { updatePassword } = useAccessPasswordManager();
  const { settings, updateSettings, loading: settingsLoading } = useSystemSettings();

  useEffect(() => {
    if (settings) {
      setSystemForm(settings);
    }
  }, [settings]);


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

  const handleSaveSettings = async () => {
    await updateSettings(systemForm);
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
            Configurações gerais do <span className="font-orbitron">AlgaGymManager</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gymName">Nome da Academia</Label>
              <Input
                id="gymName"
                placeholder="AlgaGym Academia"
                value={systemForm.gym_name}
                onChange={(e) => setSystemForm(prev => ({ ...prev, gym_name: e.target.value }))}
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gymPhone">Telefone</Label>
              <Input
                id="gymPhone"
                placeholder="(11) 99999-9999"
                value={systemForm.gym_phone}
                onChange={(e) => setSystemForm(prev => ({ ...prev, gym_phone: e.target.value }))}
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gymEmail">Email da Academia</Label>
              <Input
                id="gymEmail"
                type="email"
                placeholder="contato@algagym.com"
                value={systemForm.gym_email}
                onChange={(e) => setSystemForm(prev => ({ ...prev, gym_email: e.target.value }))}
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gymAddress">Endereço</Label>
              <Input
                id="gymAddress"
                placeholder="Rua das Academias, 123"
                value={systemForm.gym_address}
                onChange={(e) => setSystemForm(prev => ({ ...prev, gym_address: e.target.value }))}
                className="h-12"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSaveSettings}
              disabled={settingsLoading}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              {settingsLoading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
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
          
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection;
