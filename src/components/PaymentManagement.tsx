import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useInstallments, Installment } from '@/hooks/useInstallments';
import { Calendar, DollarSign, AlertCircle, CheckCircle2, Clock, Users } from 'lucide-react';
import dayjs from '@/lib/dayjs';

const PaymentManagement = () => {
  const { installments, loading, fetchInstallments, markAsPaid } = useInstallments();
  const [filteredInstallments, setFilteredInstallments] = useState<Installment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showNext7Days, setShowNext7Days] = useState(false);

  useEffect(() => {
    fetchInstallments();
  }, []);

  useEffect(() => {
    let filtered = installments;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(i => 
        i.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.student?.cpf.includes(searchTerm)
      );
    }

    // Filtro por data de vencimento
    if (startDate && endDate) {
      const start = dayjs(startDate).startOf('day');
      const end = dayjs(endDate).endOf('day');
      
      filtered = filtered.filter(i => {
        const dueDate = dayjs(i.due_date);
        return dueDate.isAfter(start) || dueDate.isSame(start, 'day') && (dueDate.isBefore(end) || dueDate.isSame(end, 'day'));
      });
    }

    setFilteredInstallments(filtered);
  }, [installments, statusFilter, searchTerm, startDate, endDate]);

  const handleNext7Days = () => {
    const today = dayjs().startOf('day');
    const next7Days = dayjs().add(7, 'days').endOf('day');
    
    setStartDate(today.format('YYYY-MM-DD'));
    setEndDate(next7Days.format('YYYY-MM-DD'));
    setShowNext7Days(true);
  };

  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
    setShowNext7Days(false);
  };

  const handleConfirmPayment = async () => {
    if (!selectedInstallment || !paymentMethod) return;

    setIsSubmitting(true);
    const success = await markAsPaid(selectedInstallment.id, paymentMethod, paymentNotes);
    setIsSubmitting(false);

    if (success) {
      setSelectedInstallment(null);
      setPaymentMethod('');
      setPaymentNotes('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Pago</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Atrasado</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
    }
  };

  const totalPending = installments.filter(i => i.status === 'pending').reduce((sum, i) => sum + Number(i.amount), 0);
  const totalOverdue = installments.filter(i => i.status === 'overdue').reduce((sum, i) => sum + Number(i.amount), 0);
  const totalPaid = installments.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">A Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">R$ {totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {installments.filter(i => i.status === 'pending').length} parcelas pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atrasado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">R$ {totalOverdue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {installments.filter(i => i.status === 'overdue').length} parcelas vencidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pago no Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totalPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {installments.filter(i => i.status === 'paid').length} parcelas recebidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Parcelas</CardTitle>
          <CardDescription>Visualize e gerencie os pagamentos dos alunos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Buscar Aluno</Label>
              <Input
                placeholder="Nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Filtrar por Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="overdue">Atrasado</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Filtros de Data de Vencimento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Data Início (Vencimento)</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim (Vencimento)</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex gap-2">
                <Button
                  variant={showNext7Days ? "default" : "outline"}
                  onClick={handleNext7Days}
                  className="flex-1"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Próximos 7 dias
                </Button>
                {(startDate || endDate) && (
                  <Button
                    variant="ghost"
                    onClick={clearDateFilters}
                    className="px-3"
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Parcelas */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Carregando parcelas...
            </CardContent>
          </Card>
        ) : filteredInstallments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma parcela encontrada
            </CardContent>
          </Card>
        ) : (
          filteredInstallments.map((installment) => (
            <Card key={installment.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{installment.student?.name}</h3>
                      {installment.is_family_plan && (
                        <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                          <Users className="h-3 w-3 mr-1" />
                          Plano Familiar
                        </Badge>
                      )}
                      {getStatusBadge(installment.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Parcela {installment.installment_number}/{installment.total_installments}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Venc: {dayjs(installment.due_date).format('DD/MM/YYYY')}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        R$ {Number(installment.amount).toFixed(2)}
                      </span>
                    </div>
                    {installment.paid_date && (
                      <p className="text-xs text-green-600">
                        Pago em {dayjs(installment.paid_date).format('DD/MM/YYYY')}
                        {installment.payment_method && ` via ${installment.payment_method}`}
                      </p>
                    )}
                  </div>
                  {installment.status !== 'paid' && (
                    <Button
                      onClick={() => setSelectedInstallment(installment)}
                      variant="default"
                    >
                      Confirmar Recebimento
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Confirmação de Pagamento */}
      <Dialog open={!!selectedInstallment} onOpenChange={() => setSelectedInstallment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Recebimento</DialogTitle>
            <DialogDescription>
              Registre o pagamento da parcela {selectedInstallment?.installment_number} de {selectedInstallment?.student?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Método de Pagamento *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                  <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea
                placeholder="Ex: Pago com desconto, pago parcialmente..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Valor:</span>
                <span className="text-xl font-bold text-green-600">
                  R$ {Number(selectedInstallment?.amount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedInstallment(null)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={!paymentMethod || isSubmitting}
            >
              {isSubmitting ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement;
