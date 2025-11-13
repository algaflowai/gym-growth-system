-- Criar tabela de planos
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  duration TEXT NOT NULL CHECK (duration IN ('day', 'month', 'quarter', 'year')),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_plans_user_id ON public.plans(user_id);
CREATE INDEX idx_plans_active ON public.plans(active);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_plans_updated_at 
  BEFORE UPDATE ON public.plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies: usuários veem apenas seus próprios planos
CREATE POLICY "Users can view their own plans"
  ON public.plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans"
  ON public.plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON public.plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON public.plans FOR DELETE
  USING (auth.uid() = user_id);

-- Função para criar planos padrão para um usuário
CREATE OR REPLACE FUNCTION public.create_default_plans_for_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verifica se o usuário já tem planos
  IF NOT EXISTS (SELECT 1 FROM public.plans WHERE user_id = target_user_id) THEN
    INSERT INTO public.plans (user_id, name, price, duration, duration_days, active)
    VALUES 
      (target_user_id, 'Diária', 15, 'day', 1, true),
      (target_user_id, 'Mensal', 89, 'month', 30, true),
      (target_user_id, 'Trimestral', 240, 'quarter', 90, true),
      (target_user_id, 'Anual', 890, 'year', 365, true);
  END IF;
END;
$$;

-- Popular planos padrão para todos os usuários existentes
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    PERFORM create_default_plans_for_user(user_record.id);
  END LOOP;
END;
$$;

-- Trigger para criar planos automaticamente quando novo usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user_plans()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_default_plans_for_user(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_create_plans
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_plans();