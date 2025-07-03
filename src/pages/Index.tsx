
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import PricingSection from '../components/PricingSection';
import Login from './Login';
import SignUp from '../components/SignUp';
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

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  active: boolean;
}

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('pricing');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([
    { id: '1', name: 'Diária', price: 15, duration: 'day', active: true },
    { id: '2', name: 'Mensal', price: 89, duration: 'month', active: true },
    { id: '3', name: 'Trimestral', price: 240, duration: 'quarter', active: true },
    { id: '4', name: 'Anual', price: 890, duration: 'year', active: true },
  ]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // User is authenticated, redirect to dashboard
          setCurrentPage('dashboard');
          setShowLogin(false);
          setShowSignUp(false);
          setShowForgotPassword(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setCurrentPage('dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        setCurrentPage('dashboard');
        setShowLogin(false);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name
          }
        }
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { error };
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentPage('pricing');
      setShowLogin(false);
      setShowSignUp(false);
      setShowForgotPassword(false);
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleShowLogin = () => {
    setShowLogin(true);
    setShowSignUp(false);
    setShowForgotPassword(false);
  };

  const handleShowSignUp = () => {
    setShowSignUp(true);
    setShowLogin(false);
    setShowForgotPassword(false);
  };

  const handleShowForgotPassword = () => {
    setShowForgotPassword(true);
    setShowLogin(false);
    setShowSignUp(false);
  };

  const handleBackToLogin = () => {
    setShowLogin(true);
    setShowSignUp(false);
    setShowForgotPassword(false);
  };

  const handleBackToPricing = () => {
    setShowLogin(false);
    setShowSignUp(false);
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

  // If user is not authenticated, show pricing/login flow
  if (!user) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="algagym-ui-theme">
        <div className="min-h-screen">
          {showLogin ? (
            <Login 
              onLogin={handleLogin}
              onForgotPassword={handleShowForgotPassword}
              onShowSignUp={handleShowSignUp}
              onGoogleLogin={handleGoogleLogin}
              onBackToPricing={handleBackToPricing}
            />
          ) : showSignUp ? (
            <SignUp 
              onSignUp={handleSignUp}
              onBackToLogin={handleBackToLogin}
              onGoogleLogin={handleGoogleLogin}
            />
          ) : showForgotPassword ? (
            <ForgotPassword 
              onBackToLogin={handleBackToLogin}
              onResetPassword={handleForgotPassword}
            />
          ) : (
            <PricingSection onLogin={handleShowLogin} />
          )}
        </div>
      </ThemeProvider>
    );
  }

  // If user is authenticated, show main app
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
