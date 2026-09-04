import React from 'react';
import { profileStyles as s } from '../../styles/components/ProfileStep1.styles';

export const CustomizationPreferencesContent: React.FC = () => {
  return (
    <>
      <div className={s.headerRow}>
        <div>
          <h1 className={s.sectionTitle}>Customization preferences</h1>
          <p className={s.sectionSub}>Personalize your account to meet your needs.</p>
        </div>
        <button className={s.saveBtn}>Save</button>
      </div>
      <div className={s.sectionDivider} />

      <div className="max-w-xs space-y-4 pb-6 border-b border-gray-100 mt-4">
        <div className={s.inputWrapper}>
          <label className={s.label}>Currency</label>
          <select className={s.select}>
            <option>₹ Indian Rupee</option>
          </select>
        </div>
        <div className={s.inputWrapper}>
          <label className={s.label}>Language</label>
          <select className={s.select}>
            <option>🇮🇳 English (Indian)</option>
          </select>
        </div>
      </div>
    </>
  );
};
