
import { ReactNode, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileMenu from './MobileMenu';
import { useEnrollments } from '@/hooks/useEnrollments';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout = ({ children, currentPage, onNavigate }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { enrollments } = useEnrollments();

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
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

        {/* Mobile Menu Overlay */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          currentPage={currentPage}
          onNavigate={onNavigate}
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {/* Top Header */}
          <Header
            onMenuToggle={() => setIsMobileMenuOpen(true)}
            expiringEnrollments={expiringEnrollments}
            onNavigate={onNavigate}
          />

          {/* Page Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
