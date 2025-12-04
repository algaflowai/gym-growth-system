-- Tornar campo email opcional na tabela students
ALTER TABLE public.students
ALTER COLUMN email DROP NOT NULL;

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.students.email IS 'Email do aluno (opcional)';