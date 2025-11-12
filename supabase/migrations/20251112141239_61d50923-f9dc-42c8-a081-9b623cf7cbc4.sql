-- Create table for server-side page access sessions
CREATE TABLE IF NOT EXISTS public.page_access_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_name TEXT NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_access_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own sessions
CREATE POLICY "Users can view their own sessions"
ON public.page_access_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own sessions
CREATE POLICY "Users can create their own sessions"
ON public.page_access_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete their own sessions"
ON public.page_access_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_page_access_sessions_user_page ON public.page_access_sessions(user_id, page_name);
CREATE INDEX idx_page_access_sessions_token ON public.page_access_sessions(session_token);
CREATE INDEX idx_page_access_sessions_expires ON public.page_access_sessions(expires_at);

-- Function to create page access session after password verification
CREATE OR REPLACE FUNCTION public.create_page_access_session(
  page_name_input TEXT,
  password_input TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_valid BOOLEAN;
  session_token TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
  result JSON;
BEGIN
  -- Verify password first
  is_valid := verify_page_access(page_name_input, password_input);
  
  IF NOT is_valid THEN
    RETURN json_build_object('success', false, 'error', 'Senha inválida');
  END IF;
  
  -- Generate session token (UUID)
  session_token := gen_random_uuid()::TEXT;
  
  -- Set expiration to 1 hour from now
  expires_at := now() + interval '1 hour';
  
  -- Delete any existing sessions for this user/page
  DELETE FROM public.page_access_sessions
  WHERE user_id = auth.uid() 
    AND page_name = page_name_input;
  
  -- Create new session
  INSERT INTO public.page_access_sessions (user_id, page_name, session_token, expires_at)
  VALUES (auth.uid(), page_name_input, session_token, expires_at);
  
  -- Log security event
  PERFORM log_security_event(
    'page_access_granted',
    json_build_object('page', page_name_input)::jsonb
  );
  
  -- Return session token and expiry
  RETURN json_build_object(
    'success', true,
    'session_token', session_token,
    'expires_at', expires_at
  );
END;
$function$;

-- Function to validate session token
CREATE OR REPLACE FUNCTION public.validate_page_access_session(
  page_name_input TEXT,
  session_token_input TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  session_valid BOOLEAN;
BEGIN
  -- Check if session exists and is not expired
  SELECT EXISTS (
    SELECT 1
    FROM public.page_access_sessions
    WHERE user_id = auth.uid()
      AND page_name = page_name_input
      AND session_token = session_token_input
      AND expires_at > now()
  ) INTO session_valid;
  
  RETURN session_valid;
END;
$function$;

-- Function to cleanup expired sessions (run via cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_page_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.page_access_sessions
  WHERE expires_at < now();
END;
$function$;