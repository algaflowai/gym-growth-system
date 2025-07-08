
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Plan } from '@/pages/Index';

interface PlansManagementProps {
  plans: Plan[];
  onAddPlan: (plan: Omit<Plan, 'id'>) => void;
  onUpdatePlan: (id: string, plan: Partial<Plan>) => void;
  onDeletePlan: (id: string) => void;
}

const PlansManagement = ({ plans, onAddPlan, onUpdatePlan, onDeletePlan }: PlansManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: 'month'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const planData = {
      name: formData.name,
      price: parseFloat(formData.price),
      duration: formData.duration,
      durationDays: getDurationDays(formData.duration),
      active: true
    };

    if (editingPlan) {
      onUpdatePlan(editingPlan.id, planData);
      toast({
        title: "Plano atualizado!",
        description: `O plano ${formData.name} foi atualizado com sucesso.`,
      });
    } else {
      onAddPlan(planData);
      toast({
        title: "Plano criado!",
        description: `O plano ${formData.name} foi criado com sucesso.`,
      });
    }

    setFormData({ name: '', price: '', duration: 'month' });
    setEditingPlan(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      duration: plan.duration
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (plan: Plan) => {
    if (confirm(`Tem certeza que deseja excluir o plano "${plan.name}"?`)) {
      onDeletePlan(plan.id);
      toast({
        title: "Plano excluído!",
        description: `O plano ${plan.name} foi excluído com sucesso.`,
      });
    }
  };

  const handleToggleActive = (plan: Plan) => {
    onUpdatePlan(plan.id, { active: !plan.active });
    toast({
      title: plan.active ? "Plano desativado!" : "Plano ativado!",
      description: `O plano ${plan.name} foi ${plan.active ? 'desativado' : 'ativado'}.`,
    });
  };

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case 'day':
        return 'Diário';
      case 'month':
        return 'Mensal';
      case 'quarter':
        return 'Trimestral';
      case 'semester':
        return 'Semestral';
      case 'year':
        return 'Anual';
      default:
        return duration;
    }
  };

  const getDurationDays = (duration: string) => {
    switch (duration) {
      case 'day': return 1;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'semester': return 180;
      case 'year': return 365;
      default: return 30;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Gestão de Planos</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Configure os planos disponíveis para matrícula</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 h-12"
              onClick={() => {
                setEditingPlan(null);
                setFormData({ name: '', price: '', duration: 'month' });
              }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}</DialogTitle>
              <DialogDescription>
                {editingPlan ? 'Edite as informações do plano abaixo.' : 'Preencha as informações do novo plano.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="planName">Nome do Plano</Label>
                <Input
                  id="planName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Plano Premium"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="planPrice">Preço (R$)</Label>
                <Input
                  id="planPrice"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="89.90"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="planDuration">Duração</Label>
                <select
                  id="planDuration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="day">Diário</option>
                  <option value="month">Mensal</option>
                  <option value="quarter">Trimestral</option>
                  <option value="semester">Semestral</option>
                  <option value="year">Anual</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-green-600">
                  {editingPlan ? 'Atualizar' : 'Criar'} Plano
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`border-0 shadow-lg transition-all duration-200 ${plan.active ? '' : 'opacity-60'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={plan.active}
                    onCheckedChange={() => handleToggleActive(plan)}
                  />
                  <span className={`text-xs px-2 py-1 rounded-full ${plan.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {plan.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <CardDescription className="text-lg font-bold text-green-600">
                R$ {plan.price.toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Duração:</span>
                  <p className="font-medium">
                    {getDurationLabel(plan.duration)}
                  </p>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(plan)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(plan)}
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              Nenhum plano cadastrado ainda.
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Criar Primeiro Plano
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlansManagement;
