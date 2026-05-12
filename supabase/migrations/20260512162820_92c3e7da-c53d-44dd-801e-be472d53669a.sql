
-- system_settings: admin-only
DROP POLICY IF EXISTS "Authenticated users can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Authenticated users can insert system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Authenticated users can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Authenticated users can delete system settings" ON public.system_settings;

CREATE POLICY "Only admins can manage system settings"
  ON public.system_settings FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- user_roles: drop public-readable policy
DROP POLICY IF EXISTS "Users can view their roles" ON public.user_roles;

-- security_logs: scope to authenticated only
DROP POLICY IF EXISTS "Only admins can view security logs" ON public.security_logs;
CREATE POLICY "Only admins can view security logs"
  ON public.security_logs FOR SELECT TO authenticated
  USING (is_admin());

-- Revoke EXECUTE on internal SECURITY DEFINER helpers from anon/authenticated.
-- Keep functions used by triggers (update_updated_at_column, recalculate_enrollment_price,
-- handle_new_user_plans) executable - triggers run as table owner regardless.
REVOKE EXECUTE ON FUNCTION public.assign_admin_role(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.initialize_first_admin(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_access_password(text, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_encrypted_password(text, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.verify_password(text, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.verify_page_access(text, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_security_logs() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_page_sessions() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.log_security_event(text, jsonb, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.create_default_plans_for_user(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.inactivate_expired_enrollments() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.sync_student_status() FROM anon, authenticated, public;
