import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'expired' | 'pending' | 'paid' | 'overdue';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge = memo(({ status, size = 'md' }: StatusBadgeProps) => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  const statusConfig = {
    active: {
      label: 'Ativo',
      variant: 'default' as const,
      className: 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
      icon: CheckCircle2,
    },
    inactive: {
      label: 'Inativo',
      variant: 'secondary' as const,
      className: 'bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700',
      icon: XCircle,
    },
    expired: {
      label: 'Expirado',
      variant: 'destructive' as const,
      className: '',
      icon: AlertTriangle,
    },
    pending: {
      label: 'Pendente',
      variant: 'secondary' as const,
      className: '',
      icon: Clock,
    },
    paid: {
      label: 'Pago',
      variant: 'default' as const,
      className: 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
      icon: CheckCircle2,
    },
    overdue: {
      label: 'Atrasado',
      variant: 'destructive' as const,
      className: '',
      icon: AlertTriangle,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className={`${iconSize} mr-1`} />
      {config.label}
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';
