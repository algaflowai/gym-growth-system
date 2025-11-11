import { useNavigate } from 'react-router-dom';
import { useLayoutContext } from './AppLayout';
import Dashboard from './Dashboard';
import NewEnrollment from './NewEnrollment';
import EnrollmentManagement from './EnrollmentManagement';
import StudentsManagement from './StudentsManagement';
import PlansManagement from './PlansManagement';
import AITrainer from './AITrainer';
import ProtectedFinancialSection from './ProtectedFinancialSection';
import ProtectedSettingsSection from './ProtectedSettingsSection';
import PaymentManagement from './PaymentManagement';

// Wrapper components that connect to the layout context

export const DashboardRoute = () => {
  const { onNavigate } = useLayoutContext();
  return <Dashboard onNavigate={onNavigate} />;
};

export const NewEnrollmentRoute = () => {
  const { plans } = useLayoutContext();
  return <NewEnrollment plans={plans.filter(p => p.active)} />;
};

export const EnrollmentManagementRoute = () => {
  const { plans } = useLayoutContext();
  return <EnrollmentManagement plans={plans} />;
};

export const StudentsManagementRoute = () => {
  return <StudentsManagement />;
};

export const PlansManagementRoute = () => {
  const { plans, onAddPlan, onUpdatePlan, onDeletePlan } = useLayoutContext();
  return (
    <PlansManagement
      plans={plans}
      onAddPlan={onAddPlan}
      onUpdatePlan={onUpdatePlan}
      onDeletePlan={onDeletePlan}
    />
  );
};

export const AITrainerRoute = () => {
  return <AITrainer />;
};

export const FinancialSectionRoute = () => {
  return <ProtectedFinancialSection />;
};

export const SettingsSectionRoute = () => {
  return <ProtectedSettingsSection />;
};

export const PaymentManagementRoute = () => {
  return <PaymentManagement />;
};