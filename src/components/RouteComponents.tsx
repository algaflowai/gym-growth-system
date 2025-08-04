import { useNavigate } from 'react-router-dom';
import { useLayoutContext } from './AppLayout';
import Dashboard from './Dashboard';
import NewEnrollment from './NewEnrollment';
import EnrollmentManagement from './EnrollmentManagement';
import StudentsManagement from './StudentsManagement';
import PlansManagement from './PlansManagement';
import AITrainer from './AITrainer';
import FinancialSection from './FinancialSection';
import SettingsSection from './SettingsSection';

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
  return <FinancialSection />;
};

export const SettingsSectionRoute = () => {
  return <SettingsSection />;
};