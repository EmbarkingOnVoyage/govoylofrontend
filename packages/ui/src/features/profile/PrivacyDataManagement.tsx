import React from 'react';
import { profileStyles as s } from '../../styles/components/ProfileStep1.styles';

export const PrivacyDataManagementContent: React.FC = () => {
  return (
    <>
      <div className={s.headerRow}>
        <div>
          <h1 className={s.sectionTitle}>Privacy and data management</h1>
          <p className={s.sectionSub}>Manage your privacy preferences, control your personal data, or download a copy of your information.</p>
        </div>
      </div>
      <div className={s.sectionDivider} />

      <div className="flex items-start gap-6 py-4">
        <div className="w-[40%]">
          <div className="text-sm text-gray-900">pawarkishork7@gmail.com</div>
          <p className="text-sm text-gray-500 mt-2">
            Select "Manage" to change your privacy settings and exercise your rights using our request form.
          </p>
        </div>
        <div className="w-[60%]">
          <button className={s.cancelBtn}>Manage</button>
        </div>
      </div>
      <div className="border-b border-gray-100" />
    </>
  );
};
