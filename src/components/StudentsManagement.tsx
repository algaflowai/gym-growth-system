
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

  // Mostrar apenas alunos ativos na página de alunos
  const activeStudents = filteredStudents.filter(student => student.status === 'active');

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900';
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
            <CardTitle className="text-base sm:text-lg break-words text-gray-900 dark:text-white">{student.name}</CardTitle>
            <Badge className={`${getStatusColor(student.status)} w-fit font-bold`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {student.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          <CardDescription className="text-sm break-words text-gray-900 dark:text-gray-200">{student.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-student-info-secondary">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <p><strong className="text-gray-900 dark:text-white">CPF:</strong> <span className="text-gray-900 dark:text-white">{student.cpf}</span></p>
              <p><strong className="text-gray-900 dark:text-white">Telefone:</strong> <span className="text-gray-900 dark:text-white">{student.phone}</span></p>
            </div>
            {student.birth_date && (
              <p><strong className="text-gray-900 dark:text-white">Data de Nascimento:</strong> <span className="text-gray-900 dark:text-white">{formatDate(student.birth_date)}</span></p>
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
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Gerenciamento de Alunos</h1>
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
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Alunos ({activeStudents.length})
        </h2>
        {activeStudents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhum aluno ativo encontrado.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeStudents.map(renderStudentCard)}
          </div>
        )}
      </div>

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
