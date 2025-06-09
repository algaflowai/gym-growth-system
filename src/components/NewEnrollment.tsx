
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';

const NewEnrollment = () => {
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
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Nova Matrícula</h2>
        <p className="text-gray-600">Preencha os dados do novo aluno</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              <span>Dados Pessoais</span>
            </CardTitle>
            <CardDescription>Informações básicas do aluno</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                value={formData.rg}
                onChange={(e) => handleInputChange('rg', e.target.value)}
                placeholder="00.000.000-0"
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="00000-000"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, número, bairro"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Dados de Matrícula */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              <span>Dados de Matrícula</span>
            </CardTitle>
            <CardDescription>Informações sobre o plano e objetivos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Plano *</Label>
              <RadioGroup
                value={formData.plan}
                onValueChange={(value) => handleInputChange('plan', value)}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="cursor-pointer">Mensal - R$ 89</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="quarterly" id="quarterly" />
                  <Label htmlFor="quarterly" className="cursor-pointer">Trimestral - R$ 240</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="annual" id="annual" />
                  <Label htmlFor="annual" className="cursor-pointer">Anual - R$ 890</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mainGoal">Objetivo Principal</Label>
              <Input
                id="mainGoal"
                value={formData.mainGoal}
                onChange={(e) => handleInputChange('mainGoal', e.target.value)}
                placeholder="Ex: Perda de peso, ganho de massa muscular, condicionamento..."
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
              />
            </div>
          </CardContent>
        </Card>

        {/* Dados Médicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              <span>Dados Médicos</span>
            </CardTitle>
            <CardDescription>Informações importantes para a segurança do aluno</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="healthIssues">Problemas de Saúde</Label>
              <Textarea
                id="healthIssues"
                value={formData.healthIssues}
                onChange={(e) => handleInputChange('healthIssues', e.target.value)}
                placeholder="Descreva qualquer problema de saúde relevante"
                rows={2}
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Contato de Emergência</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                placeholder="Nome e telefone para emergências"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button 
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            Salvar Matrícula
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewEnrollment;
