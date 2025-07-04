
import { useState } from 'react';
import { Home, UserPlus, Users, ClipboardList, CreditCard, Settings, LogOut, Menu, X, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const Layout = ({ children, currentPage, onNavigate, onLogout }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Changed default to false for mobile-first

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'new-enrollment', label: 'Nova Matrícula', icon: UserPlus },
    { id: 'enrollments', label: 'Gestão de Matrículas', icon: ClipboardList },
    { id: 'students', label: 'Alunos', icon: Users },
    { id: 'plans', label: 'Planos', icon: CreditCard },
    { id: 'ai-trainer', label: 'IA Trainer', icon: Brain },
    { id: 'financial', label: 'Financeiro', icon: CreditCard },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.id === currentPage);
    return currentItem?.label || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
            <img 
              src="/lovable-uploads/19a3b703-3706-4ccb-9561-29eacc5d0f04.png" 
              alt="AlgaGymManager Logo" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <span className="font-bold text-gray-800 dark:text-white text-lg">AlgaGymManager</span>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 border-r border-gray-200 dark:border-gray-700
        lg:relative lg:translate-x-0 lg:w-64
        ${isSidebarOpen 
          ? 'fixed inset-y-0 left-0 w-80 z-50 translate-x-0' 
          : 'fixed inset-y-0 left-0 w-80 z-50 -translate-x-full lg:translate-x-0'
        }
      `}>
        {/* Desktop Header */}
        <div className="hidden lg:block p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src="/lovable-uploads/19a3b703-3706-4ccb-9561-29eacc5d0f04.png" 
                  alt="AlgaGymManager Logo" 
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div>
                <span className="font-bold text-gray-800 dark:text-white text-lg">AlgaGymManager</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sistema de Gestão</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsSidebarOpen(false); // Close sidebar on mobile after navigation
                }}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 text-blue-700 dark:text-blue-300 shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden lg:block bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {getPageTitle()}
            </h1>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="text-sm text-gray-500 dark:text-gray-400">
                AlgaGymManager v2.0
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Page Title */}
        <div className="lg:hidden bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {getPageTitle()}
          </h1>
        </div>
        
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
