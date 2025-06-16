
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
        endDate.setDate(startDate.getDate() + 1);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Renovar Plano
          </DialogTitle>
          <DialogDescription>
            Selecione um novo plano para renovar a matrícula do aluno
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Plano Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plano Atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{enrollment.student?.name}</span>
                {getStatusBadge(enrollment.status)}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <p className="font-medium">{new Date(enrollment.start_date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Data de Término:</span>
                  <p className="font-medium">{new Date(enrollment.end_date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seleção do Novo Plano */}
          <div className="space-y-4">
            <Label htmlFor="plan-select">Selecionar Novo Plano</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um plano para renovação" />
              </SelectTrigger>
              <SelectContent>
                {activePlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{plan.name} - {getDurationLabel(plan.duration)}</span>
                      <span className="ml-4 font-semibold">R$ {plan.price.toFixed(2)}</span>
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
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Preview da Renovação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Nova Data de Início:</span>
                    <p className="font-medium">{new Date(newStartDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Nova Data de Término:</span>
                    <p className="font-medium">{new Date(newEndDate).toLocaleDateString('pt-BR')}</p>
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
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleRenew}
              disabled={!selectedPlanId || isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
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
