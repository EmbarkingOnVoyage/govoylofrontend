import React from 'react';
import { MenuBar } from './MenuBar';
import { Sidebar, TabItem } from './Sidebar';
import { profileStyles as s } from '../../styles/components/ProfileStep1.styles';
import { BASE_URL, type CustomerProfile } from '../../features/profile/useCustomerProfile';
import profileBannerBg from '../../assets/images/profile-banner-bg.png';

interface DashboardLayoutProps {
  children: React.ReactNode;
  tabs?: TabItem[];
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  showSidebar?: boolean; // New control flag
  onNavigate?: (routePath: string) => void;
  profile?: CustomerProfile;
}

function getInitials(profile?: CustomerProfile): string {
  const initials = `${profile?.firstName?.[0] ?? ''}${profile?.lastName?.[0] ?? ''}`;
  return initials || '?';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  tabs = [],
  activeTab = '',
  setActiveTab = () => {},
  showSidebar = true,
  onNavigate,
  profile
}) => {
  return (
    <div className={s.container}>
      {/* Top Navbar stays global on all web layouts */}
      <MenuBar  onNavigate={onNavigate} />

      {showSidebar ? (
        <>
          {/* Full Dashboard/Profile Mode Layout Grid */}
          <div className={s.heroBanner}>
            <div
              className={s.heroBackground}
              style={{ backgroundImage: `url(${profileBannerBg})`, opacity: 0.1 }}
            />
            <div className={s.heroInner}>
              <div className={s.profileCard}>
                <div className={s.avatarWrapper}>
                  {profile?.profileImageUrl ? (
                    <img
                      src={`${BASE_URL}${profile.profileImageUrl}`}
                      alt="Avatar Profile"
                      className={s.avatarImg}
                    />
                  ) : (
                    <div className={s.avatarPlaceholder}>{getInitials(profile)}</div>
                  )}
                  <div className={s.progressBadge}>{profile?.profileCompletionPercentage ?? 0}%</div>
                </div>
                <div className={s.profileMeta}>
                  <div className={s.profileEmail}>
                    <span>{profile?.email || '—'}</span>
                    {profile?.isEmailVerified && <span className="text-green-400">✔</span>}
                  </div>
                  <div className={s.profilePhone}>
                    <span>{profile?.phone || '—'}</span>
                    {profile?.isPhoneVerified && <span className="text-green-400">✔</span>}
                  </div>
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
