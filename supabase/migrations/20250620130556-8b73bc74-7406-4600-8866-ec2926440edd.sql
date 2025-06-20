
-- Create function to verify password using crypt
CREATE OR REPLACE FUNCTION public.verify_password(stored_hash text, password_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN stored_hash = crypt(password_input, stored_hash);
END;
$$;

-- Create function to update encrypted password
CREATE OR REPLACE FUNCTION public.update_encrypted_password(page_name text, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.senhas_acesso 
  SET senha = crypt(new_password, gen_salt('bf')), 
      updated_at = now()
  WHERE pagina = page_name;
END;
$$;
