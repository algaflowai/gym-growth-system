
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HistoryIcon } from 'lucide-react';
import { Student } from '@/hooks/useStudents';
import { useState } from 'react';
import StudentEnrollmentHistory from './StudentEnrollmentHistory';

interface StudentViewModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

const StudentViewModal = ({ student, isOpen, onClose }: StudentViewModalProps) => {
  const [showHistory, setShowHistory] = useState(false);

  if (!student) return null;

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
    ) : (
      <Badge variant="secondary">Inativo</Badge>
    );
  };

  if (showHistory) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg sm:text-xl">Histórico de Matrículas</DialogTitle>
              <Button 
                variant="outline" 
                onClick={() => setShowHistory(false)}
                className="text-sm"
              >
                Voltar aos Dados
              </Button>
            </div>
            <DialogDescription className="text-sm">
              Histórico completo de planos e matrículas de {student.name}
            </DialogDescription>
          </DialogHeader>
          
          <StudentEnrollmentHistory studentId={student.id} student={student} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs sm:max-w-md lg:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto mx-2 sm:mx-auto">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-xl">Dados do Aluno</DialogTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowHistory(true)}
              className="text-sm"
            >
              <HistoryIcon className="h-4 w-4 mr-1" />
              Histórico
            </Button>
          </div>
          <DialogDescription className="text-sm">
            Informações completas do aluno
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <h3 className="text-lg sm:text-xl font-semibold">{student.name}</h3>
              {getStatusBadge(student.status)}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm sm:text-base text-foreground break-words">{student.email}</p>
              </div>
              
              <div>
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">Telefone</label>
                <p className="text-sm sm:text-base text-foreground">{student.phone}</p>
              </div>
              
              <div>
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">CPF</label>
                <p className="text-sm sm:text-base text-foreground">{student.cpf}</p>
              </div>
              
              {student.rg && (
                <div>
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">RG</label>
                  <p className="text-sm sm:text-base text-foreground">{student.rg}</p>
                </div>
              )}
              
              {student.birth_date && (
                <div className="sm:col-span-2">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                  <p className="text-sm sm:text-base text-foreground">{new Date(student.birth_date).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Endereço */}
          {(student.address || student.city || student.zip_code) && (
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-base sm:text-lg font-semibold">Endereço</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {student.address && (
                  <div className="sm:col-span-2">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Endereço</label>
                    <p className="text-sm sm:text-base text-foreground">{student.address}</p>
                  </div>
                )}
                
                {student.city && (
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Cidade</label>
                    <p className="text-sm sm:text-base text-foreground">{student.city}</p>
                  </div>
                )}
                
                {student.zip_code && (
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">CEP</label>
                    <p className="text-sm sm:text-base text-foreground">{student.zip_code}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informações de Saúde e Emergência */}
          {(student.emergency_contact || student.health_issues || student.restrictions) && (
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-base sm:text-lg font-semibold">Informações de Saúde e Emergência</h4>
              <div className="space-y-3 sm:space-y-4">
                {student.emergency_contact && (
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Contato de Emergência</label>
                    <p className="text-sm sm:text-base text-foreground">{student.emergency_contact}</p>
                  </div>
                )}
                
                {student.health_issues && (
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Problemas de Saúde</label>
                    <p className="text-sm sm:text-base text-foreground">{student.health_issues}</p>
                  </div>
                )}
                
                {student.restrictions && (
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Restrições</label>
                    <p className="text-sm sm:text-base text-foreground">{student.restrictions}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Objetivos e Notas */}
          {(student.main_goal || student.notes) && (
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-base sm:text-lg font-semibold">Objetivos e Observações</h4>
              <div className="space-y-3 sm:space-y-4">
                {student.main_goal && (
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Objetivo Principal</label>
                    <p className="text-sm sm:text-base text-foreground">{student.main_goal}</p>
                  </div>
                )}
                
                {student.notes && (
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Observações</label>
                    <p className="text-sm sm:text-base text-foreground">{student.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Datas */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-base sm:text-lg font-semibold">Informações do Sistema</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">Data de Cadastro</label>
                <p className="text-sm sm:text-base text-foreground">{new Date(student.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              
              <div>
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">Última Atualização</label>
                <p className="text-sm sm:text-base text-foreground">{new Date(student.updated_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentViewModal;
