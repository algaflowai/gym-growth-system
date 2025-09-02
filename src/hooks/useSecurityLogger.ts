import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SecurityEvent {
  action: string;
  details?: Record<string, any>;
  targetUserId?: string;
}

export const useSecurityLogger = () => {
  const logSecurityEvent = async ({ action, details = {}, targetUserId }: SecurityEvent) => {
    try {
      const { error } = await supabase.rpc('log_security_event', {
        action_type: action,
        event_details: details,
        target_user_id: targetUserId || null
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Security logging error:', error);
    }
  };

  const logAuthEvent = (action: 'login' | 'logout' | 'signup' | 'password_change', email?: string) => {
    logSecurityEvent({
      action: `auth_${action}`,
      details: { email: email || 'unknown' }
    });
  };

  const logAdminAction = (action: string, details: Record<string, any> = {}) => {
    logSecurityEvent({
      action: `admin_${action}`,
      details
    });
  };

  const logPasswordVerification = (page: string, success: boolean) => {
    logSecurityEvent({
      action: 'password_verification',
      details: { page, success }
    });
  };

  return {
    logSecurityEvent,
    logAuthEvent,
    logAdminAction,
    logPasswordVerification
  };
};