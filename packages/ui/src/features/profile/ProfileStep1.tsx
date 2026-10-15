import React, { useState } from 'react';
import { UserRound, Users, UserCog, CreditCard, UserLock } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/Layout';
import { PersonalDetailsContent } from './PersonalDetails';
import { CoTravellerContent } from './CoTraveller';
import { CustomizationPreferencesContent } from './CustomizationPreferences';
import { PaymentMethodsContent } from './PaymentMethods';
import { PrivacyDataManagementContent } from './PrivacyDataManagement';
import { useCustomerProfile } from './useCustomerProfile';

interface ProfileStep1Props {
  // 🟢 Injected directly from your factory layout engine inside main.tsx
  onNavigate?: (rule: string) => void;
}

export const ProfileStep1: React.FC<ProfileStep1Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('Personal details');
  const { data: profile } = useCustomerProfile();

  // Restored: Complete configuration options chunk 
  const tabs = [
    { name: 'Personal details', icon: UserRound },
    { name: 'Co-Traveller', icon: Users },
    { name: 'Customization preferences', icon: UserCog },
    { name: 'Payment methods', icon: CreditCard },
    { name: 'Privacy & data management', icon: UserLock },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Personal details':
        return <PersonalDetailsContent profile={profile} />;
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
          <div className="text-center py-12">
            <p className="text-[18px] leading-6 font-bold text-[#182339]">Coming soon</p>
            <p className="mt-1 text-[15px] text-[#4C5973]">{activeTab} will be available here soon.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} showSidebar={true} onNavigate={onNavigate} profile={profile}>
      {renderContent()}
    </DashboardLayout>
  );
};
