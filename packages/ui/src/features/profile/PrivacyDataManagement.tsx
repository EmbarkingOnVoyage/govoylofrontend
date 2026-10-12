import React from 'react';
import { profileStyles as s } from '../../styles/components/ProfileStep1.styles';
import { useCustomerProfile } from './useCustomerProfile';

// Privacy and data management (Web Dev): the account email with "Manage",
// and the explanation. "Manage" has no request form behind it yet.
export const PrivacyDataManagementContent: React.FC = () => {
  const { data: profile } = useCustomerProfile();
  return (
    <>
      <div className={s.headerRow}>
        <div>
          <h1 className={s.sectionTitle}>Privacy and data management</h1>
          <p className={s.sectionSub}>
            Manage your privacy preferences, control your personal data, or download a copy of your information.
          </p>
        </div>
      </div>
      <div className={s.sectionDivider} />

      <div className="pt-[18px] pb-[30px] flex items-start">
        <div className="w-[422px]">
          <div className="text-[15px] leading-5 text-[#182339]">{profile?.email || '—'}</div>
          <p className="mt-4 max-w-[380px] text-[15px] leading-5 text-[#182339]">
            Select "Manage" to change your privacy settings and exercise your rights using our request form.
          </p>
        </div>
        <button type="button" className="text-[15px] leading-5 font-medium text-[#6014B7] underline underline-offset-[3px]">
          Manage
        </button>
      </div>
      <div className={s.sectionDivider} />
    </>
  );
};
