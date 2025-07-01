
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
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const calculateDates = (planDuration: string) => {
    const currentDate = new Date();
    const enrollmentEndDate = new Date(enrollment?.end_date || '');
    
    // Se o plano já expirou, usa a data atual. Senão, usa o dia seguinte ao término
    const startDate = enrollmentEndDate < currentDate 
      ? currentDate 
      : new Date(enrollmentEndDate.getTime() + 24 * 60 * 60 * 1000);

    let endDate = new Date(startDate);
    
    switch (planDuration) {
      case 'day':
        // Para plano diário, vence em 24 horas
        endDate = new Date(startDate.getTime() + (24 * 60 * 60 * 1000));
        break;
      case 'month':
        endDate.setDate(startDate.getDate() + 30);
        break;
      case 'quarter':
        endDate.setDate(startDate.getDate() + 90);
        break;
      case 'semester':
        endDate.setDate(startDate.getDate() + 180);
        break;
      case 'year':
        endDate.setDate(startDate.getDate() + 365);
        break;
      default:
        endDate.setDate(startDate.getDate() + 30);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  useEffect(() => {
    if (selectedPlanId && enrollment) {
      const selectedPlan = activePlans.find(plan => plan.id === selectedPlanId);
      if (selectedPlan) {
        const { startDate, endDate } = calculateDates(selectedPlan.duration);
        setNewStartDate(startDate);
        setNewEndDate(endDate);
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
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expirado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!enrollment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CreditCardIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            Renovar Plano
          </DialogTitle>
          <DialogDescription className="text-sm">
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
                <span className="font-medium text-sm sm:text-base break-words">{enrollment.student?.name}</span>
                {getStatusBadge(enrollment.status)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Plano:</span>
                  <p className="font-medium">{enrollment.plan_name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Valor:</span>
                  <p className="font-medium">R$ {enrollment.plan_price.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Data de Início:</span>
                  <p className="font-medium">{formatDate(enrollment.start_date)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Data de Término:</span>
                  <p className="font-medium">{formatDate(enrollment.end_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seleção do Novo Plano */}
          <div className="space-y-4">
            <Label htmlFor="plan-select" className="text-sm font-medium">Selecionar Novo Plano</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha um plano para renovação" />
              </SelectTrigger>
              <SelectContent>
                {activePlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">{plan.name} - {getDurationLabel(plan.duration)}</span>
                      <span className="ml-4 font-semibold text-sm">R$ {plan.price.toFixed(2)}</span>
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
                  Preview da Renovação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Nova Data de Início:</span>
                    <p className="font-medium">{formatDate(newStartDate)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Nova Data de Término:</span>
                    <p className="font-medium">{formatDate(newEndDate)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Valor do Plano:</span>
                    <p className="font-medium text-green-700">
                      R$ {activePlans.find(p => p.id === selectedPlanId)?.price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duração:</span>
                    <p className="font-medium">
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
