import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSaveTravellerMobile, useTravellerDetailMobile, type Traveler } from '../../profile/useTravellersMobile';
import { COUNTRY_OPTIONS, GENDER_OPTIONS } from '../../../data/selectOptions';
import { FieldWeb, Separator, SubHeading, fieldInputClass } from './BookingLayoutWeb.web';

const inputClass = fieldInputClass;
const Field = FieldWeb;

// The date part of an ISO date, for <input type="date">.
function dateInputValue(iso: string | null | undefined): string {
  return iso?.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? '';
}

// Web Dev "Adult 1" block: a new saved traveller, or edits to one, written
// through the same travellers API as the mobile Co-traveller form. Passport
// numbers only ever come back masked, so the number is re-entered to change it.
export const TravellerFormWeb: React.FC<{
  heading: string;
  subtitle: string;
  traveller?: Traveler | null;
  onSaved: (travellerId: string | undefined) => void;
  onCancel: () => void;
}> = ({ heading, subtitle, traveller, onSaved, onCancel }) => {
  const { data: detail } = useTravellerDetailMobile(traveller?.id ?? null);
  const save = useSaveTravellerMobile();
  const [firstName, setFirstName] = useState(traveller?.firstName ?? '');
  const [lastName, setLastName] = useState(traveller?.lastName ?? '');
  const [gender, setGender] = useState(traveller?.gender ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(dateInputValue(traveller?.dateOfBirth));
  const [nationality, setNationality] = useState(traveller?.nationality ?? 'India');
  const [email, setEmail] = useState(traveller?.email ?? '');
  const [phone, setPhone] = useState(traveller?.phone ?? '');
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
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Please enter a valid email address.');
    if (phone.trim() && !/^[6-9]\d{9}$/.test(phone.trim())) return setError('Please enter a valid 10-digit mobile number.');
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
          // Saving replaces every field, so send back what this form doesn't edit.
          city: traveller?.city ?? undefined,
          state: traveller?.state ?? undefined,
          autoAddTravelInsurance: traveller?.autoAddTravelInsurance ?? false,
          email: email.trim(),
          phone: phone.trim(),
          phoneCountryCode: '+91',
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-[3px]">
          <h2 className="text-[18px] leading-6 font-bold text-black">{heading}</h2>
          <p className="text-[15px] leading-5 font-medium text-black">{subtitle}</p>
        </div>
        <Separator />
      </div>

      <div className="w-[703px] max-w-full flex flex-col gap-3">
        <SubHeading>General information</SubHeading>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Field label="First name" className="w-[343px]">
              <input className={inputClass} placeholder="Text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </Field>
            <Field label="Last name" className="w-[343px]">
              <input className={inputClass} placeholder="Text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </Field>
          </div>
          <div className="flex items-center gap-4">
            <Field label="Gender" className="w-[124px]">
              <select className={inputClass} value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </Field>
            <Field label="Date of birth" className="w-[204px]">
              <input type="date" max={today} className={inputClass} value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </Field>
            <Field label="Nationality" className="w-[343px]">
              <select className={inputClass} value={nationality} onChange={(e) => setNationality(e.target.value)}>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </div>
      <Separator />

      <div className="w-[703px] max-w-full flex flex-col gap-3">
        <SubHeading>Contact details</SubHeading>
        <div className="flex items-center gap-4">
          <Field label="Email address" className="w-[343px]">
            <input
              type="email"
              className={inputClass}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Mobile number" className="w-[343px]">
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className={inputClass}
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
            />
          </Field>
        </div>
      </div>
      <Separator />

      <div className="w-[709px] max-w-full flex flex-col gap-3">
        <SubHeading>Documents Details</SubHeading>
        <p className="-mt-2 text-[13px] leading-4 text-[#697691]">
          Needed for international flights.
          {existingPassport && ` Passport on file: ${existingPassport.maskedPassportNumber} — enter the full number only to change it.`}
        </p>
        <div className="flex items-center gap-4">
          <Field label="Passport number" className="w-[343px]">
            <input className={inputClass} placeholder="Text" value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} />
          </Field>
          <Field label="Expiry date" className="w-[343px]">
            <input type="date" min={today} className={inputClass} value={passportExpiry} onChange={(e) => setPassportExpiry(e.target.value)} />
          </Field>
        </div>
        <Field label="Issuing country" className="w-[343px]">
          <select className={inputClass} value={passportCountry} onChange={(e) => setPassportCountry(e.target.value)}>
            <option value="">Select</option>
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>

      {error && <p className="text-[13px] leading-4 text-[#C5001F]">{error}</p>}

      <div className="w-[703px] max-w-full flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="h-10 px-5 rounded-lg border border-[#ADB8CD] text-[15px] leading-5 font-medium text-[#3E4B64]">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={save.isPending}
          className="h-10 flex items-center gap-2 px-6 rounded-lg bg-[#7C1AEE] text-[15px] leading-5 font-medium text-white disabled:opacity-60"
        >
          {save.isPending && <Loader2 size={14} className="animate-spin" />}
          Save traveller
        </button>
      </div>
      <Separator />
    </div>
  );
};
