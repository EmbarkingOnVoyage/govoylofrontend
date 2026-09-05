import React, { useEffect, useState } from 'react';
import { profileStyles as s } from '../../styles/components/ProfileStep1.styles';
import type { CustomerProfile } from './useCustomerProfile';

interface PersonalDetailsContentProps {
  profile?: CustomerProfile;
}

// Formats an ISO date string (e.g. "1990-05-15T00:00:00") as DD/MM/YYYY to
// match the form's existing placeholder format. Returns "" for null/invalid input.
function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export const PersonalDetailsContent: React.FC<PersonalDetailsContentProps> = ({ profile }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [cityOfResidence, setCityOfResidence] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiryDate, setPassportExpiryDate] = useState('');
  const [passportIssuingCountry, setPassportIssuingCountry] = useState('');
  const [panCardNumber, setPanCardNumber] = useState('');
  const [autoAddTravelInsurance, setAutoAddTravelInsurance] = useState(false);

  // Only overwrite a field when the API actually has a value for it — fields
  // with no value keep whatever the form already had (its default/placeholder).
  useEffect(() => {
    if (!profile) return;
    if (profile.firstName) setFirstName(profile.firstName);
    if (profile.lastName) setLastName(profile.lastName);
    if (profile.gender) setGender(profile.gender);
    if (profile.dateOfBirth) setDateOfBirth(formatDate(profile.dateOfBirth));
    if (profile.nationality) setNationality(profile.nationality);
    if (profile.maritalStatus) setMaritalStatus(profile.maritalStatus);
    if (profile.anniversary) setAnniversary(formatDate(profile.anniversary));
    if (profile.cityOfResidence) setCityOfResidence(profile.cityOfResidence);
    if (profile.state) setState(profile.state);
    if (profile.email) setEmail(profile.email);
    if (profile.phone) setPhone(profile.phone);
    if (profile.maskedPassportNumber) setPassportNumber(profile.maskedPassportNumber);
    if (profile.passportExpiryDate) setPassportExpiryDate(formatDate(profile.passportExpiryDate));
    if (profile.passportIssuingCountry) setPassportIssuingCountry(profile.passportIssuingCountry);
    if (profile.maskedPanCardNumber) setPanCardNumber(profile.maskedPanCardNumber);
    setAutoAddTravelInsurance(profile.autoAddTravelInsurance);
  }, [profile]);

  // The Nationality/Marital status/Anniversary/City/State/Issuing country selects
  // don't have a real picklist built yet (just a "Select" placeholder) — inject the
  // fetched value as a selectable option so it can still display correctly.
  const withValueOption = (value: string) =>
    value ? <option value={value}>{value}</option> : null;

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
            <input
              type="text"
              placeholder="Text"
              className={s.input}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className={s.inputWrapper}>
            <label className={s.label}>Last name</label>
            <input
              type="text"
              placeholder="Text"
              className={s.input}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 col-span-1">
            <div className={s.inputWrapper}>
              <label className={s.label}>Gender</label>
              <select className={s.select} value={gender} onChange={(e) => setGender(e.target.value)}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div className={s.inputWrapper}>
              <label className={s.label}>Date of birth</label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                className={s.input}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
          </div>
          <div className={s.inputWrapper}>
            <label className={s.label}>Nationality</label>
            <select className={s.select} value={nationality} onChange={(e) => setNationality(e.target.value)}>
              <option value="">Select</option>
              {withValueOption(nationality)}
            </select>
          </div>
          <div className={s.inputWrapper}>
            <label className={s.label}>Marital status</label>
            <select className={s.select} value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}>
              <option value="">Select</option>
              {withValueOption(maritalStatus)}
            </select>
          </div>
          <div className={s.inputWrapper}>
            <label className={s.label}>Anniversary</label>
            <select className={s.select} value={anniversary} onChange={(e) => setAnniversary(e.target.value)}>
              <option value="">Select</option>
              {withValueOption(anniversary)}
            </select>
          </div>
          <div className={s.inputWrapper}>
            <label className={s.label}>City of residents</label>
            <select
              className={s.select}
              value={cityOfResidence}
              onChange={(e) => setCityOfResidence(e.target.value)}
            >
              <option value="">Select</option>
              {withValueOption(cityOfResidence)}
            </select>
          </div>
          <div className={s.inputWrapper}>
            <label className={s.label}>State</label>
            <select className={s.select} value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">Select</option>
              {withValueOption(state)}
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
              <input
                type="text"
                className={s.successInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
                <input
                  type="text"
                  className={s.phoneInput}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
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
            <input
              type="text"
              placeholder="Text"
              className={s.input}
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
            />
          </div>
          <div className={s.inputWrapper}>
            <label className={s.label}>Expiry date</label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              className={s.input}
              value={passportExpiryDate}
              onChange={(e) => setPassportExpiryDate(e.target.value)}
            />
          </div>
          <div className={s.inputWrapper}>
            <label className={s.label}>Issuing country</label>
            <select
              className={s.select}
              value={passportIssuingCountry}
              onChange={(e) => setPassportIssuingCountry(e.target.value)}
            >
              <option value="">Select</option>
              {withValueOption(passportIssuingCountry)}
            </select>
          </div>
          <div className={s.inputWrapper}>
            <label className={s.label}>PAN card number</label>
            <input
              type="text"
              placeholder="Text"
              className={s.input}
              value={panCardNumber}
              onChange={(e) => setPanCardNumber(e.target.value)}
            />
          </div>
          <p className={s.noticeText}>
            <span className="text-orange-500">NOTE:</span> Your PAN No. will only be used for international bookings as per RBI Guidelines
          </p>
        </div>
        </div>

        {/* Insurance Footer Control Option */}
        <div className={s.checkboxRow}>
          <input
            type="checkbox"
            id="insurance"
            className={s.checkbox}
            checked={autoAddTravelInsurance}
            onChange={(e) => setAutoAddTravelInsurance(e.target.checked)}
          />
          <label htmlFor="insurance" className={s.checkboxLabel}>
            Auto-Add Travel Insurance/Trip Secure
          </label>
        </div>
      </form>
    </>
  );
};
