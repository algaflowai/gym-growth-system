
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Login from './Login';
import ForgotPassword from '../components/ForgotPassword';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import NewEnrollment from '../components/NewEnrollment';
import EnrollmentManagement from '../components/EnrollmentManagement';
import StudentsManagement from '../components/StudentsManagement';
import PlansManagement from '../components/PlansManagement';
import FinancialSection from '../components/FinancialSection';
import SettingsSection from '../components/SettingsSection';
import RestrictedAccessModal from '../components/RestrictedAccessModal';
import { useAccessControl } from '../hooks/useAccessControl';
import { usePasswordManager } from '../hooks/usePasswordManager';

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  active: boolean;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);
  const [pendingPage, setPendingPage] = useState<string>('');
  const [plans, setPlans] = useState<Plan[]>([
    { id: '1', name: 'Diária', price: 15, duration: 'day', active: true },
    { id: '2', name: 'Mensal', price: 89, duration: 'month', active: true },
    { id: '3', name: 'Trimestral', price: 240, duration: 'quarter', active: true },
    { id: '4', name: 'Anual', price: 890, duration: 'year', active: true },
  ]);

  const { hasAccess, grantAccess } = useAccessControl();
  const { verifyPassword } = usePasswordManager();

  const handleLogin = (email: string, password: string) => {
    // Mock authentication - in real app, validate with backend
    if (email && password) {
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
      setShowForgotPassword(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
    setShowForgotPassword(false);
  };

  const handleNavigate = (page: string) => {
    // Check if page requires restricted access
    if (page === 'financial' && !hasAccess('financial')) {
      setPendingPage(page);
      setShowRestrictedModal(true);
      return;
    }
    
    if (page === 'settings' && !hasAccess('settings')) {
      setPendingPage(page);
      setShowRestrictedModal(true);
      return;
    }

    setCurrentPage(page);
  };

  const handleRestrictedAccess = async (password: string) => {
    const pageMap: { [key: string]: string } = {
      'financial': 'financeiro',
      'settings': 'configuracoes'
    };

    const dbPageName = pageMap[pendingPage];
    
    if (dbPageName) {
      const isValid = await verifyPassword(dbPageName, password);
      
      if (isValid) {
        grantAccess(pendingPage as 'financial' | 'settings');
        setCurrentPage(pendingPage);
        setShowRestrictedModal(false);
        setPendingPage('');
      } else {
        // Error handling is done in usePasswordManager
      }
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  const handleAddPlan = (plan: Omit<Plan, 'id'>) => {
    const newPlan = { ...plan, id: Date.now().toString() };
    setPlans(prev => [...prev, newPlan]);
  };

  const handleUpdatePlan = (id: string, updatedPlan: Partial<Plan>) => {
    setPlans(prev => prev.map(plan => 
      plan.id === id ? { ...plan, ...updatedPlan } : plan
    ));
  };

  const handleDeletePlan = (id: string) => {
    setPlans(prev => prev.filter(plan => plan.id !== id));
  };

  const getRestrictedModalTitle = () => {
    switch (pendingPage) {
      case 'financial':
        return 'Acesso ao Módulo Financeiro';
      case 'settings':
        return 'Acesso às Configurações';
      default:
        return 'Acesso Restrito';
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'new-enrollment':
        return <NewEnrollment plans={plans.filter(p => p.active)} />;
      case 'enrollments':
        return <EnrollmentManagement plans={plans} />;
      case 'students':
        return <StudentsManagement />;
      case 'plans':
        return (
          <PlansManagement
            plans={plans}
            onAddPlan={handleAddPlan}
            onUpdatePlan={handleUpdatePlan}
            onDeletePlan={handleDeletePlan}
          />
        );
      case 'financial':
        return <FinancialSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="algagym-ui-theme">
        {showForgotPassword ? (
          <ForgotPassword onBackToLogin={handleBackToLogin} />
        ) : (
          <Login onLogin={handleLogin} onForgotPassword={handleForgotPassword} />
        )}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="algagym-ui-theme">
      <Layout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        {renderCurrentPage()}
      </Layout>
      
      <RestrictedAccessModal
        isOpen={showRestrictedModal}
        onClose={() => {
          setShowRestrictedModal(false);
          setPendingPage('');
        }}
        onSubmit={handleRestrictedAccess}
        title={getRestrictedModalTitle()}
      />
    </ThemeProvider>
  );
};

export default Index;
