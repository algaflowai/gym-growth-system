
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, CreditCardIcon } from 'lucide-react';
import { Plan } from '@/pages/Index';
import { Enrollment } from '@/hooks/useEnrollments';
import { toast } from '@/hooks/use-toast';
import dayjs, { BRAZIL_TZ, formatBrazilianDate } from '@/lib/dayjs';

interface PlanRenewalModalProps {
  enrollment: Enrollment | null;
  plans: Plan[];
  isOpen: boolean;
  onClose: () => void;
  onRenew: (enrollmentId: string, planId: string, planName: string, planPrice: number, duration: string) => Promise<boolean>;
}

const PlanRenewalModal = ({ enrollment, plans, isOpen, onClose, onRenew }: PlanRenewalModalProps) => {
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
    const enrollmentEndDate = dayjs.tz(enrollment?.end_date || '', BRAZIL_TZ);
    
    // Se o plano já expirou, usa a data atual. Senão, usa o dia seguinte ao término
    const startDate = enrollmentEndDate.isBefore(currentDate) 
      ? currentDate.startOf('day')
      : enrollmentEndDate.add(1, 'day').startOf('day');

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
    if (selectedPlanId && enrollment && activePlans.length > 0) {
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
  }, [selectedPlanId, enrollment, activePlans]);

  const handleRenew = async () => {
    if (!selectedPlanId || !enrollment) {
      toast({
        title: "Erro",
        description: "Selecione um plano para renovação.",
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
      const success = await onRenew(
        enrollment.id,
        selectedPlan.id,
        selectedPlan.name,
        selectedPlan.price,
        selectedPlan.duration
      );

      if (success) {
        toast({
          title: "Plano renovado!",
          description: `O plano ${selectedPlan.name} foi renovado com sucesso.`,
        });
        onClose();
        setSelectedPlanId('');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao renovar o plano.",
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-200 text-green-900 font-bold hover:bg-green-200">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-200 text-gray-900 font-bold hover:bg-gray-200">Inativo</Badge>;
      case 'expired':
        return <Badge className="bg-red-200 text-red-900 font-bold hover:bg-red-200">Expirado</Badge>;
      default:
        return <Badge className="bg-gray-200 text-gray-900 font-bold hover:bg-gray-200">{status}</Badge>;
    }
  };

  if (!enrollment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-white">
            <CreditCardIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            Renovar Plano
          </DialogTitle>
          <DialogDescription className="text-base text-gray-800 dark:text-gray-200">
            Selecione um novo plano para renovar a matrícula do aluno
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Informações do Plano Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Plano Atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-lg sm:text-xl break-words text-gray-900 dark:text-white">{enrollment.student?.name}</span>
                {getStatusBadge(enrollment.status)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                <div>
                  <span className="text-gray-900 dark:text-white font-semibold">Plano:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{enrollment.plan_name}</p>
                </div>
                <div>
                  <span className="text-gray-900 dark:text-white font-semibold">Valor:</span>
                  <p className="font-medium text-gray-900 dark:text-white">R$ {enrollment.plan_price.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-900 dark:text-white font-semibold">Data de Início:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(enrollment.start_date)}</p>
                </div>
                <div>
                  <span className="text-gray-900 dark:text-white font-semibold">Data de Término:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(enrollment.end_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seleção do Novo Plano */}
          <div className="space-y-4">
            <Label htmlFor="plan-select" className="text-base font-bold text-gray-900 dark:text-white">Selecionar Novo Plano</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha um plano para renovação" />
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
          {selectedPlanId && newStartDate && newEndDate && (() => {
            const previewPlan = activePlans.find(p => p.id === selectedPlanId);
            return previewPlan ? (
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-foreground">
                    <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    Preview da Renovação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                    <div>
                      <span className="text-foreground font-semibold">Nova Data de Início:</span>
                      <p className="font-medium text-foreground">{formatDate(newStartDate)}</p>
                    </div>
                    <div>
                      <span className="text-foreground font-semibold">Nova Data de Término:</span>
                      <p className="font-medium text-foreground">{formatDate(newEndDate)}</p>
                    </div>
                    <div>
                      <span className="text-foreground font-semibold">Valor do Plano:</span>
                      <p className="font-bold text-green-700 dark:text-green-400">
                        R$ {previewPlan.price.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-foreground font-semibold">Duração:</span>
                      <p className="font-medium text-foreground">
                        {getDurationLabel(previewPlan.duration)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null;
          })()}

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
              onClick={handleRenew}
              disabled={!selectedPlanId || isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 w-full sm:w-auto"
            >
              {isSubmitting ? 'Renovando...' : 'Confirmar Renovação'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanRenewalModal;
