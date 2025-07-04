
import { useState, useEffect } from 'react';
import { useEnrollments } from './useEnrollments';

interface EnrollmentStats {
  total: number;
  active: number;
  inactive: number;
  expired: number;
}

export const useEnrollmentStats = () => {
  const { enrollments, loading } = useEnrollments();
  const [stats, setStats] = useState<EnrollmentStats>({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0
  });

  useEffect(() => {
    const calculateStats = () => {
      if (!enrollments) return;
      
      const newStats: EnrollmentStats = {
        total: enrollments.length,
        active: enrollments.filter(e => e.status === 'active').length,
        inactive: enrollments.filter(e => e.status === 'inactive').length,
        expired: enrollments.filter(e => e.status === 'expired').length
      };
      
      setStats(newStats);
    };

    calculateStats();
  }, [enrollments]);

  return { stats, loading };
};
