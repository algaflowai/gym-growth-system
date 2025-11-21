-- Adicionar campos para suporte a planos customizados com dependentes
ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS custom_plan_duration TEXT,
ADD COLUMN IF NOT EXISTS custom_titular_price NUMERIC,
ADD COLUMN IF NOT EXISTS is_custom_plan BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_dependent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE;

-- Tornar plan_id nullable para suportar planos customizados
ALTER TABLE public.enrollments
ALTER COLUMN plan_id DROP NOT NULL;

-- Criar índice para melhorar performance de consultas de dependentes
CREATE INDEX IF NOT EXISTS idx_enrollments_parent_enrollment_id 
ON public.enrollments(parent_enrollment_id) 
WHERE parent_enrollment_id IS NOT NULL;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.enrollments.custom_plan_duration IS 'Duração customizada do plano (day/month/quarter/semester/year) quando is_custom_plan=true';
COMMENT ON COLUMN public.enrollments.custom_titular_price IS 'Preço customizado do titular, usado em renovações';
COMMENT ON COLUMN public.enrollments.is_custom_plan IS 'Indica se é um plano customizado (sem plan_id fixo)';
COMMENT ON COLUMN public.enrollments.is_dependent IS 'Indica se é uma matrícula dependente vinculada a um titular';
COMMENT ON COLUMN public.enrollments.parent_enrollment_id IS 'ID da matrícula titular quando is_dependent=true';

-- Atualizar trigger de recalculo de preço para considerar planos customizados
CREATE OR REPLACE FUNCTION public.recalculate_enrollment_price()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_dependents_price numeric;
  base_titular_price numeric;
  total_price numeric;
  enrollment_record RECORD;
BEGIN
  -- Pegar dados da matrícula
  SELECT * INTO enrollment_record
  FROM public.enrollments
  WHERE id = COALESCE(NEW.enrollment_id, OLD.enrollment_id);

  -- Se for dependente, não recalcular (preço vem do parent)
  IF enrollment_record.is_dependent THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Pegar preço do titular
  -- Para planos customizados, usar custom_titular_price
  -- Para planos normais, usar titular_price (ou plan_price se NULL)
  IF enrollment_record.is_custom_plan AND enrollment_record.custom_titular_price IS NOT NULL THEN
    base_titular_price := enrollment_record.custom_titular_price;
  ELSIF enrollment_record.titular_price IS NOT NULL THEN
    base_titular_price := enrollment_record.titular_price;
  ELSE
    base_titular_price := enrollment_record.plan_price;
  END IF;

  -- Calcular soma dos dependentes
  SELECT COALESCE(SUM(dependent_price), 0) INTO total_dependents_price
  FROM public.enrollment_dependents
  WHERE enrollment_id = enrollment_record.id;

  -- Total = titular + dependentes
  total_price := base_titular_price + total_dependents_price;

  -- Atualizar matrícula
  UPDATE public.enrollments
  SET 
    plan_price = total_price,
    titular_price = CASE 
      WHEN is_custom_plan THEN custom_titular_price
      ELSE base_titular_price
    END,
    is_family_plan = (total_dependents_price > 0),
    installment_amount = CASE 
      WHEN is_installment_plan THEN total_price / total_installments
      ELSE NULL
    END,
    updated_at = now()
  WHERE id = enrollment_record.id;

  -- Atualizar parcelas pendentes se houver
  IF enrollment_record.is_installment_plan THEN
    UPDATE public.payment_installments
    SET amount = total_price / enrollment_record.total_installments
    WHERE enrollment_id = enrollment_record.id
      AND status = 'pending';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;