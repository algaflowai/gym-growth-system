
-- Criar tabela para histórico de planos
CREATE TABLE public.enrollment_history (
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

-- Criar tabela para senhas de acesso
CREATE TABLE public.senhas_acesso (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pagina TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar extensão pgcrypto para criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Inserir senhas padrão
INSERT INTO public.senhas_acesso (pagina, senha)
VALUES 
  ('financeiro', crypt('financeiro123', gen_salt('bf'))),
  ('configuracoes', crypt('configuracao123', gen_salt('bf')))
ON CONFLICT (pagina) DO NOTHING;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.enrollment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senhas_acesso ENABLE ROW LEVEL SECURITY;

-- Políticas para enrollment_history
CREATE POLICY "Users can view all enrollment history" ON public.enrollment_history FOR SELECT USING (true);
CREATE POLICY "Users can create enrollment history" ON public.enrollment_history FOR INSERT WITH CHECK (true);

-- Políticas para senhas_acesso
CREATE POLICY "Users can view access passwords" ON public.senhas_acesso FOR SELECT USING (true);
CREATE POLICY "Users can update access passwords" ON public.senhas_acesso FOR UPDATE USING (true);

-- Trigger para updated_at na tabela senhas_acesso
CREATE TRIGGER update_senhas_acesso_updated_at BEFORE UPDATE ON public.senhas_acesso
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
