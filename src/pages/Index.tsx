
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from '../components/ForgotPassword';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import NewEnrollment from '../components/NewEnrollment';
import EnrollmentManagement from '../components/EnrollmentManagement';
import StudentsManagement from '../components/StudentsManagement';
import PlansManagement from '../components/PlansManagement';
import AITrainer from '../components/AITrainer';
import FinancialSection from '../components/FinancialSection';
import SettingsSection from '../components/SettingsSection';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  durationDays: number;
  active: boolean;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [plans, setPlans] = useState<Plan[]>([
    { id: '1', name: 'Diária', price: 15, duration: 'day', durationDays: 1, active: true },
    { id: '2', name: 'Mensal', price: 89, duration: 'month', durationDays: 30, active: true },
    { id: '3', name: 'Trimestral', price: 240, duration: 'quarter', durationDays: 90, active: true },
    { id: '4', name: 'Anual', price: 890, duration: 'year', durationDays: 365, active: true },
  ]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        const wasAuthenticated = isAuthenticated;
        setIsAuthenticated(!!session);
        
        if (session && !wasAuthenticated) {
          // Only redirect to dashboard on initial login, not when returning to tab
          setCurrentPage('dashboard');
          setAuthView('login');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (email: string, password: string) => {
    // Authentication is handled by the auth state change listener
    console.log('Login attempted for:', email);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
      setCurrentPage('dashboard');
      setAuthView('login');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const handleNavigate = (page: string) => {
    // Remove 'pricing' from navigation as it's now part of login flow
    if (page === 'pricing') return;
    setCurrentPage(page);
  };

  const handleShowSignup = () => {
    setAuthView('signup');
  };

  const handleShowLogin = () => {
    setAuthView('login');
  };

  const handleForgotPassword = () => {
    setAuthView('forgot-password');
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
      case 'ai-trainer':
        return <AITrainer />;
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
        <div className="min-h-screen">
          {authView === 'forgot-password' && (
            <ForgotPassword onBackToLogin={handleShowLogin} />
          )}
          {authView === 'signup' && (
            <Signup 
              onBackToLogin={handleShowLogin}
              onSignup={handleLogin}
            />
          )}
          {authView === 'login' && (
            <Login 
              onLogin={handleLogin} 
              onForgotPassword={handleForgotPassword}
              onShowSignup={handleShowSignup}
            />
          )}
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="algagym-ui-theme">
      <div className="min-h-screen">
        <Layout
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        >
          <div className="w-full max-w-full overflow-x-hidden">
            {renderCurrentPage()}
          </div>
        </Layout>
      </div>
    </ThemeProvider>
  );
};

export default Index;
