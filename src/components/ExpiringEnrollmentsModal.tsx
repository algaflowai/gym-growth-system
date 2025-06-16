
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, User, CreditCard, RefreshCw } from 'lucide-react';

interface ExpiringEnrollmentsModalProps {
  enrollments: any[];
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

const ExpiringEnrollmentsModal = ({ 
  enrollments, 
  isOpen, 
  onClose, 
  onNavigate 
}: ExpiringEnrollmentsModalProps) => {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysUntilExpiration = (dateString: string) => {
    const today = new Date();
    const expirationDate = new Date(dateString);
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpirationBadge = (dateString: string) => {
    const days = getDaysUntilExpiration(dateString);
    
    if (days < 0) {
      return <Badge variant="destructive">Vencida</Badge>;
    } else if (days === 0) {
      return <Badge className="bg-orange-500 hover:bg-orange-600">Vence hoje</Badge>;
    } else if (days <= 3) {
      return <Badge className="bg-red-500 hover:bg-red-600">{days} dia{days > 1 ? 's' : ''}</Badge>;
    } else {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">{days} dias</Badge>;
    }
  };

  const handleRenewEnrollment = (enrollmentId: string) => {
    console.log('Renovar matrícula:', enrollmentId);
    onNavigate('enrollments');
    onClose();
  };

  const handleViewStudent = (studentId: string) => {
    console.log('Ver perfil do aluno:', studentId);
    onNavigate('students');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Matrículas Vencendo</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {enrollments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma matrícula vencendo nos próximos 7 dias</p>
            </div>
          ) : (
            <>
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>{enrollments.length}</strong> matrícula{enrollments.length > 1 ? 's' : ''} 
                  {enrollments.length > 1 ? ' estão' : ' está'} vencendo nos próximos 7 dias
                </p>
              </div>

              <div className="space-y-3">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="border rounded-lg p-4 transition-all hover:shadow-md bg-white dark:bg-gray-800"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                              {enrollment.student?.name || 'Nome não disponível'}
                            </h3>
                          </div>
                          {getExpirationBadge(enrollment.end_date)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4" />
                            <span>Plano: {enrollment.plan_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Vence em: {formatDate(enrollment.end_date)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>Valor: R$ {enrollment.plan_price?.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>Email: {enrollment.student?.email || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 lg:flex-col lg:w-auto">
                        <Button
                          size="sm"
                          onClick={() => handleRenewEnrollment(enrollment.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Renovar
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewStudent(enrollment.student_id)}
                          className="hover:bg-blue-50"
                        >
                          <User className="h-4 w-4 mr-1" />
                          Ver Perfil
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpiringEnrollmentsModal;
