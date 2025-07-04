
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Edit, Trash2, UserX, Eye, Loader2, UserCheck, RotateCcw, AlertTriangle } from 'lucide-react';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useGlobalStudents } from '@/hooks/useGlobalStudents';
import { Plan } from '@/pages/Index';
import StudentEditModal from './StudentEditModal';
import PlanRenewalModal from './PlanRenewalModal';
import { useToast } from '@/hooks/use-toast';

interface EnrollmentManagementProps {
  plans?: Plan[];
}

const EnrollmentManagement = ({ plans = [] }: EnrollmentManagementProps) => {
  const { enrollments, loading, deleteEnrollment, updateEnrollment, renewEnrollment, fetchEnrollments } = useEnrollments();
  const { updateStudent } = useGlobalStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  // Stats calculation with real-time updates
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0
  });

  useEffect(() => {
    const calculateStats = () => {
      const newStats = {
        total: enrollments.length,
        active: enrollments.filter(e => e.status === 'active').length,
        inactive: enrollments.filter(e => e.status === 'inactive').length,
        expired: enrollments.filter(e => e.status === 'expired').length
      };
      setStats(newStats);
    };

    calculateStats();
  }, [enrollments]);

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.student?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.student?.phone.includes(searchTerm) ||
      enrollment.plan_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (enrollment: any) => {
    if (enrollment.student) {
      setSelectedStudent(enrollment.student);
      setShowEditModal(true);
    }
  };

  const handleRenew = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setShowRenewalModal(true);
  };

  const handleSaveStudent = async (id: string, updates: any) => {
    const success = await updateStudent(id, updates);
    if (success) {
      setShowEditModal(false);
      setSelectedStudent(null);
      await fetchEnrollments(); // Use fetchEnrollments instead of refreshEnrollments
    }
    return success;
  };

  const handleRenewalConfirm = async (
    enrollmentId: string,
    planId: string,
    planName: string,
    planPrice: number,
    duration: string
  ) => {
    const success = await renewEnrollment(enrollmentId, planId, planName, planPrice, duration);
    if (success) {
      setShowRenewalModal(false);
      setSelectedEnrollment(null);
      await fetchEnrollments(); // Use fetchEnrollments instead of refreshEnrollments
    }
    return success;
  };

  const handleDelete = async (id: string, studentName: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(`Tem certeza que deseja excluir a matrícula de ${studentName}?\n\nEsta ação não pode ser desfeita.`);
    
    if (!confirmed) {
      return;
    }

    setIsDeleting(id);
    
    try {
      const success = await deleteEnrollment(id);
      
      if (success) {
        toast({
          title: "Matrícula excluída",
          description: `A matrícula de ${studentName} foi excluída com sucesso.`,
        });
        await fetchEnrollments(); // Use fetchEnrollments instead of refreshEnrollments
      } else {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a matrícula. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir matrícula:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleInactivate = async (id: string, studentName: string) => {
    const confirmed = window.confirm(`Tem certeza que deseja inativar a matrícula de ${studentName}?`);
    
    if (!confirmed) {
      return;
    }

    try {
      const success = await updateEnrollment(id, { status: 'inactive' });
      
      if (success) {
        // Also update the student status to inactive
        const enrollment = enrollments.find(e => e.id === id);
        if (enrollment?.student_id) {
          await updateStudent(enrollment.student_id, { status: 'inactive' });
        }
        
        toast({
          title: "Matrícula inativada",
          description: `A matrícula de ${studentName} foi inativada com sucesso.`,
        });
        
        await fetchEnrollments(); // Use fetchEnrollments instead of refreshEnrollments
      }
    } catch (error) {
      console.error('Erro ao inativar matrícula:', error);
      toast({
        title: "Erro ao inativar",
        description: "Não foi possível inativar a matrícula. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleReactivate = async (id: string, studentName: string) => {
    const confirmed = window.confirm(`Tem certeza que deseja reativar a matrícula de ${studentName}?`);
    
    if (!confirmed) {
      return;
    }

    try {
      const success = await updateEnrollment(id, { status: 'active' });
      
      if (success) {
        // Also update the student status to active
        const enrollment = enrollments.find(e => e.id === id);
        if (enrollment?.student_id) {
          await updateStudent(enrollment.student_id, { status: 'active' });
        }
        
        toast({
          title: "Matrícula reativada",
          description: `A matrícula de ${studentName} foi reativada com sucesso.`,
        });
        
        await fetchEnrollments(); // Use fetchEnrollments instead of refreshEnrollments
      }
    } catch (error) {
      console.error('Erro ao reativar matrícula:', error);
      toast({
        title: "Erro ao reativar",
        description: "Não foi possível reativar a matrícula. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expirado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryWarning = (endDate: string) => {
    const daysUntilExpiry = getDaysUntilExpiry(endDate);
    if (daysUntilExpiry < 0) return 'border-red-200 bg-red-50';
    if (daysUntilExpiry <= 7) return 'border-orange-200 bg-orange-50';
    if (daysUntilExpiry <= 30) return 'border-yellow-200 bg-yellow-50';
    return '';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando matrículas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base lg:text-lg text-green-700 truncate">Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base lg:text-lg text-gray-700 truncate">Inativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{stats.inactive}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base lg:text-lg text-red-700 truncate">Expiradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-800">{stats.expired}</div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base lg:text-lg text-blue-700 truncate">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Buscar Matrículas</CardTitle>
          <CardDescription className="text-sm">
            Busque por nome do aluno, email, telefone ou plano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email, telefone ou plano..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Apenas Ativas</SelectItem>
                <SelectItem value="inactive">Apenas Inativas</SelectItem>
                <SelectItem value="expired">Apenas Expiradas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Lista de Matrículas</CardTitle>
          <CardDescription className="text-sm">
            {filteredEnrollments.length} matrícula(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEnrollments.map((enrollment) => {
              const daysUntilExpiry = getDaysUntilExpiry(enrollment.end_date);
              const isCurrentlyDeleting = isDeleting === enrollment.id;
              
              return (
                <div
                  key={enrollment.id}
                  className={`border rounded-lg p-3 sm:p-4 transition-all hover:shadow-md ${getExpiryWarning(enrollment.end_date)}`}
                >
                  <div className="space-y-4">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800 break-words">
                            {enrollment.student?.name || 'Nome não disponível'}
                          </h3>
                          {getStatusBadge(enrollment.status)}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                            <p className="break-words"><strong>Email:</strong> {enrollment.student?.email || 'N/A'}</p>
                            <p><strong>Telefone:</strong> {enrollment.student?.phone || 'N/A'}</p>
                          </div>
                          <p><strong>Plano:</strong> {enrollment.plan_name} - R$ {enrollment.plan_price.toFixed(2)}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                            <p><strong>Início:</strong> {formatDate(enrollment.start_date)}</p>
                            <p>
                              <strong>Vencimento:</strong> {formatDate(enrollment.end_date)}
                              {daysUntilExpiry > 0 && (
                                <span className="ml-2 text-orange-600 text-xs">
                                  ({daysUntilExpiry} dias)
                                </span>
                              )}
                              {daysUntilExpiry <= 0 && (
                                <span className="ml-2 text-red-600 font-semibold text-xs">
                                  (Vencido há {Math.abs(daysUntilExpiry)} dias)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(enrollment)}
                        className="hover:bg-blue-50 flex-1 sm:flex-initial min-w-0"
                        disabled={!enrollment.student || isCurrentlyDeleting}
                      >
                        <Edit className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>

                      {(enrollment.status === 'active' || enrollment.status === 'expired') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRenew(enrollment)}
                          className="hover:bg-green-50 text-green-600 border-green-200 flex-1 sm:flex-initial min-w-0"
                          disabled={isCurrentlyDeleting}
                        >
                          <RotateCcw className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Renovar</span>
                        </Button>
                      )}
                      
                      {enrollment.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInactivate(enrollment.id, enrollment.student?.name || '')}
                          className="hover:bg-orange-50 flex-1 sm:flex-initial min-w-0"
                          disabled={isCurrentlyDeleting}
                        >
                          <UserX className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Inativar</span>
                        </Button>
                      )}

                      {enrollment.status === 'inactive' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReactivate(enrollment.id, enrollment.student?.name || '')}
                          className="hover:bg-green-50 text-green-600 border-green-200 flex-1 sm:flex-initial min-w-0"
                          disabled={isCurrentlyDeleting}
                        >
                          <UserCheck className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Reativar</span>
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(enrollment.id, enrollment.student?.name || '')}
                        className="hover:bg-red-50 text-red-600 border-red-200 flex-1 sm:flex-initial min-w-0"
                        disabled={isCurrentlyDeleting}
                      >
                        {isCurrentlyDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin sm:mr-1" />
                        ) : (
                          <Trash2 className="h-4 w-4 sm:mr-1" />
                        )}
                        <span className="hidden sm:inline">
                          {isCurrentlyDeleting ? 'Excluindo...' : 'Excluir'}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredEnrollments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma matrícula encontrada</p>
                <p className="text-sm">Tente ajustar os termos de busca</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <StudentEditModal
        student={selectedStudent}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStudent(null);
        }}
        onSave={handleSaveStudent}
      />

      <PlanRenewalModal
        enrollment={selectedEnrollment}
        plans={plans}
        isOpen={showRenewalModal}
        onClose={() => {
          setShowRenewalModal(false);
          setSelectedEnrollment(null);
        }}
        onRenew={handleRenewalConfirm}
      />
    </div>
  );
};

export default EnrollmentManagement;
