-- Função para sincronizar o status dos alunos baseado em suas matrículas ativas
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