-- ===========================================
-- MIGRATION CONSOLIDADA - CRIAR TODAS AS TABELAS E ESTRUTURAS
-- ===========================================

-- Criar extensão pgcrypto para criptografia de senhas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ===========================================
-- TIPOS ENUM
-- ===========================================

-- Criar tipo enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- ===========================================
-- TABELAS PRINCIPAIS
-- ===========================================

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

-- Tabela de configurações (senhas de páginas antigas)
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  encrypted_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de configurações do sistema (nome da academia, etc)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de senhas de acesso a páginas (bcrypt)
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

-- ===========================================
-- ÍNDICES PARA PERFORMANCE
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_students_name ON public.students(name);
CREATE INDEX IF NOT EXISTS idx_students_cpf ON public.students(cpf);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_end_date ON public.enrollments(end_date);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);

-- ===========================================
-- FUNÇÕES
-- ===========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para sincronizar status dos alunos baseado em matrículas
CREATE OR REPLACE FUNCTION public.sync_student_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Marca alunos como inativos se não tiverem matrículas ativas
  UPDATE public.students
  SET status = 'inactive'
  WHERE status = 'active'
  AND id NOT IN (
    SELECT DISTINCT student_id 
    FROM public.enrollments 
    WHERE status = 'active'
  );
  
  -- Marca alunos como ativos se tiverem matrículas ativas
  UPDATE public.students
  SET status = 'active'
  WHERE status = 'inactive'
  AND id IN (
    SELECT DISTINCT student_id 
    FROM public.enrollments 
    WHERE status = 'active'
  );
END;
$$;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  );
$$;

-- Função para obter role do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
    'user'::app_role
  );
$$;

-- Função para inicializar primeiro admin
CREATE OR REPLACE FUNCTION public.initialize_first_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id uuid;
  admin_count integer;
BEGIN
  -- Verificar se já existem admins
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';
  
  -- Só permitir se não houver admins
  IF admin_count > 0 THEN
    RAISE EXCEPTION 'Admin users already exist. Use assign_admin_role function instead.';
  END IF;
  
  -- Encontrar usuário por email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Atribuir role de admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;

-- Função para logar eventos de segurança
CREATE OR REPLACE FUNCTION public.log_security_event(
  action_type text,
  event_details jsonb DEFAULT '{}'::jsonb,
  target_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.security_logs (user_id, action, details)
  VALUES (
    COALESCE(target_user_id, auth.uid()),
    action_type,
    event_details
  );
END;
$$;

-- Função para limpar logs antigos (>90 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_security_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.security_logs
  WHERE created_at < (now() - interval '90 days');
END;
$$;

-- ===========================================
-- TRIGGERS
-- ===========================================

CREATE TRIGGER update_students_updated_at 
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at 
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at 
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_access_passwords_updated_at
  BEFORE UPDATE ON public.access_passwords
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- HABILITAR RLS
-- ===========================================

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- POLÍTICAS RLS - STUDENTS
-- ===========================================

CREATE POLICY "Users can view all students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Users can create students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Users can delete students" ON public.students FOR DELETE USING (true);

-- ===========================================
-- POLÍTICAS RLS - ENROLLMENTS
-- ===========================================

CREATE POLICY "Users can view all enrollments" ON public.enrollments FOR SELECT USING (true);
CREATE POLICY "Users can create enrollments" ON public.enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update enrollments" ON public.enrollments FOR UPDATE USING (true);
CREATE POLICY "Users can delete enrollments" ON public.enrollments FOR DELETE USING (true);

-- ===========================================
-- POLÍTICAS RLS - ENROLLMENT_HISTORY
-- ===========================================

CREATE POLICY "Users can view all enrollment history" ON public.enrollment_history FOR SELECT USING (true);
CREATE POLICY "Users can create enrollment history" ON public.enrollment_history FOR INSERT WITH CHECK (true);

-- ===========================================
-- POLÍTICAS RLS - SETTINGS (APENAS ADMINS)
-- ===========================================

CREATE POLICY "Only admins can view settings" ON public.settings FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Only admins can create settings" ON public.settings FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update settings" ON public.settings FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can delete settings" ON public.settings FOR DELETE TO authenticated USING (public.is_admin());

-- ===========================================
-- POLÍTICAS RLS - SYSTEM_SETTINGS (APENAS ADMINS)
-- ===========================================

CREATE POLICY "Only admins can manage system settings" ON public.system_settings FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ===========================================
-- POLÍTICAS RLS - ACCESS_PASSWORDS (APENAS ADMINS)
-- ===========================================

CREATE POLICY "Only admins can manage access passwords" ON public.access_passwords FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ===========================================
-- POLÍTICAS RLS - USER_ROLES
-- ===========================================

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ===========================================
-- POLÍTICAS RLS - SECURITY_LOGS (APENAS ADMINS)
-- ===========================================

CREATE POLICY "Only admins can view security logs" ON public.security_logs FOR SELECT USING (is_admin());

-- ===========================================
-- DADOS INICIAIS
-- ===========================================

-- Inserir configurações padrão antigas
INSERT INTO public.settings (key, value) VALUES 
  ('financial_password_set', 'false'),
  ('settings_password_set', 'false')
ON CONFLICT (key) DO NOTHING;

-- Inserir senhas de acesso padrão
INSERT INTO public.access_passwords (page_name, password_hash) VALUES 
  ('financeiro', crypt('financeiro123', gen_salt('bf'))),
  ('configuracoes', crypt('configuracao123', gen_salt('bf')))
ON CONFLICT (page_name) DO NOTHING;

-- Inserir configurações do sistema
INSERT INTO public.system_settings (key, value) VALUES 
  ('gym_name', 'AlgaGym Academia'),
  ('gym_email', 'contato@algagym.com'),
  ('gym_phone', '(11) 99999-9999'),
  ('gym_address', 'Rua das Academias, 123')
ON CONFLICT (key) DO NOTHING;