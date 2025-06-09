
import { useState } from 'react';
import Login from './Login';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import NewEnrollment from '../components/NewEnrollment';
import EnrollmentManagement from '../components/EnrollmentManagement';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = (email: string, password: string) => {
    // Mock authentication - in real app, validate with backend
    if (email && password) {
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'new-enrollment':
        return <NewEnrollment />;
      case 'enrollments':
        return <EnrollmentManagement />;
      case 'students':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestão de Alunos</h2>
            <p className="text-gray-600">Esta funcionalidade será implementada em breve.</p>
          </div>
        );
      case 'plans':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestão de Planos</h2>
            <p className="text-gray-600">Esta funcionalidade será implementada em breve.</p>
          </div>
        );
      case 'financial':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Módulo Financeiro</h2>
            <p className="text-gray-600">Área restrita - Acesso autorizado com sucesso!</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Configurações</h2>
            <p className="text-gray-600">Área restrita - Acesso autorizado com sucesso!</p>
          </div>
        );
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderCurrentPage()}
    </Layout>
  );
};

export default Index;
