import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { profileStyles as s } from '../../styles/components/ProfileStep1.styles';

export interface TabItem {
  name: string;
  icon: LucideIcon;
}

interface SidebarProps {
  tabs: TabItem[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <aside className={s.sidebar}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <div
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={s.sidebarItem(activeTab === tab.name)}
          >
            <Icon size={20} strokeWidth={2} />
            <span>{tab.name}</span>
          </div>
        );
      })}
    </aside>
  );
};
