import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Plus, Trash2, DollarSign } from 'lucide-react';
import { useEnrollmentDependents } from '@/hooks/useEnrollmentDependents';
import { useGlobalStudents } from '@/hooks/useGlobalStudents';
import { DependentSelector } from './DependentSelector';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EnrollmentDependentsViewProps {
  enrollmentId: string;
  studentId: string;
  isActive?: boolean;
}

export const EnrollmentDependentsView = ({
  enrollmentId,
  studentId,
  isActive = true,
}: EnrollmentDependentsViewProps) => {
  const { dependents, loading, addDependent, removeDependent } = useEnrollmentDependents(enrollmentId);
  const { students } = useGlobalStudents();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDependentId, setSelectedDependentId] = useState<string | null>(null);
  const [enrollmentPrice, setEnrollmentPrice] = useState<number>(0);

  // Buscar preço total da matrícula
  useEffect(() => {
    const fetchEnrollmentPrice = async () => {
      const { data } = await supabase
        .from('enrollments')
        .select('plan_price')
        .eq('id', enrollmentId)
        .single();
      
      if (data) {
        setEnrollmentPrice(data.plan_price);
      }
    };

    fetchEnrollmentPrice();
  }, [enrollmentId, dependents]);

  const getStudentName = (id: string) => {
    const student = students.find((s) => s.id === id);
    return student?.name || 'Desconhecido';
  };

  const handleAddDependent = async (dependentStudentId: string, dependentPrice: number) => {
    await addDependent(enrollmentId, studentId, dependentStudentId, dependentPrice);
  };

  const handleRemoveDependent = async () => {
    if (!selectedDependentId) return;
    
    const success = await removeDependent(selectedDependentId, enrollmentId);
    if (success) {
      setDeleteDialogOpen(false);
      setSelectedDependentId(null);
    }
  };

  const excludeStudentIds = [studentId, ...dependents.map((d) => d.dependent_student_id)];

  const totalDependentsPrice = dependents.reduce((sum, dep) => sum + Number(dep.dependent_price), 0);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Dependentes do Plano</CardTitle>
            </div>
            {isActive && (
              <Button
                onClick={() => setSelectorOpen(true)}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            )}
          </div>
          <CardDescription>
            Dependentes vinculados a esta matrícula
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando dependentes...
            </div>
          ) : dependents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhum dependente cadastrado</p>
              {isActive && (
                <p className="text-sm text-muted-foreground mt-1">
                  Clique em "Adicionar" para incluir dependentes
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {dependents.map((dependent) => (
                <div
                  key={dependent.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {getStudentName(dependent.dependent_student_id)}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        R$ {Number(dependent.dependent_price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedDependentId(dependent.id);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Titular:</span>
                  <span className="font-medium">{getStudentName(studentId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Dependentes:</span>
                  <span>R$ {totalDependentsPrice.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total do Plano:</span>
                  <span className="text-primary">R$ {enrollmentPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <DependentSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        students={students}
        excludeStudentIds={excludeStudentIds}
        onAddDependent={handleAddDependent}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Dependente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este dependente? O preço total da matrícula será
              recalculado automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveDependent}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
