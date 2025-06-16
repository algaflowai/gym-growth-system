
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
  const [plans, setPlans] = useState<Plan[]>([
    { id: '1', name: 'Mensal', price: 89, duration: 'month', active: true },
    { id: '2', name: 'Trimestral', price: 240, duration: 'quarter', active: true },
    { id: '3', name: 'Anual', price: 890, duration: 'year', active: true },
  ]);

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
    setCurrentPage(page);
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

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'new-enrollment':
        return <NewEnrollment plans={plans.filter(p => p.active)} />;
      case 'enrollments':
        return <EnrollmentManagement />;
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
      >
        {renderCurrentPage()}
      </Layout>
    </ThemeProvider>
  );
};

export default Index;
