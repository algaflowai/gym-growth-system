
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, UserX, Eye, Loader2, UserCheck, RotateCcw } from 'lucide-react';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useStudents } from '@/hooks/useStudents';
import { Plan } from '@/pages/Index';
import StudentEditModal from './StudentEditModal';
import PlanRenewalModal from './PlanRenewalModal';

interface EnrollmentManagementProps {
  plans?: Plan[];
}

const EnrollmentManagement = ({ plans = [] }: EnrollmentManagementProps) => {
  const { enrollments, loading, deleteEnrollment, updateEnrollment, renewEnrollment } = useEnrollments();
  const { updateStudent } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.student?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.student?.phone.includes(searchTerm) ||
    enrollment.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
  const inactiveEnrollments = enrollments.filter(e => e.status === 'inactive').length;
  const expiredEnrollments = enrollments.filter(e => e.status === 'expired').length;
  const totalEnrollments = enrollments.length;

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
    }
    return success;
  };

  const handleDelete = async (id: string, studentName: string) => {
    if (confirm(`Tem certeza que deseja excluir a matrícula de ${studentName}?`)) {
      await deleteEnrollment(id);
    }
  };

  const handleInactivate = async (id: string, studentName: string) => {
    if (confirm(`Tem certeza que deseja inativar a matrícula de ${studentName}?`)) {
      await updateEnrollment(id, { status: 'inactive' });
    }
  };

  const handleReactivate = async (id: string, studentName: string) => {
    if (confirm(`Tem certeza que deseja reativar a matrícula de ${studentName}?`)) {
      await updateEnrollment(id, { status: 'active' });
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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-700">Matrículas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">{activeEnrollments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-700">Matrículas Inativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{inactiveEnrollments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-700">Matrículas Expiradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-800">{expiredEnrollments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-700">Total Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{totalEnrollments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Matrículas</CardTitle>
          <CardDescription>
            Busque por nome do aluno, email, telefone ou plano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email, telefone ou plano..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Matrículas</CardTitle>
          <CardDescription>
            {filteredEnrollments.length} matrícula(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEnrollments.map((enrollment) => {
              const daysUntilExpiry = getDaysUntilExpiry(enrollment.end_date);
              return (
                <div
                  key={enrollment.id}
                  className={`border rounded-lg p-4 transition-all hover:shadow-md ${getExpiryWarning(enrollment.end_date)}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {enrollment.student?.name || 'Nome não disponível'}
                        </h3>
                        {getStatusBadge(enrollment.status)}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Email: {enrollment.student?.email || 'N/A'}</p>
                        <p>Telefone: {enrollment.student?.phone || 'N/A'}</p>
                        <p>Plano: {enrollment.plan_name} - R$ {enrollment.plan_price.toFixed(2)}</p>
                        <p>Início: {new Date(enrollment.start_date).toLocaleDateString('pt-BR')}</p>
                        <p>
                          Vencimento: {new Date(enrollment.end_date).toLocaleDateString('pt-BR')}
                          {daysUntilExpiry > 0 && (
                            <span className="ml-2 text-orange-600">
                              ({daysUntilExpiry} dias restantes)
                            </span>
                          )}
                          {daysUntilExpiry <= 0 && (
                            <span className="ml-2 text-red-600 font-semibold">
                              (Vencido há {Math.abs(daysUntilExpiry)} dias)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(enrollment)}
                        className="hover:bg-blue-50"
                        disabled={!enrollment.student}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>

                      {(enrollment.status === 'active' || enrollment.status === 'expired') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRenew(enrollment)}
                          className="hover:bg-green-50 text-green-600 border-green-200"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Renovar
                        </Button>
                      )}
                      
                      {enrollment.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInactivate(enrollment.id, enrollment.student?.name || '')}
                          className="hover:bg-orange-50"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Inativar
                        </Button>
                      )}

                      {enrollment.status === 'inactive' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReactivate(enrollment.id, enrollment.student?.name || '')}
                          className="hover:bg-green-50 text-green-600 border-green-200"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Reativar
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(enrollment.id, enrollment.student?.name || '')}
                        className="hover:bg-red-50 text-red-600 border-red-200"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
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

      {/* Student Edit Modal */}
      <StudentEditModal
        student={selectedStudent}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStudent(null);
        }}
        onSave={handleSaveStudent}
      />

      {/* Plan Renewal Modal */}
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
