import React from 'react';
import { profileStyles as s } from '../../styles/components/ProfileStep1.styles';

export interface TabItem {
  name: string;
  icon: string;
}

interface SidebarProps {
  tabs: TabItem[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <aside className={s.sidebar}>
      {tabs.map((tab) => (
        <div
          key={tab.name}
          onClick={() => setActiveTab(tab.name)}
          className={s.sidebarItem(activeTab === tab.name)}
        >
          <span className="text-base">{tab.icon}</span>
          <span>{tab.name}</span>
        </div>
      ))}
    </aside>
  );
};
