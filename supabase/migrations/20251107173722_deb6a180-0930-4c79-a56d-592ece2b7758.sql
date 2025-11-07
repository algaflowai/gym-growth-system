-- Update the inactivate_expired_enrollments function to use 7 days instead of 5 days
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
    AND end_date < (CURRENT_DATE - INTERVAL '7 days');
END;
$function$;