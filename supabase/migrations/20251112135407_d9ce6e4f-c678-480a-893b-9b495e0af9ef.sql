-- Corrigir sync_student_status para atuar apenas no usuário autenticado
CREATE OR REPLACE FUNCTION public.sync_student_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Inativar alunos que não têm matrículas ativas (apenas do usuário atual)
  UPDATE public.students
  SET status = 'inactive'
  WHERE status = 'active'
    AND user_id = auth.uid()
    AND id NOT IN (
      SELECT DISTINCT student_id 
      FROM public.enrollments 
      WHERE status = 'active'
        AND user_id = auth.uid()
    );
  
  -- Ativar alunos que têm matrículas ativas (apenas do usuário atual)
  UPDATE public.students
  SET status = 'active'
  WHERE status = 'inactive'
    AND user_id = auth.uid()
    AND id IN (
      SELECT DISTINCT student_id 
      FROM public.enrollments 
      WHERE status = 'active'
        AND user_id = auth.uid()
    );
END;
$function$;

-- Corrigir inactivate_expired_enrollments para atuar apenas no usuário autenticado
CREATE OR REPLACE FUNCTION public.inactivate_expired_enrollments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.enrollments 
  SET status = 'inactive'
  WHERE status = 'expired'
    AND user_id = auth.uid()
    AND end_date < (CURRENT_DATE - INTERVAL '7 days');
END;
$function$;