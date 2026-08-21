import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/Layout';
import { PersonalDetailsContent } from './PersonalDetails';

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
