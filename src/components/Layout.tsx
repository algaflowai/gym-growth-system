
import { useState } from 'react';
import { Home, UserPlus, Users, ClipboardList, CreditCard, Settings, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RestrictedAccessModal from './RestrictedAccessModal';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const Layout = ({ children, currentPage, onNavigate, onLogout }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [restrictedModal, setRestrictedModal] = useState<string | null>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'new-enrollment', label: 'Nova Matrícula', icon: UserPlus },
    { id: 'enrollments', label: 'Gestão de Matrículas', icon: ClipboardList },
    { id: 'students', label: 'Alunos', icon: Users },
    { id: 'plans', label: 'Planos', icon: CreditCard },
  ];

  const restrictedItems = [
    { id: 'financial', label: 'Financeiro', icon: CreditCard },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleRestrictedAccess = (itemId: string, password: string) => {
    // Mock password validation
    if (password === 'admin123') {
      onNavigate(itemId);
      setRestrictedModal(null);
    } else {
      alert('Senha incorreta!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">GYM</span>
                </div>
                <span className="font-bold text-gray-800">Academia Pro</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hover:bg-gray-100"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}

          <div className="border-t pt-2 mt-4">
            {restrictedItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setRestrictedModal(item.id)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  {isSidebarOpen && <span className="font-medium">{item.label}</span>}
                </button>
              );
            })}
          </div>

          <div className="border-t pt-2 mt-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              {isSidebarOpen && <span className="font-medium">Sair</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {menuItems.find(item => item.id === currentPage)?.label || 
             restrictedItems.find(item => item.id === currentPage)?.label || 
             'Dashboard'}
          </h1>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Restricted Access Modal */}
      {restrictedModal && (
        <RestrictedAccessModal
          isOpen={!!restrictedModal}
          onClose={() => setRestrictedModal(null)}
          onSubmit={(password) => handleRestrictedAccess(restrictedModal, password)}
          title="Acesso Restrito"
        />
      )}
    </div>
  );
};

export default Layout;
