-- Adicionar colunas para planos familiares na tabela enrollments
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS titular_price numeric,
ADD COLUMN IF NOT EXISTS is_family_plan boolean DEFAULT false;

-- Atualizar dados existentes
UPDATE public.enrollments 
SET titular_price = plan_price,
    is_family_plan = false
WHERE titular_price IS NULL;

-- Adicionar coluna na tabela payment_installments
ALTER TABLE public.payment_installments
ADD COLUMN IF NOT EXISTS is_family_plan boolean DEFAULT false;

-- Reescrever função de recálculo com lógica correta
CREATE OR REPLACE FUNCTION public.recalculate_enrollment_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- Pegar preço do titular (fixo, nunca muda)
  base_titular_price := enrollment_record.titular_price;
  
  -- Se titular_price for NULL (matrícula antiga), usar plan_price
  IF base_titular_price IS NULL THEN
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
    titular_price = base_titular_price,
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
$$;