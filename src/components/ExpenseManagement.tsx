import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Expense {
  id: string;
  name: string;
  amount: number;
  due_day: number;
  category?: string;
  description?: string;
  is_active: boolean;
}

export const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    due_day: '',
    category: '',
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('fixed_expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('due_day');

      if (error) throw error;
      if (data) setExpenses(data);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar despesas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      due_day: '',
      category: '',
      description: ''
    });
  };

  const handleCreate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!formData.name || !formData.amount || !formData.due_day) {
        toast({
          title: 'Campos obrigatórios',
          description: 'Preencha nome, valor e dia do vencimento',
          variant: 'destructive',
        });
        return;
      }

      const dueDay = parseInt(formData.due_day);
      if (dueDay < 1 || dueDay > 28) {
        toast({
          title: 'Dia inválido',
          description: 'O dia do vencimento deve estar entre 1 e 28',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.from('fixed_expenses').insert({
        user_id: user.id,
        name: formData.name,
        amount: parseFloat(formData.amount),
        due_day: dueDay,
        category: formData.category || 'Geral',
        description: formData.description
      });

      if (error) throw error;

      toast({
        title: 'Despesa criada',
        description: 'Despesa fixa adicionada com sucesso',
      });

      fetchExpenses();
      setShowForm(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar despesa',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fixed_expenses')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Despesa removida',
        description: 'Despesa fixa foi desativada',
      });

      fetchExpenses();
    } catch (error: any) {
      toast({
        title: 'Erro ao remover despesa',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Despesas Fixas Mensais</CardTitle>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Despesa
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Formulário de criação */}
        {showForm && (
          <div className="mb-6 p-4 border rounded-lg space-y-4 bg-muted/50">
            <div>
              <Label htmlFor="name">Nome da Despesa *</Label>
              <Input
                id="name"
                placeholder="Ex: Aluguel"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Valor (R$) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="due_day">Dia do Vencimento (1-28) *</Label>
                <Input
                  id="due_day"
                  type="number"
                  min="1"
                  max="28"
                  placeholder="10"
                  value={formData.due_day}
                  onChange={(e) => setFormData({...formData, due_day: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                placeholder="Ex: Operacional, Administrativa"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Detalhes adicionais (opcional)"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Salvar</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de despesas */}
        <div className="space-y-3">
          {expenses.map(expense => (
            <div key={expense.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{expense.name}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {expense.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Vencimento: dia {expense.due_day} de cada mês
                </p>
                {expense.description && (
                  <p className="text-xs text-muted-foreground mt-1">{expense.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-lg text-foreground">
                  R$ {expense.amount.toFixed(2)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(expense.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {expenses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma despesa cadastrada</p>
              <p className="text-sm text-muted-foreground mt-1">
                Clique em "Nova Despesa" para adicionar
              </p>
            </div>
          )}
        </div>

        {/* Total */}
        {expenses.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">Total Mensal:</span>
              <span className="font-bold text-2xl text-primary">
                R$ {totalExpenses.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
