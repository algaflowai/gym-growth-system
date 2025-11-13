import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import Layout from './Layout';
import { supabase } from '@/integrations/supabase/client';
import { Plan } from '@/pages/Index';
import { usePlans } from '@/hooks/usePlans';

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { plans, addPlan, updatePlan, deletePlan } = usePlans();

  // Map paths to page names for the sidebar
  const getPageFromPath = (path: string) => {
    const pathToPage: { [key: string]: string } = {
      '/': 'dashboard',
      '/dashboard': 'dashboard',
      '/nova-matricula': 'new-enrollment',
      '/gestao-matriculas': 'enrollments',
      '/alunos': 'students',
      '/planos': 'plans',
      '/ai-trainer': 'ai-trainer',
      '/financeiro': 'financial',
      '/pagamentos': 'payments',
      '/configuracoes': 'settings'
    };
    return pathToPage[path] || 'dashboard';
  };

  const handleNavigate = (page: string) => {
    const pageToPath: { [key: string]: string } = {
      'dashboard': '/',
      'new-enrollment': '/nova-matricula',
      'enrollments': '/gestao-matriculas',
      'students': '/alunos',
      'plans': '/planos',
      'ai-trainer': '/ai-trainer',
      'financial': '/financeiro',
      'payments': '/pagamentos',
      'settings': '/configuracoes'
    };
    
    const path = pageToPath[page] || '/';
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const currentPage = getPageFromPath(location.pathname);

  return (
    <ThemeProvider defaultTheme="light" storageKey="algagym-ui-theme">
      <div className="min-h-screen">
        <Layout
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        >
          <div className="w-full max-w-full overflow-x-hidden">
            <LayoutProvider 
              plans={plans}
              onAddPlan={addPlan}
              onUpdatePlan={updatePlan}
              onDeletePlan={deletePlan}
              onNavigate={handleNavigate}
            >
              <Outlet />
            </LayoutProvider>
          </div>
        </Layout>
      </div>
    </ThemeProvider>
  );
};

// Context provider for sharing data with nested routes
import { createContext, useContext } from 'react';

interface LayoutContextType {
  plans: Plan[];
  onAddPlan: (plan: Omit<Plan, 'id'>) => void;
  onUpdatePlan: (id: string, updatedPlan: Partial<Plan>) => void;
  onDeletePlan: (id: string) => void;
  onNavigate: (page: string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};

interface LayoutProviderProps extends LayoutContextType {
  children: React.ReactNode;
}

const LayoutProvider = ({ children, plans, onAddPlan, onUpdatePlan, onDeletePlan, onNavigate }: LayoutProviderProps) => {
  return (
    <LayoutContext.Provider value={{ plans, onAddPlan, onUpdatePlan, onDeletePlan, onNavigate }}>
      {children}
    </LayoutContext.Provider>
  );
};

export default AppLayout;