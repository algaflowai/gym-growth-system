
-- Criar tabela de alunos
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  rg TEXT,
  email TEXT NOT NULL,
  address TEXT,
  city TEXT,
  zip_code TEXT,
  birth_date DATE,
  emergency_contact TEXT,
  health_issues TEXT,
  restrictions TEXT,
  main_goal TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Criar tabela de matrículas
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) NOT NULL,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_price DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de configurações
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  encrypted_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações padrão para senhas
INSERT INTO public.settings (key, value) VALUES 
  ('financial_password_set', 'false'),
  ('settings_password_set', 'false');

-- Habilitar RLS nas tabelas
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Políticas para students
CREATE POLICY "Users can view all students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Users can create students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Users can delete students" ON public.students FOR DELETE USING (true);

-- Políticas para enrollments
CREATE POLICY "Users can view all enrollments" ON public.enrollments FOR SELECT USING (true);
CREATE POLICY "Users can create enrollments" ON public.enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update enrollments" ON public.enrollments FOR UPDATE USING (true);
CREATE POLICY "Users can delete enrollments" ON public.enrollments FOR DELETE USING (true);

-- Políticas para settings
CREATE POLICY "Users can view all settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Users can create settings" ON public.settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update settings" ON public.settings FOR UPDATE USING (true);

-- Índices para performance
CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_students_name ON public.students(name);
CREATE INDEX idx_students_cpf ON public.students(cpf);
CREATE INDEX idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_end_date ON public.enrollments(end_date);
CREATE INDEX idx_enrollments_status ON public.enrollments(status);
CREATE INDEX idx_settings_key ON public.settings(key);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
