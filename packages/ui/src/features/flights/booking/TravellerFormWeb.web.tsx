import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSaveTravellerMobile, useTravellerDetailMobile, type Traveler } from '../../profile/useTravellersMobile';
import { COUNTRY_OPTIONS, GENDER_OPTIONS } from '../../../data/selectOptions';

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-[#D5DAE3] text-sm text-[#182339] bg-white focus:outline-none focus:border-[#7C1AEE]';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="block text-xs font-medium text-[#4C5973] mb-1">{label}</span>
    {children}
  </label>
);

// The date part of an ISO date, for <input type="date">.
function dateInputValue(iso: string | null | undefined): string {
  return iso?.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? '';
}

// Web Dev "Adult 1" block: a new saved traveller, or edits to one, written
// through the same travellers API as the mobile Co-traveller form. Passport
// numbers only ever come back masked, so the number is re-entered to change it.
export const TravellerFormWeb: React.FC<{
  heading: string;
  traveller?: Traveler | null;
  onSaved: (travellerId: string | undefined) => void;
  onCancel: () => void;
}> = ({ heading, traveller, onSaved, onCancel }) => {
  const { data: detail } = useTravellerDetailMobile(traveller?.id ?? null);
  const save = useSaveTravellerMobile();
  const [firstName, setFirstName] = useState(traveller?.firstName ?? '');
  const [lastName, setLastName] = useState(traveller?.lastName ?? '');
  const [gender, setGender] = useState(traveller?.gender ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(dateInputValue(traveller?.dateOfBirth));
  const [nationality, setNationality] = useState(traveller?.nationality ?? 'India');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [passportCountry, setPassportCountry] = useState('');
  const [error, setError] = useState('');

  const existingPassport = detail?.passport ?? null;
  const today = new Date().toISOString().slice(0, 10);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) return setError('Please enter the first and last name as on the ID.');
    if (!gender) return setError('Please select a gender.');
    if (!dateOfBirth) return setError('Please enter the date of birth.');
    if (dateOfBirth > today) return setError('Date of birth must be in the past.');
    const passportEdited = !!passportNumber.trim();
    if (passportEdited && (!passportExpiry || !passportCountry)) {
      return setError('Please enter the passport expiry date and issuing country.');
    }
    if (passportEdited && passportExpiry <= today) return setError('The passport has expired.');

    setError('');
    try {
      const id = await save.mutateAsync({
        id: traveller?.id,
        hasExistingPassport: !!existingPassport,
        payload: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          gender,
          dateOfBirth,
          nationality,
          autoAddTravelInsurance: traveller?.autoAddTravelInsurance ?? false,
          passportNumber: passportEdited ? passportNumber.trim().toUpperCase() : undefined,
          passportExpiryDate: passportEdited ? passportExpiry : undefined,
          passportIssuingCountry: passportEdited ? passportCountry : undefined,
        },
      });
      onSaved(id);
    } catch (err) {
      setError((err as Error)?.message || 'Could not save the traveller.');
    }
  };

  return (
    <div className="rounded-xl border border-[#C9B5F5] bg-white p-5 space-y-5">
      <div>
        <h4 className="text-base font-semibold text-[#182339]">{heading}</h4>
        <p className="text-xs text-[#697691]">
          Please ensure your visa is valid, passport has 6+ months validity, and the name matches your passport.
        </p>
      </div>

      <div>
        <h5 className="text-sm font-semibold text-[#182339] mb-2">General information</h5>
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </Field>
          <Field label="Last name">
            <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <Field label="Gender">
            <select className={inputClass} value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Select</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field label="Date of birth">
            <input type="date" max={today} className={inputClass} value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </Field>
          <Field label="Nationality">
            <select className={inputClass} value={nationality} onChange={(e) => setNationality(e.target.value)}>
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <div>
        <h5 className="text-sm font-semibold text-[#182339] mb-1">Documents</h5>
        <p className="text-xs text-[#697691] mb-2">
          Needed for international flights.
          {existingPassport && ` Passport on file: ${existingPassport.maskedPassportNumber} — enter the full number only to change it.`}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Passport number">
            <input className={inputClass} value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} />
          </Field>
          <Field label="Expiry date">
            <input type="date" min={today} className={inputClass} value={passportExpiry} onChange={(e) => setPassportExpiry(e.target.value)} />
          </Field>
          <Field label="Issuing country">
            <select className={inputClass} value={passportCountry} onChange={(e) => setPassportCountry(e.target.value)}>
              <option value="">Select</option>
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {error && <p className="text-sm text-[#C8102E]">{error}</p>}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-5 py-2 rounded-lg border border-[#D5DAE3] text-sm text-[#182339]">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={save.isPending}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#7C1AEE] text-white text-sm font-medium disabled:opacity-60"
        >
          {save.isPending && <Loader2 size={14} className="animate-spin" />}
          Save
        </button>
      </div>
    </div>
  );
};
