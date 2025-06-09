
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, UserX, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Enrollment {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  plan: string;
  startDate: string;
  endDate: string;
  status: 'ativo' | 'inativo';
  paymentStatus: 'pago' | 'pendente';
  daysUntilExpiry: number;
}

const EnrollmentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for demonstration
  const [enrollments] = useState<Enrollment[]>([
    {
      id: '1',
      studentName: 'Ana Silva Santos',
      email: 'ana.silva@email.com',
      phone: '(11) 99999-1111',
      plan: 'Mensal',
      startDate: '2024-01-15',
      endDate: '2024-06-15',
      status: 'ativo',
      paymentStatus: 'pago',
      daysUntilExpiry: 45
    },
    {
      id: '2',
      studentName: 'Carlos Eduardo Lima',
      email: 'carlos.lima@email.com',
      phone: '(11) 99999-2222',
      plan: 'Trimestral',
      startDate: '2024-02-01',
      endDate: '2024-07-01',
      status: 'ativo',
      paymentStatus: 'pendente',
      daysUntilExpiry: 15
    },
    {
      id: '3',
      studentName: 'Maria Fernanda Costa',
      email: 'maria.costa@email.com',
      phone: '(11) 99999-3333',
      plan: 'Anual',
      startDate: '2023-12-01',
      endDate: '2024-12-01',
      status: 'ativo',
      paymentStatus: 'pago',
      daysUntilExpiry: 180
    },
    {
      id: '4',
      studentName: 'João Pedro Oliveira',
      email: 'joao.oliveira@email.com',
      phone: '(11) 99999-4444',
      plan: 'Mensal',
      startDate: '2024-03-01',
      endDate: '2024-04-01',
      status: 'inativo',
      paymentStatus: 'pendente',
      daysUntilExpiry: -30
    }
  ]);

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.phone.includes(searchTerm)
  );

  const activeEnrollments = enrollments.filter(e => e.status === 'ativo').length;
  const inactiveEnrollments = enrollments.filter(e => e.status === 'inativo').length;
  const totalEnrollments = enrollments.length;

  const handleEdit = (id: string) => {
    toast({
      title: "Editar Matrícula",
      description: `Abrindo formulário de edição para a matrícula ${id}`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a matrícula de ${name}?`)) {
      toast({
        title: "Matrícula excluída",
        description: `A matrícula de ${name} foi excluída com sucesso.`,
        variant: "destructive",
      });
    }
  };

  const handleInactivate = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja inativar a matrícula de ${name}?`)) {
      toast({
        title: "Matrícula inativada",
        description: `A matrícula de ${name} foi inativada com sucesso.`,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'ativo' ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
    ) : (
      <Badge variant="secondary">Inativo</Badge>
    );
  };

  const getPaymentBadge = (paymentStatus: string) => {
    return paymentStatus === 'pago' ? (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pago</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Pendente</Badge>
    );
  };

  const getExpiryWarning = (daysUntilExpiry: number) => {
    if (daysUntilExpiry < 0) return 'border-red-200 bg-red-50';
    if (daysUntilExpiry <= 7) return 'border-orange-200 bg-orange-50';
    if (daysUntilExpiry <= 30) return 'border-yellow-200 bg-yellow-50';
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            Busque por nome, email ou telefone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
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
            {filteredEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${getExpiryWarning(enrollment.daysUntilExpiry)}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {enrollment.studentName}
                      </h3>
                      {getStatusBadge(enrollment.status)}
                      {getPaymentBadge(enrollment.paymentStatus)}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Email: {enrollment.email}</p>
                      <p>Telefone: {enrollment.phone}</p>
                      <p>Plano: {enrollment.plan}</p>
                      <p>
                        Vencimento: {new Date(enrollment.endDate).toLocaleDateString('pt-BR')}
                        {enrollment.daysUntilExpiry > 0 && (
                          <span className="ml-2 text-orange-600">
                            ({enrollment.daysUntilExpiry} dias restantes)
                          </span>
                        )}
                        {enrollment.daysUntilExpiry <= 0 && (
                          <span className="ml-2 text-red-600 font-semibold">
                            (Vencido há {Math.abs(enrollment.daysUntilExpiry)} dias)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(enrollment.id)}
                      className="hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    
                    {enrollment.status === 'ativo' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInactivate(enrollment.id, enrollment.studentName)}
                        className="hover:bg-orange-50"
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Inativar
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(enrollment.id, enrollment.studentName)}
                      className="hover:bg-red-50 text-red-600 border-red-200"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
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
    </div>
  );
};

export default EnrollmentManagement;
