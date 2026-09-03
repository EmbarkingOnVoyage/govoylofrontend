import React from 'react';
import { profileStyles as s } from '../../styles/components/ProfileStep1.styles';

export const PersonalDetailsContent: React.FC = () => {
  return (
    <>
      <div className={s.headerRow}>
        <div>
          <h1 className={s.sectionTitle}>Personal details</h1>
          <p className={s.sectionSub}>Update your info and find out how it's used.</p>
        </div>
        <button className={s.saveBtn}>Save</button>
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
                <option>Male</option>
                <option>Female</option>
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
        </div>

        {/* Contact details Section */}
        <div className={s.sectionOuter}>
        <h2 className={s.formHeading}>Contact Details</h2>
        <div className={s.gridForm}>
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
                <span className="text-sm leading-none">🇮🇳</span>
                <span className="text-sm font-medium leading-none">+91</span>
                <span className="text-[10px] text-gray-400 leading-none">▼</span>
              </div>
              <div className="relative flex-1 flex items-center">
                <input type="text" defaultValue="1234" className={s.phoneInput} />
                <span className="absolute right-3 text-green-500 text-sm">✔</span>
              </div>
            </div>
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
          <div className={s.inputWrapper}>
            <label className={s.label}>PAN card number</label>
            <input type="text" placeholder="Text" className={s.input} />
          </div>
          <p className={s.noticeText}>
            <span aria-hidden="true">⚠️</span>
            <span>NOTE: Your PAN No. will only be used for international bookings as per RBI Guidelines</span>
          </p>
        </div>
        </div>

        {/* Insurance Footer Control Option */}
        <div className={s.checkboxRow}>
          <input type="checkbox" id="insurance" className={s.checkbox} />
          <label htmlFor="insurance" className={s.checkboxLabel}>
            Auto-Add Travel Insurance/Trip Secure
          </label>
        </div>
      </form>
    </>
  );
};
