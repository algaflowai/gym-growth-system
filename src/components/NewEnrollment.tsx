
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { useStudents } from '@/hooks/useStudents';
import { useEnrollments } from '@/hooks/useEnrollments';
import { supabase } from '@/integrations/supabase/client';
import { Plan } from '@/pages/Index';

interface NewEnrollmentProps {
  plans: Plan[];
}

const NewEnrollment = ({ plans }: NewEnrollmentProps) => {
  const { createStudent } = useStudents();
  const { createEnrollment } = useEnrollments();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingStudent, setExistingStudent] = useState<any>(null);
  const [showExistingStudentOption, setShowExistingStudentOption] = useState(false);
  
  // Carregar dados salvos do localStorage na inicialização
  const loadSavedFormData = () => {
    try {
      const saved = localStorage.getItem('algagym-new-enrollment-form');
      if (saved) {
        const parsedData = JSON.parse(saved);
        return parsedData;
      }
    } catch (error) {
      console.error('Erro ao carregar dados salvos:', error);
    }
    return {
      // Dados Pessoais
      name: '',
      phone: '',
      cpf: '',
      rg: '',
      email: '',
      address: '',
      city: '',
      zipCode: '',
      birthDate: '',
      
      // Dados de Matrícula
      plan: '',
      mainGoal: '',
      notes: '',
      
      // Dados Médicos
      healthIssues: '',
      restrictions: '',
      emergencyContact: ''
    };
  };
  
  const [formData, setFormData] = useState(loadSavedFormData);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Salvar dados no localStorage sempre que formData mudar
  useEffect(() => {
    const saveFormData = () => {
      try {
        localStorage.setItem('algagym-new-enrollment-form', JSON.stringify(formData));
      } catch (error) {
        console.error('Erro ao salvar dados do formulário:', error);
      }
    };
    
    // Só salva se pelo menos um campo estiver preenchido
    const hasData = Object.values(formData).some(value => typeof value === 'string' && value.trim() !== '');
    if (hasData) {
      saveFormData();
    }
  }, [formData]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validação de campos obrigatórios
    if (!formData.name.trim()) errors.name = 'Nome é obrigatório';
    if (!formData.phone.trim()) errors.phone = 'Telefone é obrigatório';
    if (!formData.cpf.trim()) errors.cpf = 'CPF é obrigatório';
    if (!formData.email.trim()) errors.email = 'Email é obrigatório';
    if (!formData.plan) errors.plan = 'Plano é obrigatório';

    // Validação de CPF (formato básico)
    const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
    if (formData.cpf && !cpfRegex.test(formData.cpf)) {
      errors.cpf = 'CPF deve ter formato válido (000.000.000-00)';
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Email deve ter formato válido';
    }

    // Validação de telefone
    const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.phone = 'Telefone deve ter formato válido (11) 99999-9999';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkExistingStudent = async (cpf: string) => {
    try {
      console.log('Verificando se existe aluno com CPF:', cpf);
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('cpf', cpf.trim())
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar CPF existente:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao verificar CPF:', error);
      return null;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro de validação quando o usuário começar a digitar
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Verificar CPF em tempo real quando o usuário parar de digitar
    if (field === 'cpf' && value.length >= 11) {
      const timeoutId = setTimeout(async () => {
        const existing = await checkExistingStudent(value);
        if (existing) {
          setExistingStudent(existing);
          setShowExistingStudentOption(true);
        } else {
          setExistingStudent(null);
          setShowExistingStudentOption(false);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  };

  const handleUseExistingStudent = async () => {
    if (!existingStudent) return;

    try {
      setIsSubmitting(true);

      // Verificar se já existe matrícula ativa para este aluno
      const { data: existingEnrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', existingStudent.id)
        .eq('status', 'active');

      if (enrollmentError) {
        console.error('Erro ao verificar matrículas existentes:', enrollmentError);
        toast({
          title: "Erro",
          description: "Erro ao verificar matrículas existentes.",
          variant: "destructive",
        });
        return;
      }

      if (existingEnrollments && existingEnrollments.length > 0) {
        toast({
          title: "Atenção",
          description: "Este aluno já possui uma matrícula ativa.",
          variant: "destructive",
        });
        return;
      }

      // Criar nova matrícula para aluno existente
      const selectedPlan = plans.find(p => p.id === formData.plan);
      if (!selectedPlan) {
        toast({
          title: "Erro",
          description: "Plano selecionado não encontrado.",
          variant: "destructive",
        });
        return;
      }

      const startDate = new Date();
      const endDate = new Date();
      
      switch (selectedPlan.duration) {
        case 'Diária':
        case 'daily':
          // For daily plans, end date is start date + 1 day
          endDate.setDate(startDate.getDate() + 1);
          break;
        case 'month':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'quarter':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case 'year':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        default:
          endDate.setMonth(endDate.getMonth() + 1);
      }

      const enrollmentData = {
        student_id: existingStudent.id,
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.name,
        plan_price: selectedPlan.price,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active' as const,
      };

      const newEnrollment = await createEnrollment(enrollmentData);
      
      if (newEnrollment) {
        toast({
          title: "Sucesso!",
          description: `Nova matrícula criada para ${existingStudent.name}!`,
        });

        // Reset form e limpar localStorage
        const resetData = {
          name: '', phone: '', cpf: '', rg: '', email: '', address: '', city: '', zipCode: '', birthDate: '',
          plan: '', mainGoal: '', notes: '', healthIssues: '', restrictions: '', emergencyContact: ''
        };
        setFormData(resetData);
        localStorage.removeItem('algagym-new-enrollment-form');
        setExistingStudent(null);
        setShowExistingStudentOption(false);
      }
    } catch (error) {
      console.error('Erro ao criar matrícula para aluno existente:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar matrícula.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, corrija os campos destacados.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Iniciando criação de matrícula...');
      console.log('Dados do formulário:', formData);
      
      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Usuário autenticado:', user);
      console.log('Erro de autenticação:', authError);
      
      if (!user) {
        toast({
          title: "Erro de Autenticação",
          description: "Você precisa estar logado para criar uma matrícula.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Verificar novamente se o CPF já existe
      const existingStudent = await checkExistingStudent(formData.cpf);
      if (existingStudent) {
        setExistingStudent(existingStudent);
        setShowExistingStudentOption(true);
        setIsSubmitting(false);
        return;
      }

      // Encontrar o plano selecionado
      const selectedPlan = plans.find(p => p.id === formData.plan);
      if (!selectedPlan) {
        toast({
          title: "Erro",
          description: "Plano selecionado não encontrado.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Plano selecionado:', selectedPlan);

      // Limpar e formatar CPF
      const cleanCpf = formData.cpf.replace(/[^\d]/g, '');
      const formattedCpf = `${cleanCpf.slice(0,3)}.${cleanCpf.slice(3,6)}.${cleanCpf.slice(6,9)}-${cleanCpf.slice(9,11)}`;

      // Criar o aluno primeiro
      const studentData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        cpf: formattedCpf,
        rg: formData.rg?.trim() || undefined,
        email: formData.email.trim().toLowerCase(),
        address: formData.address?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        zip_code: formData.zipCode?.trim() || undefined,
        birth_date: formData.birthDate || undefined,
        emergency_contact: formData.emergencyContact?.trim() || undefined,
        health_issues: formData.healthIssues?.trim() || undefined,
        restrictions: formData.restrictions?.trim() || undefined,
        main_goal: formData.mainGoal?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        status: 'active' as const,
      };

      console.log('Dados do aluno para criar:', studentData);

      const newStudent = await createStudent(studentData);
      
      if (!newStudent) {
        console.error('Falha ao criar aluno');
        toast({
          title: "Erro",
          description: "Não foi possível criar o aluno. Verifique os dados e tente novamente.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Aluno criado com sucesso:', newStudent);

      // Calcular data de vencimento baseada no plano
      const startDate = new Date();
      const endDate = new Date();
      
      switch (selectedPlan.duration) {
        case 'Diária':
        case 'daily':
          // For daily plans, end date is start date + 1 day
          endDate.setDate(startDate.getDate() + 1);
          break;
        case 'month':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'quarter':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case 'year':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        default:
          endDate.setMonth(endDate.getMonth() + 1);
      }

      // Criar a matrícula
      const enrollmentData = {
        student_id: newStudent.id,
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.name,
        plan_price: selectedPlan.price,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active' as const,
      };

      console.log('Dados da matrícula para criar:', enrollmentData);

      const newEnrollment = await createEnrollment(enrollmentData);
      
      if (newEnrollment) {
        console.log('Matrícula criada com sucesso:', newEnrollment);
        toast({
          title: "Sucesso!",
          description: `Matrícula de ${formData.name} criada com sucesso!`,
        });

        // Reset form e limpar localStorage
        const resetData = {
          name: '', phone: '', cpf: '', rg: '', email: '', address: '', city: '', zipCode: '', birthDate: '',
          plan: '', mainGoal: '', notes: '', healthIssues: '', restrictions: '', emergencyContact: ''
        };
        setFormData(resetData);
        localStorage.removeItem('algagym-new-enrollment-form');
        setValidationErrors({});
        setExistingStudent(null);
        setShowExistingStudentOption(false);
      } else {
        console.error('Falha ao criar matrícula');
        toast({
          title: "Erro",
          description: "Aluno criado, mas falha ao criar a matrícula. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Erro completo na criação:', error);
      
      // Tratamento específico para erro de CPF duplicado
      if (error?.message?.includes('duplicate key value violates unique constraint "students_cpf_key"')) {
        toast({
          title: "CPF já cadastrado",
          description: "Este CPF já está cadastrado no sistema. Verifique os dados ou use a opção para criar nova matrícula para aluno existente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro inesperado ao criar a matrícula. Verifique sua conexão e tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Nova Matrícula</h2>
        <p className="text-lg text-gray-900 dark:text-gray-200">Preencha os dados do novo aluno</p>
      </div>

      {showExistingStudentOption && existingStudent && (
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-medium text-orange-800 dark:text-orange-200">
                CPF já cadastrado! Encontramos um aluno:
              </p>
              <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                <p><strong>Nome:</strong> {existingStudent.name}</p>
                <p><strong>Email:</strong> {existingStudent.email}</p>
                <p><strong>Telefone:</strong> {existingStudent.phone}</p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={handleUseExistingStudent}
                  disabled={!formData.plan || isSubmitting}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Criar Matrícula para Este Aluno
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowExistingStudentOption(false);
                    setExistingStudent(null);
                    setFormData(prev => ({ ...prev, cpf: '' }));
                  }}
                >
                  Usar CPF Diferente
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-t-lg">
            <CardTitle className="flex items-center space-x-3">
              <span className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-base font-bold">1</span>
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
                className={`h-12 ${validationErrors.name ? 'border-red-500' : ''}`}
                placeholder="Digite o nome completo"
              />
              {validationErrors.name && (
                <p className="text-red-600 text-base font-semibold">{validationErrors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                required
                className={`h-12 ${validationErrors.phone ? 'border-red-500' : ''}`}
              />
              {validationErrors.phone && (
                <p className="text-red-600 text-base font-semibold">{validationErrors.phone}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
                required
                className={`h-12 ${validationErrors.cpf ? 'border-red-500' : ''}`}
              />
              {validationErrors.cpf && (
                <p className="text-red-600 text-base font-semibold">{validationErrors.cpf}</p>
              )}
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
                className={`h-12 ${validationErrors.email ? 'border-red-500' : ''}`}
                placeholder="email@exemplo.com"
              />
              {validationErrors.email && (
                <p className="text-red-600 text-base font-semibold">{validationErrors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
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
            
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="h-12"
                placeholder="Nome da cidade"
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
          </CardContent>
        </Card>

        {/* Dados de Matrícula */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-t-lg">
            <CardTitle className="flex items-center space-x-3">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-base font-bold">2</span>
              <span className="text-xl">Dados de Matrícula</span>
            </CardTitle>
            <CardDescription className="text-base">Informações sobre o plano e objetivos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Plano * (Selecione uma opção)</Label>
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
                      <div className="font-bold text-lg text-gray-900 dark:text-white">R$ {plan.price}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {validationErrors.plan && (
                <p className="text-red-600 text-base font-semibold">{validationErrors.plan}</p>
              )}
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
              <span className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-base font-bold">3</span>
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
          <Button 
            type="button" 
            variant="outline" 
            className="h-12 px-8"
            onClick={() => {
              const resetData = {
                name: '', phone: '', cpf: '', rg: '', email: '', address: '', city: '', zipCode: '', birthDate: '',
                plan: '', mainGoal: '', notes: '', healthIssues: '', restrictions: '', emergencyContact: ''
              };
              setFormData(resetData);
              localStorage.removeItem('algagym-new-enrollment-form');
              setValidationErrors({});
              setExistingStudent(null);
              setShowExistingStudentOption(false);
            }}
          >
            Limpar Formulário
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || showExistingStudentOption}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 h-12 px-8"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Matrícula'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewEnrollment;
