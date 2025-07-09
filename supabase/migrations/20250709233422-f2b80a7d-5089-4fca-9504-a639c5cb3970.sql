-- Adicionar campo gender (gênero) à tabela students
ALTER TABLE public.students ADD COLUMN gender TEXT;

-- Adicionar comentário explicativo para o campo
COMMENT ON COLUMN public.students.gender IS 'Gênero do aluno (Masculino, Feminino, Outros)';