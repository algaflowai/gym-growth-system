
-- Adicionar coluna user_id nas tabelas existentes
ALTER TABLE public.students ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.enrollments ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.enrollment_history ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Criar índices para melhor performance
CREATE INDEX idx_students_user_id ON public.students(user_id);
CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollment_history_user_id ON public.enrollment_history(user_id);

-- Atualizar políticas RLS para students
DROP POLICY IF EXISTS "Users can view all students" ON public.students;
DROP POLICY IF EXISTS "Users can create students" ON public.students;
DROP POLICY IF EXISTS "Users can update students" ON public.students;
DROP POLICY IF EXISTS "Users can delete students" ON public.students;

CREATE POLICY "Users can view their own students" ON public.students
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own students" ON public.students
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own students" ON public.students
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own students" ON public.students
  FOR DELETE USING (auth.uid() = user_id);

-- Atualizar políticas RLS para enrollments
DROP POLICY IF EXISTS "Users can view all enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can create enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can delete enrollments" ON public.enrollments;

CREATE POLICY "Users can view their own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments" ON public.enrollments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own enrollments" ON public.enrollments
  FOR DELETE USING (auth.uid() = user_id);

-- Atualizar políticas RLS para enrollment_history
DROP POLICY IF EXISTS "Users can view all enrollment history" ON public.enrollment_history;
DROP POLICY IF EXISTS "Users can create enrollment history" ON public.enrollment_history;

CREATE POLICY "Users can view their own enrollment history" ON public.enrollment_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollment history" ON public.enrollment_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Criar função para obter user_id atual (helper para uso nos códigos)
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid();
$$;
