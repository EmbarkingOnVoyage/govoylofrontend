import React, { useState } from 'react';
import { profileStyles as s } from '../../styles/components/ProfileStep1.styles';

export const CoTravellerContent: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);

  if (!isAdding) {
    return (
      <>
        <div className={s.headerRow}>
          <div>
            <h1 className={s.sectionTitle}>Add Co-Traveller</h1>
            <p className={s.sectionSub}>Update your info and find out how it's used.</p>
          </div>
          <button className={s.saveBtn} onClick={() => setIsAdding(true)}>
            + Add new Co-traveller
          </button>
        </div>
        <div className={s.sectionDivider} />
      </>
    );
  }

  return (
    <>
      <div className={s.headerRow}>
        <div>
          <h1 className={s.sectionTitle}>Add Co-Traveller</h1>
          <p className={s.sectionSub}>Update your info and find out how it's used.</p>
        </div>
        <div className={s.headerActions}>
          <button className={s.cancelBtn} onClick={() => setIsAdding(false)}>Cancel</button>
          <button className={s.saveBtn}>Save</button>
        </div>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        {/* General Section */}
        <div className={s.sectionOuter}>
        <h2 className={s.formHeading}>General information</h2>
        <div className={s.gridForm}>
          <div className={s.inputWrapper}>
            <label className={s.label}>First name</label>
            <input type="text" placeholder="Text" className={s.input} />
          </div>
          <div className={s.inputWrapper}>
            <label className={s.label}>Last name</label>
            <input type="text" placeholder="Text" className={s.input} />
          </div>
          <div className="grid grid-cols-2 gap-4 col-span-1">
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
        </div>

        {/* Document Details Section */}
        <div className={s.sectionOuter}>
        <h2 className={s.formHeading}>Documents Details</h2>
        <div className={s.gridForm}>
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
        </div>
        </div>

        {/* Insurance Footer Control Option */}
        <div className={s.checkboxRow}>
          <input type="checkbox" id="insurance-cotraveller" className={s.checkbox} />
          <label htmlFor="insurance-cotraveller" className={s.checkboxLabel}>
            Auto-Add Travel Insurance/Trip Secure
          </label>
        </div>
      </form>
    </>
  );
};
