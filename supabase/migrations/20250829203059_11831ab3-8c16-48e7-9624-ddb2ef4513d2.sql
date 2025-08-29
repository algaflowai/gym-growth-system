-- Fix NULL user_id values and apply security fixes

-- 1. Update NULL user_id values to associate with the first available user
-- This is a temporary fix - in production, you should identify the correct owner
UPDATE public.students 
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

UPDATE public.enrollments 
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- 2. Now add NOT NULL constraints to prevent future NULL values
ALTER TABLE public.students ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.enrollments ALTER COLUMN user_id SET NOT NULL;

-- 3. Remove overly permissive access_passwords policy and replace with admin-only
DROP POLICY IF EXISTS "Authenticated users can read access passwords" ON public.access_passwords;

CREATE POLICY "Only admins can read access passwords" 
ON public.access_passwords 
FOR SELECT 
USING (is_admin());

-- 4. Create admin user assignment function for better access control
CREATE OR REPLACE FUNCTION public.assign_admin_role(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Only existing admins can assign admin roles, or if no admins exist yet
  IF NOT is_admin() AND EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RAISE EXCEPTION 'Access denied: Only admins can assign admin roles';
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;