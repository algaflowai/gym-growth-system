import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, CreditCardIcon, UserCheck } from 'lucide-react';
import { Plan } from '@/pages/Index';
import { Student } from '@/hooks/useStudents';
import { toast } from '@/hooks/use-toast';
import dayjs, { BRAZIL_TZ, formatBrazilianDate } from '@/lib/dayjs';

interface StudentReactivationModalProps {
  student: Student | null;
  plans: Plan[];
  isOpen: boolean;
  onClose: () => void;
  onReactivate: (studentId: string, planId: string, planName: string, planPrice: number, duration: string) => Promise<boolean>;
}

const StudentReactivationModal = ({ student, plans, isOpen, onClose, onReactivate }: StudentReactivationModalProps) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [newStartDate, setNewStartDate] = useState<string>('');
  const [newEndDate, setNewEndDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activePlans = plans.filter(plan => plan.active);

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
      const success = await onReactivate(
        student.id,
        selectedPlan.id,
        selectedPlan.name,
        selectedPlan.price,
        selectedPlan.duration
      );

      if (success) {
        toast({
          title: "Aluno reativado!",
          description: `${student.name} foi reativado com o plano ${selectedPlan.name}.`,
        });
        onClose();
        setSelectedPlanId('');
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
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                <div>
                  <span className="text-gray-900 dark:text-white font-semibold">Email:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{student.email}</p>
                </div>
                <div>
                  <span className="text-gray-900 dark:text-white font-semibold">Telefone:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{student.phone}</p>
                </div>
                <div>
                  <span className="text-gray-900 dark:text-white font-semibold">CPF:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{student.cpf}</p>
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
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
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

          {/* Preview do Novo Plano */}
          {selectedPlanId && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  Preview da Reativação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                  <div>
                    <span className="text-gray-900 dark:text-white font-semibold">Data de Início:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(newStartDate)}</p>
                  </div>
                  <div>
                    <span className="text-gray-900 dark:text-white font-semibold">Data de Término:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(newEndDate)}</p>
                  </div>
                  <div>
                    <span className="text-gray-900 dark:text-white font-semibold">Valor do Plano:</span>
                    <p className="font-bold text-green-700 dark:text-green-400">
                      R$ {activePlans.find(p => p.id === selectedPlanId)?.price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-900 dark:text-white font-semibold">Duração:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getDurationLabel(activePlans.find(p => p.id === selectedPlanId)?.duration || '')}
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
