
import React, { useState } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, UserCheck, UserX } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

  const renderStudentRow = (student: Student) => {
    const StatusIcon = getStatusIcon(student.status);
    
    return (
      <TableRow key={student.id} className="hover:bg-muted/50">
        <TableCell className="font-medium text-foreground">{student.name}</TableCell>
        <TableCell className="hidden sm:table-cell text-foreground">{student.cpf || '-'}</TableCell>
        <TableCell className="text-foreground">{student.phone || '-'}</TableCell>
        <TableCell className="hidden md:table-cell text-foreground">{formatDate(student.birth_date)}</TableCell>
        <TableCell>
          <Badge className={`${getStatusColor(student.status)} w-fit font-bold`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {student.status === 'active' ? 'Ativo' : 'Inativo'}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewStudent(student)}
            className="h-8 w-8 p-0"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </TableCell>
      </TableRow>
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
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Gerenciamento de Alunos</h1>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
          Alunos ({activeStudents.length})
        </h2>
        {activeStudents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              Nenhum aluno ativo encontrado.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden sm:table-cell">CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="hidden md:table-cell">Data Nasc.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeStudents.map(renderStudentRow)}
              </TableBody>
            </Table>
          </Card>
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
