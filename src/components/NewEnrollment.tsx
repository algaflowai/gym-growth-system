import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { Plan } from '@/pages/Index';

interface NewEnrollmentProps {
  plans: Plan[];
}

const NewEnrollment = ({ plans }: NewEnrollmentProps) => {
  const [formData, setFormData] = useState({
    // Dados Pessoais
    name: '',
    phone: '',
    cpf: '',
    rg: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    
    // Dados de Matrícula
    plan: '',
    mainGoal: '',
    notes: '',
    
    // Dados Médicos
    healthIssues: '',
    restrictions: '',
    emergencyContact: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    toast({
      title: "Matrícula criada com sucesso!",
      description: `${formData.name} foi cadastrado(a) no sistema.`,
    });

    // Reset form
    setFormData({
      name: '', phone: '', cpf: '', rg: '', email: '', address: '', city: '', zipCode: '',
      plan: '', mainGoal: '', notes: '', healthIssues: '', restrictions: '', emergencyContact: ''
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Nova Matrícula</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Preencha os dados do novo aluno</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-t-lg">
            <CardTitle className="flex items-center space-x-3">
              <span className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
              <span className="text-xl">Dados Pessoais</span>
            </CardTitle>
            <CardDescription className="text-base">Informações básicas do aluno</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                required
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
                required
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                value={formData.rg}
                onChange={(e) => handleInputChange('rg', e.target.value)}
                placeholder="00.000.000-0"
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="00000-000"
                className="h-12"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, número, bairro"
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="h-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dados de Matrícula */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-t-lg">
            <CardTitle className="flex items-center space-x-3">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
              <span className="text-xl">Dados de Matrícula</span>
            </CardTitle>
            <CardDescription className="text-base">Informações sobre o plano e objetivos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Plano *</Label>
              <RadioGroup
                value={formData.plan}
                onValueChange={(value) => handleInputChange('plan', value)}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {plans.map((plan) => (
                  <div key={plan.id} className="flex items-center space-x-3 border-2 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <RadioGroupItem value={plan.id} id={plan.id} />
                    <Label htmlFor={plan.id} className="cursor-pointer flex-1">
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-green-600 font-bold">R$ {plan.price}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mainGoal">Objetivo Principal</Label>
              <Input
                id="mainGoal"
                value={formData.mainGoal}
                onChange={(e) => handleInputChange('mainGoal', e.target.value)}
                placeholder="Ex: Perda de peso, ganho de massa muscular, condicionamento..."
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Informações adicionais sobre o aluno"
                rows={3}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dados Médicos */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-t-lg">
            <CardTitle className="flex items-center space-x-3">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
              <span className="text-xl">Dados Médicos</span>
            </CardTitle>
            <CardDescription className="text-base">Informações importantes para a segurança do aluno</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="healthIssues">Problemas de Saúde</Label>
              <Textarea
                id="healthIssues"
                value={formData.healthIssues}
                onChange={(e) => handleInputChange('healthIssues', e.target.value)}
                placeholder="Descreva qualquer problema de saúde relevante"
                rows={2}
                className="resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="restrictions">Restrições Médicas</Label>
              <Textarea
                id="restrictions"
                value={formData.restrictions}
                onChange={(e) => handleInputChange('restrictions', e.target.value)}
                placeholder="Exercícios ou atividades que devem ser evitados"
                rows={2}
                className="resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Contato de Emergência</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                placeholder="Nome e telefone para emergências"
                className="h-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button type="button" variant="outline" className="h-12 px-8">
            Cancelar
          </Button>
          <Button 
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 h-12 px-8"
          >
            Salvar Matrícula
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewEnrollment;
