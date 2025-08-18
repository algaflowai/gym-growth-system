import React from 'react';
import RestrictedPage from './RestrictedPage';
import SettingsSection from './SettingsSection';

const ProtectedSettingsSection: React.FC = () => {
  return (
    <RestrictedPage page="configuracoes" title="as Configurações">
      <SettingsSection />
    </RestrictedPage>
  );
};

export default ProtectedSettingsSection;