// packages/ui/src/features/profile/ProfileStep1.tsx
import React, { useState } from 'react';
import { profileStyles as s } from '../../styles/components/ProfileStep1.styles';

export const ProfileStep1: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Personal details');

  const tabs = [
    { name: 'Personal details', icon: '👤' },
    { name: 'Co-Traveller', icon: '👥' },
    { name: 'Customization preferences', icon: '⚙️' },
    { name: 'Payment methods', icon: '💳' },
    { name: 'Privacy & data management', icon: '🔒' },
  ];

  return (
    <div className={s.container}>
      {/* Top Navbar */}
      <nav className={s.navbar}>
        <div className={s.navLeft}>
          <div className={s.logo}>govoylo</div>
          <div className={s.navLinks}>
            <span className={s.navLink}>Flight</span>
            <span className={s.navLink}>Hotel</span>
            <span className={s.navLink}>Cabs</span>
          </div>
        </div>
        <div className={s.navRight}>
          <span className="cursor-pointer flex items-center">🇺🇸 USD</span>
          <span className="cursor-pointer">Help & support</span>
          <span className="cursor-pointer flex items-center space-x-1">
            <span>👤</span>
            <span>Log in/Sign up</span>
          </span>
          <span className="cursor-pointer text-lg">☰</span>
        </div>
      </nav>

      {/* Profile Header Banner */}
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

      {/* Main Structural Framework Layout */}
      <main className={s.mainLayout}>
        {/* Left Hand Navigation Rail */}
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

        {/* Central Content Panel */}
        <section className={s.contentArea}>
          <div className={s.headerRow}>
            <div>
              <h1 className={s.sectionTitle}>Personal details</h1>
              <p className={s.sectionSub}>Update your info and find out how it's used.</p>
            </div>
            <button className={s.saveBtn}>Save</button>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            {/* General Section */}
            <div className={s.gridForm}>
              <h2 className={s.formHeading}>General information</h2>
              
              <div className={s.inputWrapper}>
                <label className={s.label}>First name</label>
                <input type="text" placeholder="Text" className={s.input} />
              </div>

              <div className={s.inputWrapper}>
                <label className={s.label}>Last name</label>
                <input type="text" placeholder="Text" className={s.input} />
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-1 lg:col-span-1 sm:col-span-2">
                <div className={s.inputWrapper}>
                  <label className={s.label}>Gender</label>
                  <select className={s.select}>
                    <option>Select</option>
                  </select>
                </div>
                <div className={s.inputWrapper}>
                  <label className={s.label}>Date of birth</label>
                  <input type="text" placeholder="DD/MM/YYYY" className={s.input} />
                </div>
              </div>

              <div className={s.inputWrapper}>
                <label className={s.label}>Nationality</label>
                <select className={s.select}>
                  <option>Select</option>
                </select>
              </div>

              <div className={s.inputWrapper}>
                <label className={s.label}>Marital status</label>
                <select className={s.select}>
                  <option>Select</option>
                </select>
              </div>

              <div className={s.inputWrapper}>
                <label className={s.label}>Anniversary</label>
                <select className={s.select}>
                  <option>Select</option>
                </select>
              </div>

              <div className={s.inputWrapper}>
                <label className={s.label}>City of residents</label>
                <select className={s.select}>
                  <option>Select</option>
                </select>
              </div>

              <div className={s.inputWrapper}>
                <label className={s.label}>State</label>
                <select className={s.select}>
                  <option>Select</option>
                </select>
              </div>
            </div>

            {/* Contact details Section */}
            <div className={s.gridForm}>
              <h2 className={s.formHeading}>Contact Details</h2>

              <div className={s.inputWrapperDouble}>
                <label className={s.label}>Email address</label>
                <div className={s.successWrapper}>
                  <input type="text" defaultValue="Text" className={s.successInput} />
                  <span className={s.successIcon}>✔</span>
                </div>
              </div>

              <div className={s.inputWrapperDouble}>
                <label className={s.label}>Phone number</label>
                <div className={s.phoneGroup}>
                  <div className={s.phoneLeft}>
                    <span>🇮🇳</span>
                    <span>+91</span>
                    <span className="text-[10px] text-gray-400">▼</span>
                  </div>
                  <div className="relative flex-1 flex items-center">
                    <input type="text" defaultValue="1234" className={s.phoneInput} />
                    <span className="absolute right-3 text-green-500 text-sm">✔</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Details Section */}
            <div className={s.gridForm}>
              <h2 className={s.formHeading}>Documents Details</h2>

              <div className={s.inputWrapper}>
                <label className={s.label}>Passport number</label>
                <input type="text" placeholder="Text" className={s.input} />
              </div>

              <div className={s.inputWrapper}>
                <label className={s.label}>Expiry date</label>
                <input type="text" placeholder="DD/MM/YYYY" className={s.input} />
              </div>

              <div className={s.inputWrapper}>
                <label className={s.label}>Issuing country</label>
                <select className={s.select}>
                  <option>Select</option>
                </select>
              </div>

              <div className={s.inputWrapper}>
                <label className={s.label}>PAN card number</label>
                <input type="text" placeholder="Text" className={s.input} />
              </div>

              <p className={s.noticeText}>
                NOTE: Your PAN No. will only be used for international bookings as per RBI Guidelines
              </p>
            </div>

            {/* Insurance Footer Control Option */}
            <div className={s.checkboxRow}>
              <input type="checkbox" id="insurance" className={s.checkbox} />
              <label htmlFor="insurance" className={s.checkboxLabel}>
                Auto-Add Travel Insurance/Trip Secure
              </label>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};
