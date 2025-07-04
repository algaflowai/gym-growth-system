
import React, { useState } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, UserCheck, UserX } from 'lucide-react';
import StudentViewModal from './StudentViewModal';
import { Student } from '@/hooks/useStudents';

const StudentsManagement = () => {
  const { students, loading } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.cpf.includes(searchTerm) ||
    (student.phone && student.phone.includes(searchTerm))
  );

  const activeStudents = filteredStudents.filter(student => student.status === 'active');
  const inactiveStudents = filteredStudents.filter(student => student.status === 'inactive');

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? UserCheck : UserX;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const renderStudentCard = (student: Student) => {
    const StatusIcon = getStatusIcon(student.status);
    
    return (
      <Card key={student.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-base sm:text-lg break-words">{student.name}</CardTitle>
            <Badge className={`${getStatusColor(student.status)} w-fit`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {student.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          <CardDescription className="text-sm break-words">{student.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <p><strong>CPF:</strong> {student.cpf}</p>
              <p><strong>Telefone:</strong> {student.phone}</p>
            </div>
            {student.birth_date && (
              <p><strong>Data de Nascimento:</strong> {formatDate(student.birth_date)}</p>
            )}
          </div>
          
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewStudent(student)}
              className="flex items-center gap-1 w-full sm:w-auto"
            >
              <Eye className="w-4 h-4" />
              Ver Detalhes
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Carregando alunos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Gerenciamento de Alunos</h1>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nome, email, CPF ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Active Students */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          Alunos Ativos ({activeStudents.length})
        </h2>
        {activeStudents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-gray-500">
              Nenhum aluno ativo encontrado.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeStudents.map(renderStudentCard)}
          </div>
        )}
      </div>

      {/* Inactive Students */}
      {inactiveStudents.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            Alunos Inativos ({inactiveStudents.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {inactiveStudents.map(renderStudentCard)}
          </div>
        </div>
      )}

      {/* Modals */}
      <StudentViewModal
        student={selectedStudent}
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedStudent(null);
        }}
      />
    </div>
  );
};

export default StudentsManagement;
