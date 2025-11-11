import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Edit, Trash2, UserX, Eye, Loader2, UserCheck, RotateCcw, AlertTriangle, CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useGlobalStudents } from '@/hooks/useGlobalStudents';
import { Plan } from '@/pages/Index';
import StudentEditModal from './StudentEditModal';
import PlanRenewalModal from './PlanRenewalModal';
import StudentReactivationModal from './StudentReactivationModal';
import { useToast } from '@/hooks/use-toast';

interface EnrollmentManagementProps {
  plans?: Plan[];
}

const EnrollmentManagement = ({ plans = [] }: EnrollmentManagementProps) => {
  const { enrollments, loading, deleteEnrollment, updateEnrollment, renewEnrollment, reactivateStudent, fetchEnrollments } = useEnrollments();
  const { updateStudent } = useGlobalStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expiryDateFilter, setExpiryDateFilter] = useState<Date | undefined>(undefined);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [selectedStudentForReactivation, setSelectedStudentForReactivation] = useState(null);
  const [showReactivationModal, setShowReactivationModal] = useState(false);
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
    
    const matchesExpiryDate = !expiryDateFilter || 
      new Date(enrollment.end_date + 'T00:00:00').toDateString() === expiryDateFilter.toDateString();
    
    return matchesSearch && matchesStatus && matchesExpiryDate;
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
      await fetchEnrollments();
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
      await fetchEnrollments();
    }
    return success;
  };

  const handleReactivationConfirm = async (
    studentId: string,
    planId: string,
    planName: string,
    titularPrice: number,
    duration: string,
    dependents?: Array<{ dependent_student_id: string; dependent_price: number }>,
    totalPrice?: number
  ) => {
    const success = await reactivateStudent(studentId, planId, planName, titularPrice, duration, dependents, totalPrice);
    if (success) {
      setShowReactivationModal(false);
      setSelectedStudentForReactivation(null);
      await fetchEnrollments();
    }
    return success;
  };

  const handleDelete = async (enrollmentId: string, studentName: string) => {
    // Validação do ID da matrícula
    if (!enrollmentId || enrollmentId.trim() === '') {
      toast({
        title: "Erro de Validação",
        description: "ID da matrícula inválido.",
        variant: "destructive",
      });
      return;
    }

    console.log(`Iniciando exclusão da matrícula: ${enrollmentId} do aluno: ${studentName}`);

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a matrícula de ${studentName}?\n\n` +
      `ID da matrícula: ${enrollmentId}\n\n` +
      `Esta ação não pode ser desfeita.`
    );
    
    if (!confirmed) {
      console.log('Exclusão cancelada pelo usuário');
      return;
    }

    setIsDeleting(enrollmentId);
    
    try {
      console.log(`Chamando função de exclusão para matrícula ${enrollmentId}`);
      
      const success = await deleteEnrollment(enrollmentId);
      
      if (success) {
        console.log(`Matrícula ${enrollmentId} excluída com sucesso`);
        toast({
          title: "Matrícula Excluída",
          description: `A matrícula de ${studentName} foi excluída com sucesso.`,
        });
        
        // Recarrega a lista de matrículas
        await fetchEnrollments();
      }
    } catch (error: any) {
      console.error('Erro inesperado na exclusão:', error);
      toast({
        title: "Erro Inesperado",
        description: `Ocorreu um erro inesperado: ${error?.message || 'Erro desconhecido'}`,
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
        
        await fetchEnrollments();
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
    // Encontrar a matrícula e o aluno
    const enrollment = enrollments.find(e => e.id === id);
    if (!enrollment?.student) {
      toast({
        title: "Erro",
        description: "Dados do aluno não encontrados.",
        variant: "destructive",
      });
      return;
    }

    // Abrir modal de reativação com seleção de plano
    setSelectedStudentForReactivation(enrollment.student);
    setShowReactivationModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-200 text-green-900 font-bold hover:bg-green-200">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-200 text-gray-900 font-bold hover:bg-gray-200">Inativo</Badge>;
      case 'expired':
        return <Badge className="bg-red-200 text-red-900 font-bold hover:bg-red-200">Expirado</Badge>;
      default:
        return <Badge className="bg-gray-200 text-gray-900 font-bold hover:bg-gray-200">{status}</Badge>;
    }
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const shouldShowRenewButton = (enrollment: any) => {
    const daysUntilExpiry = getDaysUntilExpiry(enrollment.end_date);
    const isDailyPlan = enrollment.plan_name?.toLowerCase().includes('diária') || 
                       enrollment.plan_name?.toLowerCase().includes('daily') ||
                       enrollment.plan_id?.toLowerCase().includes('day');
    
    // Para planos diários, sempre mostrar o botão de renovação
    if (isDailyPlan) {
      return true;
    }
    
    // Para outros planos, mostrar apenas quando faltar 7 dias ou menos para vencer
    return daysUntilExpiry <= 7;
  };

  const getExpiryWarning = (endDate: string) => {
    const daysUntilExpiry = getDaysUntilExpiry(endDate);
    if (daysUntilExpiry < 0) return 'border-red-200';
    if (daysUntilExpiry <= 7) return 'border-orange-200';
    if (daysUntilExpiry <= 30) return 'border-yellow-200';
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
            <CardTitle className="text-sm sm:text-base lg:text-lg text-green-900 truncate">Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base lg:text-lg text-gray-900 dark:text-white truncate">Inativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">{stats.inactive}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base lg:text-lg text-red-900 truncate">Expiradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-800">{stats.expired}</div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base lg:text-lg text-blue-900 truncate">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">Buscar Matrículas</CardTitle>
          <CardDescription className="text-sm dark:text-gray-300">
            Busque por nome do aluno, email, telefone ou plano
            {expiryDateFilter && ` - Vencendo em ${format(expiryDateFilter, 'dd/MM/yyyy', { locale: ptBR })}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
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
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:flex-1 justify-start text-left font-normal",
                      !expiryDateFilter && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDateFilter ? format(expiryDateFilter, "dd/MM/yyyy", { locale: ptBR }) : "Filtrar por vencimento"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiryDateFilter}
                    onSelect={setExpiryDateFilter}
                    initialFocus
                    locale={ptBR}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              
              {expiryDateFilter && (
                <Button
                  variant="outline"
                  onClick={() => setExpiryDateFilter(undefined)}
                  className="w-full sm:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpar Data
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">Lista de Matrículas</CardTitle>
          <CardDescription className="text-sm text-gray-900 dark:text-gray-300">{filteredEnrollments.length} matrícula(s) encontrada(s)</CardDescription>
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
                           <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                             {enrollment.student?.name || 'Nome não disponível'}
                           </h3>
                          {getStatusBadge(enrollment.status)}
                        </div>
                        
                         <div className="text-sm text-gray-900 dark:text-white space-y-1">
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                             <p><strong className="text-gray-900 dark:text-white">Email:</strong> <span className="text-gray-900 dark:text-white">{enrollment.student?.email || 'N/A'}</span></p>
                             <p><strong className="text-gray-900 dark:text-white">Telefone:</strong> <span className="text-gray-900 dark:text-white">{enrollment.student?.phone || 'N/A'}</span></p>
                           </div>
                           <p><strong className="text-gray-900 dark:text-white">Plano:</strong> <span className="text-gray-900 dark:text-white">{enrollment.plan_name} - R$ {enrollment.plan_price.toFixed(2)}</span></p>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                             <p><strong className="text-gray-900 dark:text-white">Início:</strong> <span className="text-gray-900 dark:text-white">{formatDate(enrollment.start_date)}</span></p>
                             <p>
                               <strong className="text-gray-900 dark:text-white">Vencimento:</strong> <span className="text-gray-900 dark:text-white">{formatDate(enrollment.end_date)}</span>
                               {daysUntilExpiry > 0 && (
                                 <span className="ml-2 text-orange-700 text-xs">
                                   ({daysUntilExpiry} dias)
                                 </span>
                               )}
                               {daysUntilExpiry <= 0 && (
                                 <span className="ml-2 text-red-700 font-semibold text-xs">
                                   (Vencido há {Math.abs(daysUntilExpiry)} dias)
                                 </span>
                               )}
                             </p>
                           </div>
                           <p className="text-xs text-gray-900 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">ID:</strong> {enrollment.id}</p>
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

                      {(enrollment.status === 'active' || enrollment.status === 'expired') && shouldShowRenewButton(enrollment) && (
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
                        title={`Excluir matrícula ${enrollment.id}`}
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

      <StudentReactivationModal
        student={selectedStudentForReactivation}
        plans={plans}
        isOpen={showReactivationModal}
        onClose={() => {
          setShowReactivationModal(false);
          setSelectedStudentForReactivation(null);
        }}
        onReactivate={handleReactivationConfirm}
      />
    </div>
  );
};

export default EnrollmentManagement;
