
import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CreditCard, 
  Settings, 
  LogOut, 
  BarChart3, 
  UserPlus, 
  Menu,
  X,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import ExpiringEnrollmentsModal from './ExpiringEnrollmentsModal';
import { useEnrollments } from '@/hooks/useEnrollments';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout = ({ children, currentPage, onNavigate }: LayoutProps) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showExpiringModal, setShowExpiringModal] = useState(false);
  const { enrollments } = useEnrollments();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'students', label: 'Alunos', icon: Users },
    { id: 'enrollments', label: 'Matrículas', icon: UserPlus },
    { id: 'plans', label: 'Planos', icon: CreditCard },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  // Calcular matrículas que vencem nos próximos 7 dias
  const getExpiringEnrollments = () => {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    return enrollments.filter(enrollment => {
      const endDate = new Date(enrollment.end_date);
      return endDate >= today && endDate <= sevenDaysFromNow && enrollment.status === 'active';
    });
  };

  const expiringEnrollments = getExpiringEnrollments();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/0f0c52ce-dcc4-4e77-9bd9-3048736b6a9a.png" 
                alt="Alga Gym Logo" 
                className="h-10 w-auto"
              />
            </div>
          </div>
          
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Button
                      variant={currentPage === item.id ? 'default' : 'ghost'}
                      className={`w-full justify-start text-left h-12 ${
                        currentPage === item.id 
                          ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => onNavigate(item.id)}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-left h-12 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </Button>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed top-0 left-0 w-64 h-full bg-white dark:bg-gray-800 shadow-xl">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/lovable-uploads/0f0c52ce-dcc4-4e77-9bd9-3048736b6a9a.png" 
                    alt="Alga Gym Logo" 
                    className="h-8 w-auto"
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <Button
                          variant={currentPage === item.id ? 'default' : 'ghost'}
                          className={`w-full justify-start text-left h-12 ${
                            currentPage === item.id 
                              ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => {
                            onNavigate(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          {item.label}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left h-12 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {/* Top Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center lg:hidden">
                  <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu className="h-6 w-6" />
                  </Button>
                  <img 
                    src="/lovable-uploads/0f0c52ce-dcc4-4e77-9bd9-3048736b6a9a.png" 
                    alt="Alga Gym Logo" 
                    className="h-8 w-auto ml-3"
                  />
                </div>
                
                <div className="hidden lg:block">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    AlgaGym Manager
                  </h1>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Notification for expiring enrollments */}
                  {expiringEnrollments.length > 0 && (
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow border-orange-200 bg-orange-50 dark:bg-orange-900/20"
                      onClick={() => setShowExpiringModal(true)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                            {expiringEnrollments.length} matrícula{expiringEnrollments.length > 1 ? 's' : ''} vencendo
                          </span>
                          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                            {expiringEnrollments.length}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Expiring Enrollments Modal */}
      <ExpiringEnrollmentsModal
        enrollments={expiringEnrollments}
        isOpen={showExpiringModal}
        onClose={() => setShowExpiringModal(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default Layout;
