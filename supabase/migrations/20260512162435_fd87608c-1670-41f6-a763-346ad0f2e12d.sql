
-- Enrollments: drop overly permissive "true" policies, keep owner-scoped
DROP POLICY IF EXISTS "Users can view all enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can create enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can delete enrollments" ON public.enrollments;

-- Enrollment history: drop the "true" duplicates
DROP POLICY IF EXISTS "Users can view enrollment history" ON public.enrollment_history;
DROP POLICY IF EXISTS "Users can create enrollment history" ON public.enrollment_history;

-- system_settings: drop public/permissive policies, restrict to authenticated
DROP POLICY IF EXISTS "Users can manage system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Users can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins can manage system settings" ON public.system_settings;

CREATE POLICY "Authenticated users can view system settings"
  ON public.system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert system settings"
  ON public.system_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update system settings"
  ON public.system_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete system settings"
  ON public.system_settings FOR DELETE TO authenticated USING (true);

-- settings: drop public/permissive ALL policy and public SELECT policy
DROP POLICY IF EXISTS "Users can manage settings" ON public.settings;
DROP POLICY IF EXISTS "Users can view settings" ON public.settings;
-- Existing admin-only policies remain in place for restricted-access password storage
