-- Fix critical security issues

-- 1. Add NOT NULL constraints to user_id columns to prevent future NULL values
ALTER TABLE public.students ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.enrollments ALTER COLUMN user_id SET NOT NULL;

-- 2. Update database functions with proper security settings
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
    'user'::app_role
  );
$$;

CREATE OR REPLACE FUNCTION public.update_access_password(page_name text, new_password text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  UPDATE public.access_passwords 
  SET password_hash = crypt(new_password, gen_salt('bf')), 
      updated_at = now()
  WHERE page_name = update_access_password.page_name;
  
  IF NOT FOUND THEN
    INSERT INTO public.access_passwords (page_name, password_hash)
    VALUES (update_access_password.page_name, crypt(new_password, gen_salt('bf')));
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_password(stored_hash text, password_input text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  RETURN stored_hash = crypt(password_input, stored_hash);
END;
$$;

-- 3. Remove overly permissive access_passwords policy and replace with admin-only
DROP POLICY IF EXISTS "Authenticated users can read access passwords" ON public.access_passwords;

CREATE POLICY "Only admins can read access passwords" 
ON public.access_passwords 
FOR SELECT 
USING (is_admin());

-- 4. Ensure proper RLS on all tables
ALTER TABLE public.access_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Create admin user assignment function
CREATE OR REPLACE FUNCTION public.assign_admin_role(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Only existing admins can assign admin roles
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Only admins can assign admin roles';
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;