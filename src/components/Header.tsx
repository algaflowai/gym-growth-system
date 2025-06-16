
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Menu, AlertTriangle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import ExpiringEnrollmentsModal from './ExpiringEnrollmentsModal';

interface HeaderProps {
  onMenuToggle: () => void;
  expiringEnrollments: any[];
  onNavigate: (page: string) => void;
}

const Header = ({ onMenuToggle, expiringEnrollments, onNavigate }: HeaderProps) => {
  const [showExpiringModal, setShowExpiringModal] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center lg:hidden">
              <Button variant="ghost" size="sm" onClick={onMenuToggle}>
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

      {/* Expiring Enrollments Modal */}
      <ExpiringEnrollmentsModal
        enrollments={expiringEnrollments}
        isOpen={showExpiringModal}
        onClose={() => setShowExpiringModal(false)}
        onNavigate={onNavigate}
      />
    </>
  );
};

export default Header;
