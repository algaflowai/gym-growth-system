-- Tornar campos CPF e Telefone opcionais na tabela students
ALTER TABLE public.students
ALTER COLUMN cpf DROP NOT NULL,
ALTER COLUMN phone DROP NOT NULL;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.students.cpf IS 'CPF do aluno (opcional)';
COMMENT ON COLUMN public.students.phone IS 'Telefone do aluno (opcional)';