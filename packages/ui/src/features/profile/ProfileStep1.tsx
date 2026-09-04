import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/Layout';
import { PersonalDetailsContent } from './PersonalDetails';
import { CoTravellerContent } from './CoTraveller';
import { CustomizationPreferencesContent } from './CustomizationPreferences';
import { PaymentMethodsContent } from './PaymentMethods';
import { PrivacyDataManagementContent } from './PrivacyDataManagement';

interface ProfileStep1Props {
  // 🟢 Injected directly from your factory layout engine inside main.tsx
  onNavigate?: (rule: string) => void;
}

export const ProfileStep1: React.FC<ProfileStep1Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('Personal details');

  // Restored: Complete configuration options chunk 
  const tabs = [
    { name: 'Personal details', icon: '👤' },
    { name: 'Co-Traveller', icon: '👥' },
    { name: 'Customization preferences', icon: '⚙️' },
    { name: 'Payment methods', icon: '💳' },
    { name: 'Privacy & data management', icon: '🔒' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Personal details':
        return <PersonalDetailsContent />;
      case 'Co-Traveller':
        return <CoTravellerContent />;
      case 'Customization preferences':
        return <CustomizationPreferencesContent />;
      case 'Payment methods':
        return <PaymentMethodsContent />;
      case 'Privacy & data management':
        return <PrivacyDataManagementContent />;
      default:
        return (
          <div className="text-gray-500 text-center py-12">
            Component for "{activeTab}" view coming soon!
          </div>
        );
    }
  };

  return (
    <DashboardLayout tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} showSidebar={true} onNavigate={onNavigate}>
      {renderContent()}
    </DashboardLayout>
  );
};
