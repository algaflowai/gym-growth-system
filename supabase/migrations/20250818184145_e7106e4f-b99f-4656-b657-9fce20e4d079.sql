-- Create table for system configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Only admins can manage system settings" 
ON public.system_settings 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Create table for access passwords
CREATE TABLE IF NOT EXISTS public.access_passwords (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.access_passwords ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Only admins can manage access passwords" 
ON public.access_passwords 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Insert default passwords
INSERT INTO public.access_passwords (page_name, password_hash) VALUES 
('financeiro', crypt('financeiro123', gen_salt('bf'))),
('configuracoes', crypt('configuracao123', gen_salt('bf')))
ON CONFLICT (page_name) DO NOTHING;

-- Insert default system settings
INSERT INTO public.system_settings (key, value) VALUES 
('gym_name', 'AlgaGym Academia'),
('gym_email', 'contato@algagym.com'),
('gym_phone', '(11) 99999-9999'),
('gym_address', 'Rua das Academias, 123')
ON CONFLICT (key) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_access_passwords_updated_at
    BEFORE UPDATE ON public.access_passwords
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();