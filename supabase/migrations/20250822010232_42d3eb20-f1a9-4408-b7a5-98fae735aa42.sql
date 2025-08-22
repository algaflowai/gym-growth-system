-- Fix the verify_password function to use the correct schema for crypt
CREATE OR REPLACE FUNCTION public.verify_password(stored_hash text, password_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
BEGIN
  RETURN stored_hash = crypt(password_input, stored_hash);
END;
$$;

-- Fix the update_access_password function to use the correct schema for crypt and gen_salt
CREATE OR REPLACE FUNCTION public.update_access_password(page_name text, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
BEGIN
  UPDATE public.access_passwords 
  SET password_hash = crypt(new_password, gen_salt('bf')), 
      updated_at = now()
  WHERE page_name = update_access_password.page_name;
  
  IF NOT FOUND THEN
    INSERT INTO public.access_passwords (page_name, password_hash)
    VALUES (update_access_password.page_name, crypt(new_password, gen_salt('bf')));
  END IF;
END;
$$;