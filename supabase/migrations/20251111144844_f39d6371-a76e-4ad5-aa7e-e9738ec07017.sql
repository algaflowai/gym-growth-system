-- Criar tabela de dependentes vinculados a matrículas
CREATE TABLE IF NOT EXISTS public.enrollment_dependents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  dependent_student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  dependent_price numeric NOT NULL CHECK (dependent_price >= 0),
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT no_self_dependent CHECK (student_id != dependent_student_id),
  CONSTRAINT unique_dependent_per_enrollment UNIQUE (enrollment_id, dependent_student_id)
);

-- Habilitar RLS
ALTER TABLE public.enrollment_dependents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own dependents"
  ON public.enrollment_dependents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dependents"
  ON public.enrollment_dependents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dependents"
  ON public.enrollment_dependents
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dependents"
  ON public.enrollment_dependents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_enrollment_dependents_updated_at
  BEFORE UPDATE ON public.enrollment_dependents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para recalcular preço total da matrícula quando dependentes mudam
CREATE OR REPLACE FUNCTION public.recalculate_enrollment_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_dependents_price numeric;
  base_price numeric;
  total_price numeric;
  enrollment_record RECORD;
BEGIN
  -- Pegar dados da matrícula
  SELECT * INTO enrollment_record
  FROM public.enrollments
  WHERE id = COALESCE(NEW.enrollment_id, OLD.enrollment_id);

  -- Calcular soma dos preços dos dependentes
  SELECT COALESCE(SUM(dependent_price), 0) INTO total_dependents_price
  FROM public.enrollment_dependents
  WHERE enrollment_id = enrollment_record.id;

  -- Pegar preço base (assumindo que plan_price inicial é o preço do titular)
  -- Quando não há dependentes, plan_price é o preço base
  IF total_dependents_price = 0 THEN
    base_price := enrollment_record.plan_price;
  ELSE
    -- Recalcular preço base subtraindo dependentes do preço atual
    SELECT COALESCE(enrollment_record.plan_price - (
      SELECT COALESCE(SUM(dependent_price), 0)
      FROM public.enrollment_dependents
      WHERE enrollment_id = enrollment_record.id
    ), enrollment_record.plan_price) INTO base_price;
  END IF;

  -- Calcular preço total
  total_price := base_price + total_dependents_price;

  -- Atualizar matrícula
  UPDATE public.enrollments
  SET 
    plan_price = total_price,
    installment_amount = CASE 
      WHEN is_installment_plan THEN total_price / total_installments
      ELSE NULL
    END,
    updated_at = now()
  WHERE id = enrollment_record.id;

  -- Atualizar parcelas existentes se houver
  IF enrollment_record.is_installment_plan THEN
    UPDATE public.payment_installments
    SET amount = total_price / enrollment_record.total_installments
    WHERE enrollment_id = enrollment_record.id
      AND status = 'pending';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers para recalcular preço quando dependentes mudam
CREATE TRIGGER recalculate_price_after_dependent_insert
  AFTER INSERT ON public.enrollment_dependents
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_enrollment_price();

CREATE TRIGGER recalculate_price_after_dependent_update
  AFTER UPDATE ON public.enrollment_dependents
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_enrollment_price();

CREATE TRIGGER recalculate_price_after_dependent_delete
  AFTER DELETE ON public.enrollment_dependents
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_enrollment_price();

-- Índices para performance
CREATE INDEX idx_enrollment_dependents_enrollment_id ON public.enrollment_dependents(enrollment_id);
CREATE INDEX idx_enrollment_dependents_student_id ON public.enrollment_dependents(student_id);
CREATE INDEX idx_enrollment_dependents_dependent_student_id ON public.enrollment_dependents(dependent_student_id);
CREATE INDEX idx_enrollment_dependents_user_id ON public.enrollment_dependents(user_id);