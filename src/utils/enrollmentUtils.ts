
type EnrollmentStatus = "active" | "inactive" | "expired";

export const calculateDurationInDays = (duration: string): number => {
  switch (duration) {
    case 'day':
      return 1; // Plano diário tem duração de 1 dia (24 horas)
    case 'month':
      return 30;
    case 'quarter':
      return 90;
    case 'semester':
      return 180;
    case 'year':
      return 365;
    default:
      return 30;
  }
};

export const calculateRenewalDates = (currentEndDate: string, planDuration: string) => {
  const currentDate = new Date();
  const enrollmentEndDate = new Date(currentEndDate);
  
  // Se o plano já expirou, usa a data atual. Senão, usa o dia seguinte ao término
  const startDate = enrollmentEndDate < currentDate 
    ? currentDate 
    : new Date(enrollmentEndDate.getTime() + 24 * 60 * 60 * 1000);

  const durationInDays = calculateDurationInDays(planDuration);
  const endDate = new Date(startDate.getTime() + (durationInDays * 24 * 60 * 60 * 1000));

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

export const mapEnrollmentStatus = (enrollments: any[]): any[] => {
  return enrollments.map((enrollment: any) => ({
    ...enrollment,
    status: enrollment.status as EnrollmentStatus,
  }));
};
