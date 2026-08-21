import React from 'react';
import { MenuBar } from './MenuBar';
import { Sidebar, TabItem } from './Sidebar';
import { profileStyles as s } from '../../styles/components/ProfileStep1.styles';

interface DashboardLayoutProps {
  children: React.ReactNode;
  tabs?: TabItem[];
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  showSidebar?: boolean; // New control flag
  onNavigate?: (routePath: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  tabs = [],
  activeTab = '',
  setActiveTab = () => {},
  showSidebar = true,
  onNavigate
}) => {
  return (
    <div className={s.container}>
      {/* Top Navbar stays global on all web layouts */}
      <MenuBar  onNavigate={onNavigate} />

      {showSidebar ? (
        <>
          {/* Full Dashboard/Profile Mode Layout Grid */}
          <div className={s.heroBanner}>
            <div className={s.heroBackground} />
            <div className={s.profileCard}>
              <div className={s.avatarWrapper}>
                <img
                  src="https://unsplash.com"
                  alt="Avatar Profile"
                  className={s.avatarImg}
                />
                <div className={s.progressBadge}>50%</div>
              </div>
              <div className={s.profileMeta}>
                <div className={s.profileEmail}>
                  <span>Kishorpawar@gmail.com</span>
                  <span className="text-green-400">✔</span>
                </div>
                <div className={s.profilePhone}>
                  <span>+91 9123405678</span>
                  <span className="text-green-400">✔</span>
                </div>
              </div>
            </div>
          </div>

          <main className={s.mainLayout}>
            <Sidebar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            <section className={s.contentArea}>
              {children}
            </section>
          </main>
        </>
      ) : (
        /* Minimalist Centered Workspace Mode Layout (Used for Login & OTP screens) */
        <main className="flex items-center justify-center min-h-[calc(100vh-73px)] p-6 bg-[#F4F4F6]">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>
      )}
    </div>
  );
};
