-- Função para atualizar updated_at (substituir se existir)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers se existirem
DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
DROP TRIGGER IF EXISTS update_enrollments_updated_at ON public.enrollments;
DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON public.system_settings;
DROP TRIGGER IF EXISTS update_access_passwords_updated_at ON public.access_passwords;
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;

-- Criar triggers
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

-- Função para sincronizar status dos alunos
CREATE OR REPLACE FUNCTION public.sync_student_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.students
  SET status = 'inactive'
  WHERE status = 'active'
  AND id NOT IN (
    SELECT DISTINCT student_id 
    FROM public.enrollments 
    WHERE status = 'active'
  );
  
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