-- Criar trigger para recalcular preço automaticamente quando dependentes mudam
CREATE TRIGGER recalculate_price_on_dependents_change
AFTER INSERT OR UPDATE OR DELETE ON public.enrollment_dependents
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_enrollment_price();