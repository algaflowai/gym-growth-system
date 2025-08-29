-- Fix remaining function search path security warnings

CREATE OR REPLACE FUNCTION public.update_encrypted_password(page_name text, new_password text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.senhas_acesso 
  SET senha = crypt(new_password, gen_salt('bf')), 
      updated_at = now()
  WHERE pagina = page_name;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.inactivate_expired_enrollments()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.enrollments 
  SET status = 'inactive'
  WHERE status = 'expired' 
    AND end_date < (CURRENT_DATE - INTERVAL '5 days');
END;
$$;