-- Create secure RPC function for password verification
-- This function verifies page access passwords without exposing password hashes to the client

CREATE OR REPLACE FUNCTION public.verify_page_access(
  page_name_input text,
  password_input text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  stored_hash text;
BEGIN
  -- Fetch the password hash for the specified page
  SELECT password_hash INTO stored_hash
  FROM public.access_passwords
  WHERE page_name = page_name_input;
  
  -- If no password found for this page, return false
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verify password using crypt function
  RETURN stored_hash = crypt(password_input, stored_hash);
END;
$$;