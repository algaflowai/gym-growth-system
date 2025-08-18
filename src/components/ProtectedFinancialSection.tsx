import React from 'react';
import RestrictedPage from './RestrictedPage';
import FinancialSection from './FinancialSection';

const ProtectedFinancialSection: React.FC = () => {
  return (
    <RestrictedPage page="financeiro" title="o Módulo Financeiro">
      <FinancialSection />
    </RestrictedPage>
  );
};

export default ProtectedFinancialSection;