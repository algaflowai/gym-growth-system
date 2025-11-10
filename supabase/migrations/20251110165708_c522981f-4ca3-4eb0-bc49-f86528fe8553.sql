-- Security Fix: Remove permissive RLS policies that allow unauthorized access
-- This migration addresses 4 critical security vulnerabilities

-- Fix 1: Remove privilege escalation vulnerability in user_roles table
-- Prevents any user from granting themselves admin privileges
DROP POLICY IF EXISTS "Users can manage roles" ON public.user_roles;

-- Fix 2: Remove cross-account student data exposure
-- Prevents users from accessing other gyms' student data
DROP POLICY IF EXISTS "Users can view all students" ON public.students;
DROP POLICY IF EXISTS "Users can update students" ON public.students;
DROP POLICY IF EXISTS "Users can delete students" ON public.students;
DROP POLICY IF EXISTS "Users can create students" ON public.students;

-- Fix 3: Remove security logs exposure to non-admin users
-- Prevents attackers from analyzing admin behavior and system vulnerabilities
DROP POLICY IF EXISTS "Users can view security logs" ON public.security_logs;

-- Fix 4: Remove access to password hashes
-- Prevents password hash extraction and manipulation
DROP POLICY IF EXISTS "Users can manage access passwords" ON public.access_passwords;
DROP POLICY IF EXISTS "Users can view access passwords" ON public.access_passwords;

-- Note: User-scoped policies and admin-only policies remain active
-- These provide proper data isolation based on user_id = auth.uid()