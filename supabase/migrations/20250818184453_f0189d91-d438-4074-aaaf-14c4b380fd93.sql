-- Fix existing functions to include search_path for security
ALTER FUNCTION public.verify_password(text, text) SET search_path = 'public';
ALTER FUNCTION public.update_encrypted_password(text, text) SET search_path = 'public';

-- Create a function to update access passwords using the proper table
CREATE OR REPLACE FUNCTION public.update_access_password(page_name text, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.access_passwords 
  SET password_hash = crypt(new_password, gen_salt('bf')), 
      updated_at = now()
  WHERE page_name = page_name;
  
  IF NOT FOUND THEN
    INSERT INTO public.access_passwords (page_name, password_hash)
    VALUES (page_name, crypt(new_password, gen_salt('bf')));
  END IF;
END;
$$;