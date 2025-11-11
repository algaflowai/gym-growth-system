import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, CreditCardIcon, UserCheck, Users } from 'lucide-react';
import { Plan } from '@/pages/Index';
import { Student } from '@/hooks/useStudents';
import { toast } from '@/hooks/use-toast';
import dayjs, { BRAZIL_TZ, formatBrazilianDate } from '@/lib/dayjs';
import { supabase } from '@/integrations/supabase/client';

interface StudentReactivationModalProps {
  student: Student | null;
  plans: Plan[];
  isOpen: boolean;
  onClose: () => void;
  onReactivate: (
    studentId: string, 
    planId: string, 
    planName: string, 
    titularPrice: number, 
    duration: string,
    dependents?: Array<{ dependent_student_id: string; dependent_price: number }>,
    totalPrice?: number
  ) => Promise<boolean>;
}

const StudentReactivationModal = ({ student, plans, isOpen, onClose, onReactivate }: StudentReactivationModalProps) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [newStartDate, setNewStartDate] = useState<string>('');
  const [newEndDate, setNewEndDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inactiveEnrollment, setInactiveEnrollment] = useState<any>(null);
  const [originalDependents, setOriginalDependents] = useState<any[]>([]);
  const [selectedDependents, setSelectedDependents] = useState<string[]>([]);
  const [studentsMap, setStudentsMap] = useState<Map<string, any>>(new Map());

  const activePlans = plans.filter(plan => plan.active);
  const selectedPlan = activePlans.find(plan => plan.id === selectedPlanId);

  const formatDate = (dateString: string) => {
    return formatBrazilianDate(dateString);
  };

  const calculateDates = (planDuration: string) => {
    const currentDate = dayjs.tz(new Date(), BRAZIL_TZ);
    const startDate = currentDate.startOf('day');

    let endDate;
    
    switch (planDuration.toLowerCase()) {
      case 'diária':
      case 'daily':
      case 'day':
        // Para plano diário, a data de vencimento é igual à data de início + 1 dia
        endDate = startDate.add(1, 'day').endOf('day');
        break;
      case 'mensal':
      case 'monthly':
      case 'month':
        endDate = startDate.add(30, 'day').endOf('day');
        break;
      case 'trimestral':
      case 'quarterly':
      case 'quarter':
        endDate = startDate.add(90, 'day').endOf('day');
        break;
      case 'semestral':
      case 'semester':
        endDate = startDate.add(180, 'day').endOf('day');
        break;
      case 'anual':
      case 'yearly':
      case 'year':
        endDate = startDate.add(365, 'day').endOf('day');
        break;
      default:
        endDate = startDate.add(30, 'day').endOf('day');
    }

    return {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD')
    };
  };

  // Buscar matrícula inativa e dependentes quando o modal abrir
  useEffect(() => {
    if (isOpen && student) {
      fetchInactiveEnrollmentWithDependents();
    }
  }, [isOpen, student]);

  const fetchInactiveEnrollmentWithDependents = async () => {
    try {
      if (!student) return;

      // 1. Buscar matrícula inativa
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', student.id)
        .eq('status', 'inactive')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (!enrollment) {
        setInactiveEnrollment(null);
        setOriginalDependents([]);
        return;
      }
      
      setInactiveEnrollment(enrollment);

      // 2. Buscar dependentes da matrícula inativa
      const { data: dependents } = await supabase
        .from('enrollment_dependents')
        .select('*')
        .eq('enrollment_id', enrollment.id);

      if (dependents && dependents.length > 0) {
        setOriginalDependents(dependents);
        
        // 3. Buscar informações dos alunos dependentes
        const dependentIds = dependents.map(d => d.dependent_student_id);
        const { data: students } = await supabase
          .from('students')
          .select('*')
          .in('id', dependentIds);

        if (students) {
          const map = new Map(students.map(s => [s.id, s]));
          setStudentsMap(map);
        }

        // 4. Selecionar todos por padrão
        setSelectedDependents(dependents.map(d => d.dependent_student_id));
      } else {
        setOriginalDependents([]);
        setSelectedDependents([]);
      }
    } catch (error) {
      console.error('Error fetching inactive enrollment:', error);
    }
  };

  useEffect(() => {
    if (selectedPlanId && activePlans.length > 0) {
      const selectedPlan = activePlans.find(plan => plan.id === selectedPlanId);
      if (selectedPlan) {
        try {
          const { startDate, endDate } = calculateDates(selectedPlan.duration);
          setNewStartDate(startDate);
          setNewEndDate(endDate);
        } catch (error) {
          console.error('Error calculating dates:', error);
          toast({
            title: "Erro",
            description: "Erro ao calcular datas do plano.",
            variant: "destructive"
          });
        }
      }
    }
  }, [selectedPlanId, activePlans]);

  // Calcular preço total (titular + dependentes selecionados)
  const calculateTotalPrice = () => {
    if (!selectedPlan) return 0;
    
    const titularPrice = selectedPlan.price;
    const dependentsPrice = originalDependents
      .filter(dep => selectedDependents.includes(dep.dependent_student_id))
      .reduce((sum, dep) => sum + dep.dependent_price, 0);
    
    return titularPrice + dependentsPrice;
  };

  const handleReactivate = async () => {
    if (!selectedPlanId || !student) {
      toast({
        title: "Erro",
        description: "Selecione um plano para reativação.",
        variant: "destructive"
      });
      return;
    }

    const selectedPlan = activePlans.find(plan => plan.id === selectedPlanId);
    if (!selectedPlan) {
      toast({
        title: "Erro",
        description: "Plano selecionado não encontrado.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calcular preço total
      const totalPrice = calculateTotalPrice();
      
      // Criar array de dependentes selecionados com seus preços
      const dependentsToReactivate = originalDependents
        .filter(dep => selectedDependents.includes(dep.dependent_student_id))
        .map(dep => ({
          dependent_student_id: dep.dependent_student_id,
          dependent_price: dep.dependent_price
        }));

      // Chamar função de reativação com dependentes
      const success = await onReactivate(
        student.id,
        selectedPlan.id,
        selectedPlan.name,
        selectedPlan.price, // Preço do titular
        selectedPlan.duration,
        dependentsToReactivate, // Passar dependentes selecionados
        totalPrice // Passar preço total
      );

      if (success) {
        const dependentText = dependentsToReactivate.length > 0 
          ? ` com ${dependentsToReactivate.length} dependente(s)` 
          : ' com plano individual';
        toast({
          title: "Aluno reativado!",
          description: `${student.name} foi reativado${dependentText}.`,
        });
        onClose();
        setSelectedPlanId('');
        setSelectedDependents([]);
        setOriginalDependents([]);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao reativar o aluno.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case 'day': return 'Diário';
      case 'month': return 'Mensal';
      case 'quarter': return 'Trimestral';
      case 'semester': return 'Semestral';
      case 'year': return 'Anual';
      default: return duration;
    }
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-white">
            <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            Reativar Aluno
          </DialogTitle>
          <DialogDescription className="text-base text-gray-800 dark:text-gray-200">
            Selecione um plano para reativar a matrícula do aluno
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Informações do Aluno */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Aluno</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-lg sm:text-xl break-words text-gray-900 dark:text-white">{student.name}</span>
                <Badge className="bg-gray-200 text-gray-900 font-bold hover:bg-gray-200">Inativo</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                <div className="overflow-hidden">
                  <span className="text-gray-900 dark:text-white font-semibold">Email:</span>
                  <p className="font-medium text-gray-900 dark:text-white break-all">{student.email}</p>
                </div>
                <div className="overflow-hidden">
                  <span className="text-gray-900 dark:text-white font-semibold">Telefone:</span>
                  <p className="font-medium text-gray-900 dark:text-white break-all">{student.phone}</p>
                </div>
                <div className="overflow-hidden">
                  <span className="text-gray-900 dark:text-white font-semibold">CPF:</span>
                  <p className="font-medium text-gray-900 dark:text-white break-all">{student.cpf}</p>
                </div>
                <div>
                  <span className="text-gray-900 dark:text-white font-semibold">Status:</span>
                  <p className="font-bold text-red-700 dark:text-red-400">Inativo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seleção do Plano */}
          <div className="space-y-4">
            <Label htmlFor="plan-select" className="text-base font-bold text-gray-900 dark:text-white">Selecionar Plano</Label>
            <Select value={selectedPlanId} onValueChange={(val) => { console.log('Selected plan in reactivation:', val); setSelectedPlanId(val); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha um plano para reativação" />
              </SelectTrigger>
              <SelectContent>
                {activePlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-base text-gray-900 dark:text-white">{plan.name} - {getDurationLabel(plan.duration)}</span>
                      <span className="ml-4 font-bold text-base text-gray-900 dark:text-white">R$ {plan.price.toFixed(2)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seleção de Dependentes (se existirem) */}
          {originalDependents.length > 0 && (
            <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  Dependentes a Reativar
                </CardTitle>
                <CardDescription>
                  Selecione quais dependentes serão reativados junto com o titular
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {originalDependents.map((dep) => {
                  const dependentStudent = studentsMap.get(dep.dependent_student_id);
                  const isSelected = selectedDependents.includes(dep.dependent_student_id);
                  
                  return (
                    <div key={dep.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`dep-${dep.id}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedDependents([...selectedDependents, dep.dependent_student_id]);
                            } else {
                              setSelectedDependents(selectedDependents.filter(id => id !== dep.dependent_student_id));
                            }
                          }}
                        />
                        <Label htmlFor={`dep-${dep.id}`} className="cursor-pointer">
                          <div>
                            <p className="font-semibold">{dependentStudent?.name || 'Dependente'}</p>
                            <p className="text-sm text-muted-foreground">{dependentStudent?.cpf}</p>
                          </div>
                        </Label>
                      </div>
                      <Badge variant="outline" className="font-bold">
                        + R$ {dep.dependent_price.toFixed(2)}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Preview do Novo Plano */}
          {selectedPlanId && newStartDate && newEndDate && selectedPlan && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-green-900 dark:text-green-100">
                  <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  Preview da Reativação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                  <div>
                    <span className="text-green-800 dark:text-green-200 font-semibold">Data de Início:</span>
                    <p className="font-medium text-green-900 dark:text-green-100">{formatDate(newStartDate)}</p>
                  </div>
                  <div>
                    <span className="text-green-800 dark:text-green-200 font-semibold">Data de Término:</span>
                    <p className="font-medium text-green-900 dark:text-green-100">{formatDate(newEndDate)}</p>
                  </div>
                  <div>
                    <span className="text-green-800 dark:text-green-200 font-semibold">Valor do Plano:</span>
                    <div className="space-y-1">
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Titular: R$ {selectedPlan.price.toFixed(2)}
                      </p>
                      {selectedDependents.length > 0 && (
                        <>
                          <p className="font-medium text-green-900 dark:text-green-100">
                            Dependentes ({selectedDependents.length}): 
                            R$ {(calculateTotalPrice() - selectedPlan.price).toFixed(2)}
                          </p>
                          <p className="font-bold text-green-700 dark:text-green-300 text-lg">
                            Total: R$ {calculateTotalPrice().toFixed(2)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-green-800 dark:text-green-200 font-semibold">Duração:</span>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      {getDurationLabel(selectedPlan.duration)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={handleReactivate}
              disabled={!selectedPlanId || isSubmitting}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 w-full sm:w-auto"
            >
              {isSubmitting ? 'Reativando...' : 'Confirmar Reativação'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentReactivationModal;
