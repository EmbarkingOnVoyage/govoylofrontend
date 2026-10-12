import React from 'react';
import { profileStyles as s } from '../../styles/components/ProfileStep1.styles';

// Customization preferences (Web Dev): currency and language, 343px selects.
// Only INR / English are offered today.
export const CustomizationPreferencesContent: React.FC = () => {
  return (
    <>
      <div className={s.headerRow}>
        <div>
          <h1 className={s.sectionTitle}>Customization preferences</h1>
          <p className={s.sectionSub}>Personalize your account to meet your needs.</p>
        </div>
        <button type="button" className={s.saveBtn}>
          Save
        </button>
      </div>

      <div className={s.sectionOuter}>
        <div className="-mr-1 border-t border-[#CCD3E0]" />
        <div className="mt-[17.5px] w-[343px] flex flex-col gap-[15px]">
          <div className={s.inputWrapper}>
            <label className={s.label}>Currency</label>
            <select className={s.select} defaultValue="INR">
              <option value="INR">₹ Indian Rupee</option>
            </select>
          </div>
          <div className={s.inputWrapper}>
            <label className={s.label}>Language</label>
            <select className={`${s.select} text-[#182339]`} defaultValue="en-IN">
              <option value="en-IN">English (Indian)</option>
            </select>
          </div>
        </div>
      </div>
      <div className={s.sectionDivider} />
    </>
  );
};
