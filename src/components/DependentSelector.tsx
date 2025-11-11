import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Student {
  id: string;
  name: string;
}

interface DependentSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  excludeStudentIds?: string[];
  onAddDependent: (dependentStudentId: string, dependentPrice: number) => Promise<void>;
}

export const DependentSelector = ({
  open,
  onOpenChange,
  students,
  excludeStudentIds = [],
  onAddDependent,
}: DependentSelectorProps) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [dependentPrice, setDependentPrice] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const availableStudents = students.filter(
    (student) => !excludeStudentIds.includes(student.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudentId || !dependentPrice) {
      return;
    }

    const price = parseFloat(dependentPrice);
    if (isNaN(price) || price < 0) {
      return;
    }

    setLoading(true);
    try {
      await onAddDependent(selectedStudentId, price);
      setSelectedStudentId('');
      setDependentPrice('');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar Dependente</DialogTitle>
            <DialogDescription>
              Selecione um aluno para adicionar como dependente neste plano
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dependent-student">Aluno Dependente</Label>
              <Select
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
                disabled={loading}
              >
                <SelectTrigger id="dependent-student">
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {availableStudents.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Nenhum aluno disponível
                    </div>
                  ) : (
                    availableStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dependent-price">Valor Mensalidade</Label>
              <Input
                id="dependent-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={dependentPrice}
                onChange={(e) => setDependentPrice(e.target.value)}
                disabled={loading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Valor individual da mensalidade deste dependente
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedStudentId || !dependentPrice}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
