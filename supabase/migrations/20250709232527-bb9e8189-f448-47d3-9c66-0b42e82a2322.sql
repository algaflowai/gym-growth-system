-- Criar política RLS para permitir que usuários autenticados excluam suas próprias matrículas
CREATE POLICY "Usuarios autenticados podem excluir suas matriculas"
ON public.enrollments 
FOR DELETE 
USING (
  auth.role() = 'authenticated' 
  AND user_id = auth.uid()
);