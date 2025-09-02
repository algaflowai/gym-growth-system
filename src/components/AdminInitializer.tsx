import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { sanitizeEmail, validateInput, logSecurityEvent } from '@/utils/security';

const AdminInitializer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInitializeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email.",
        variant: "destructive",
      });
      return;
    }

    const sanitizedEmail = sanitizeEmail(email);
    
    if (!validateInput.email(sanitizedEmail)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.rpc('initialize_first_admin', {
        user_email: sanitizedEmail
      });

      if (error) {
        console.error('Error initializing admin:', error);
        
        await logSecurityEvent('admin_initialization_failed', {
          email: sanitizedEmail,
          error: error.message
        });
        
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      await logSecurityEvent('admin_initialized', {
        email: sanitizedEmail
      });

      setSuccess(true);
      toast({
        title: "Sucesso",
        description: "Primeiro administrador inicializado com sucesso!",
      });
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao inicializar administrador.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-green-600">
            ✅ Admin Inicializado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              O primeiro administrador foi configurado com sucesso. 
              Agora você pode fazer login e gerenciar o sistema.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Inicializar Primeiro Admin
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertDescription>
            Este processo deve ser executado apenas uma vez para configurar 
            o primeiro administrador do sistema.
          </AlertDescription>
        </Alert>
        
        <form onSubmit={handleInitializeAdmin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email do administrador"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? "Inicializando..." : "Inicializar Admin"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminInitializer;