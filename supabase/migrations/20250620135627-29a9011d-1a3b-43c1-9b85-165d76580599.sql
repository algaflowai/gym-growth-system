
-- Inserir senhas padrão no banco de dados (apenas se não existirem)
INSERT INTO public.senhas_acesso (pagina, senha)
SELECT 'financeiro', crypt('financeiro123', gen_salt('bf'))
WHERE NOT EXISTS (SELECT 1 FROM public.senhas_acesso WHERE pagina = 'financeiro');

INSERT INTO public.senhas_acesso (pagina, senha)
SELECT 'configuracoes', crypt('configuracao123', gen_salt('bf'))
WHERE NOT EXISTS (SELECT 1 FROM public.senhas_acesso WHERE pagina = 'configuracoes');

-- Função para inativar matrículas vencidas há mais de 5 dias
CREATE OR REPLACE FUNCTION public.inactivate_expired_enrollments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.enrollments 
  SET status = 'inactive'
  WHERE status = 'expired' 
    AND end_date < (CURRENT_DATE - INTERVAL '5 days');
END;
$$;
