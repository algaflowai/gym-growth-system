-- Criar extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar tipo enum para roles (DROP e CREATE para evitar conflitos)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela de alunos
CREATE TABLE IF NOT EXISTS public.students (
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

-- Tabela de matrículas
CREATE TABLE IF NOT EXISTS public.enrollments (
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

-- Tabela de histórico de matrículas
CREATE TABLE IF NOT EXISTS public.enrollment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES public.enrollments(id) NOT NULL,
  student_id UUID REFERENCES public.students(id) NOT NULL,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_price DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de configurações
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  encrypted_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de senhas de acesso
CREATE TABLE IF NOT EXISTS public.access_passwords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de roles de usuário
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Tabela de logs de segurança
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_students_cpf ON public.students(cpf);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);

-- Habilitar RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Students
CREATE POLICY "Users can view all students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Users can create students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Users can delete students" ON public.students FOR DELETE USING (true);

-- Políticas RLS - Enrollments
CREATE POLICY "Users can view all enrollments" ON public.enrollments FOR SELECT USING (true);
CREATE POLICY "Users can create enrollments" ON public.enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update enrollments" ON public.enrollments FOR UPDATE USING (true);
CREATE POLICY "Users can delete enrollments" ON public.enrollments FOR DELETE USING (true);

-- Políticas RLS - Enrollment History
CREATE POLICY "Users can view enrollment history" ON public.enrollment_history FOR SELECT USING (true);
CREATE POLICY "Users can create enrollment history" ON public.enrollment_history FOR INSERT WITH CHECK (true);

-- Políticas RLS - Settings (permissivo por enquanto)
CREATE POLICY "Users can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Users can manage settings" ON public.settings FOR ALL USING (true);

-- Políticas RLS - System Settings (permissivo por enquanto)
CREATE POLICY "Users can view system settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Users can manage system settings" ON public.system_settings FOR ALL USING (true);

-- Políticas RLS - Access Passwords (permissivo por enquanto)
CREATE POLICY "Users can view access passwords" ON public.access_passwords FOR SELECT USING (true);
CREATE POLICY "Users can manage access passwords" ON public.access_passwords FOR ALL USING (true);

-- Políticas RLS - User Roles
CREATE POLICY "Users can view their roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Users can manage roles" ON public.user_roles FOR ALL USING (true);

-- Políticas RLS - Security Logs
CREATE POLICY "Users can view security logs" ON public.security_logs FOR SELECT USING (true);

-- Inserir dados iniciais
INSERT INTO public.settings (key, value) VALUES 
  ('financial_password_set', 'false'),
  ('settings_password_set', 'false')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.access_passwords (page_name, password_hash) VALUES 
  ('financeiro', crypt('financeiro123', gen_salt('bf'))),
  ('configuracoes', crypt('configuracao123', gen_salt('bf')))
ON CONFLICT (page_name) DO NOTHING;

INSERT INTO public.system_settings (key, value) VALUES 
  ('gym_name', 'AlgaGym Academia'),
  ('gym_email', 'contato@algagym.com'),
  ('gym_phone', '(11) 99999-9999'),
  ('gym_address', 'Rua das Academias, 123')
ON CONFLICT (key) DO NOTHING;