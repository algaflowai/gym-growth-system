-- Create user_roles table for proper access control
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user has admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  );
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
    'user'::app_role
  );
$$;

-- Drop existing overly permissive policies on settings table
DROP POLICY IF EXISTS "Users can create settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update settings" ON public.settings;
DROP POLICY IF EXISTS "Users can view all settings" ON public.settings;

-- Create secure RLS policies for settings table - only admins can access
CREATE POLICY "Only admins can view settings"
ON public.settings
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can create settings"
ON public.settings
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update settings"
ON public.settings
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete settings"
ON public.settings
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Insert default admin user (first user will be admin)
-- This allows the first authenticated user to become admin
INSERT INTO public.user_roles (user_id, role)
SELECT auth.uid(), 'admin'::app_role
WHERE auth.uid() IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create trigger for updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();