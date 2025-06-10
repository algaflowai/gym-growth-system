
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Student } from '@/hooks/useStudents';

interface StudentViewModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

const StudentViewModal = ({ student, isOpen, onClose }: StudentViewModalProps) => {
  if (!student) return null;

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
    ) : (
      <Badge variant="secondary">Inativo</Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dados do Aluno</DialogTitle>
          <DialogDescription>
            Informações completas do aluno
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-semibold">{student.name}</h3>
              {getStatusBadge(student.status)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-800">{student.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Telefone</label>
                <p className="text-gray-800">{student.phone}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">CPF</label>
                <p className="text-gray-800">{student.cpf}</p>
              </div>
              
              {student.rg && (
                <div>
                  <label className="text-sm font-medium text-gray-600">RG</label>
                  <p className="text-gray-800">{student.rg}</p>
                </div>
              )}
              
              {student.birth_date && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Data de Nascimento</label>
                  <p className="text-gray-800">{new Date(student.birth_date).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Endereço */}
          {(student.address || student.city || student.zip_code) && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Endereço</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.address && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Endereço</label>
                    <p className="text-gray-800">{student.address}</p>
                  </div>
                )}
                
                {student.city && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cidade</label>
                    <p className="text-gray-800">{student.city}</p>
                  </div>
                )}
                
                {student.zip_code && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">CEP</label>
                    <p className="text-gray-800">{student.zip_code}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informações de Saúde e Emergência */}
          {(student.emergency_contact || student.health_issues || student.restrictions) && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Informações de Saúde e Emergência</h4>
              <div className="space-y-4">
                {student.emergency_contact && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Contato de Emergência</label>
                    <p className="text-gray-800">{student.emergency_contact}</p>
                  </div>
                )}
                
                {student.health_issues && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Problemas de Saúde</label>
                    <p className="text-gray-800">{student.health_issues}</p>
                  </div>
                )}
                
                {student.restrictions && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Restrições</label>
                    <p className="text-gray-800">{student.restrictions}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Objetivos e Notas */}
          {(student.main_goal || student.notes) && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Objetivos e Observações</h4>
              <div className="space-y-4">
                {student.main_goal && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Objetivo Principal</label>
                    <p className="text-gray-800">{student.main_goal}</p>
                  </div>
                )}
                
                {student.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Observações</label>
                    <p className="text-gray-800">{student.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Datas */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Informações do Sistema</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Data de Cadastro</label>
                <p className="text-gray-800">{new Date(student.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Última Atualização</label>
                <p className="text-gray-800">{new Date(student.updated_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentViewModal;
