import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { profileStyles as s } from '../../styles/components/ProfileStep1.styles';
import { COUNTRY_OPTIONS, GENDER_OPTIONS, INDIAN_CITY_OPTIONS, INDIAN_STATE_OPTIONS } from '../../data/selectOptions';
import {
  useDeleteTravellerMobile,
  useSaveTravellerMobile,
  useTravellerDetailMobile,
  useTravellersMobile,
  type Traveler,
} from './useTravellersMobile';
import { ProfileConfirmModal } from './ProfileConfirmModal';

// Avatar tints from the design, cycled per row.
const AVATAR_COLORS = ['#DC9898', '#A8DC98', '#98B7DC', '#DCCB98', '#C298DC'];

function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '';
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
}

// DD/MM/YYYY → ISO at UTC midnight (local midnight shifts the day in IST).
function parseDisplayDate(display: string): string | null {
  const match = display.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return isNaN(date.getTime()) ? null : date.toISOString();
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "Male, 14 Mar 2018" — read from the date's own digits: the API's date has no
// time zone, so a Date object would shift it by a day.
function rowMeta(t: Traveler): string {
  const match = t.dateOfBirth?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = match ? `${Number(match[3])} ${MONTHS[Number(match[2]) - 1]} ${match[1]}` : '';
  return [t.gender, date].filter(Boolean).join(', ');
}

const optionList = (options: string[], current: string) =>
  (current && !options.includes(current) ? [current, ...options] : options).map((o) => (
    <option key={o} value={o}>
      {o}
    </option>
  ));

// Co-Traveller (Web Dev): the saved list, and the add / edit form. Uses the
// same travellers API as the app; email and phone (not on the web form) are
// carried over so editing never clears them.
export const CoTravellerContent: React.FC = () => {
  const { data: travellers, isLoading, isError } = useTravellersMobile();
  const saveTraveller = useSaveTravellerMobile();
  const deleteTraveller = useDeleteTravellerMobile();

  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: detail } = useTravellerDetailMobile(editingId);
  const [deleteTarget, setDeleteTarget] = useState<Traveler | null>(null);
  const [error, setError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [nationality, setNationality] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [issuingCountry, setIssuingCountry] = useState('');
  const [insurance, setInsurance] = useState(false);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setGender('');
    setDob('');
    setNationality('');
    setCity('');
    setState('');
    setPassportNumber('');
    setPassportExpiry('');
    setIssuingCountry('');
    setInsurance(false);
    setError('');
  };

  // Editing: fill the form once the traveller's details arrive.
  useEffect(() => {
    if (!detail || detail.id !== editingId) return;
    setFirstName(detail.firstName);
    setLastName(detail.lastName);
    setGender(detail.gender ?? '');
    setDob(formatDate(detail.dateOfBirth));
    setNationality(detail.nationality ?? '');
    setCity(detail.city ?? '');
    setState(detail.state ?? '');
    setPassportNumber('');
    setPassportExpiry(formatDate(detail.passport?.expiryDate));
    setIssuingCountry(detail.passport?.issuingCountry ?? '');
    setInsurance(detail.autoAddTravelInsurance);
  }, [detail, editingId]);

  const openAdd = () => {
    resetForm();
    setEditingId(null);
    setMode('form');
  };

  const openEdit = (t: Traveler) => {
    resetForm();
    setEditingId(t.id);
    setMode('form');
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) return setError('Please enter the first and last name.');
    const dateOfBirth = parseDisplayDate(dob);
    if (!dateOfBirth) return setError('Please enter the date of birth as DD/MM/YYYY.');
    if (passportNumber.trim() && !parseDisplayDate(passportExpiry)) {
      return setError('Please enter the passport expiry date as DD/MM/YYYY.');
    }
    setError('');
    try {
      await saveTraveller.mutateAsync({
        id: editingId ?? undefined,
        hasExistingPassport: !!detail?.passport,
        payload: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dateOfBirth,
          gender: gender || undefined,
          nationality: nationality || undefined,
          city: city || undefined,
          state: state || undefined,
          autoAddTravelInsurance: insurance,
          email: detail?.email ?? undefined,
          phone: detail?.phone ?? undefined,
          phoneCountryCode: detail?.phoneCountryCode ?? undefined,
          passportNumber: passportNumber.trim() || undefined,
          passportIssuingCountry: issuingCountry || undefined,
          passportExpiryDate: parseDisplayDate(passportExpiry),
        },
      });
      setMode('list');
      setEditingId(null);
    } catch (err: any) {
      setError(err?.message || 'Could not save the co-traveller.');
    }
  };

  if (mode === 'list') {
    return (
      <>
        <div className={s.headerRow}>
          <div>
            <h1 className={s.sectionTitle}>Add Co-Traveller</h1>
            <p className={s.sectionSub}>Update your info and find out how it's used.</p>
          </div>
          <button type="button" className={`${s.saveBtn} flex items-center gap-[10px] px-4`} onClick={openAdd}>
            <Plus size={16} strokeWidth={2} />
            Add new Co-traveller
          </button>
        </div>
        <div className={s.sectionDivider} />

        <div className="pl-[9px] pt-[25px] w-[457px] flex flex-col gap-3">
          {isLoading && <p className="text-[15px] leading-5 text-[#697691]">Loading co-travellers…</p>}
          {isError && <p className="text-[15px] leading-5 text-[#C5001F]">Could not load your co-travellers.</p>}
          {!isLoading && !isError && (travellers ?? []).length === 0 && (
            <p className="text-[15px] leading-5 text-[#697691]">No co-travellers saved yet.</p>
          )}
          {(travellers ?? []).map((t, index) => (
            <div key={t.id} className="h-11 flex items-center gap-[9px]">
              <span
                className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-[24px] leading-none text-[#3E4B64]"
                style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
              >
                {t.firstName.trim().charAt(0).toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] leading-5 text-[#182339] truncate">
                  {t.firstName} {t.lastName}
                  {t.isAccountHolder && <span className="ml-1 font-semibold text-[#7C1AEE]">(You)</span>}
                </div>
                <div className="mt-1 text-[15px] leading-5 text-[#182339]">{rowMeta(t)}</div>
              </div>
              <button
                type="button"
                onClick={() => openEdit(t)}
                aria-label={`Edit ${t.firstName}`}
                className="w-11 h-11 shrink-0 rounded-lg bg-white flex items-center justify-center text-[#182339] hover:bg-[#F8F9FB]"
              >
                <Pencil size={20} strokeWidth={1.25} />
              </button>
              {!t.isAccountHolder ? (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(t)}
                  aria-label={`Remove ${t.firstName}`}
                  className="w-11 h-11 shrink-0 rounded-lg bg-white flex items-center justify-center text-[#182339] hover:bg-[#F8F9FB]"
                >
                  <Trash2 size={20} strokeWidth={1.25} />
                </button>
              ) : (
                <span className="w-11 h-11 shrink-0" />
              )}
            </div>
          ))}
        </div>

        {deleteTarget && (
          <ProfileConfirmModal
            title="Delete co-traveller?"
            text={`Are you sure you want to remove ${deleteTarget.firstName} ${deleteTarget.lastName} from your co-travellers?`}
            confirmLabel="Delete Co-traveller"
            busy={deleteTraveller.isPending}
            error={deleteTraveller.error ? (deleteTraveller.error as Error).message : undefined}
            onClose={() => {
              deleteTraveller.reset();
              setDeleteTarget(null);
            }}
            onConfirm={() =>
              deleteTraveller.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
            }
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={s.headerRow}>
        <div>
          <h1 className={s.sectionTitle}>{editingId ? 'Edit Co-Traveller' : 'Add Co-Traveller'}</h1>
          <p className={s.sectionSub}>Update your info and find out how it's used.</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={s.headerActions}>
            <button
              type="button"
              className={s.cancelBtn}
              onClick={() => {
                setMode('list');
                setEditingId(null);
              }}
            >
              Cancel
            </button>
            <button type="button" className={s.saveBtn} onClick={handleSave} disabled={saveTraveller.isPending}>
              {saveTraveller.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
          {error && <span className="max-w-[320px] text-right text-[13px] leading-4 text-[#C5001F]">{error}</span>}
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className={s.sectionOuter}>
          <h2 className={s.formHeading}>General information</h2>
          <div className={s.gridForm}>
            <div className={s.inputWrapper}>
              <label className={s.label}>First name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Text" className={s.input} value={firstName} onChange={(e) => setFirstName(e.target.value)}  required/>
            </div>
            <div className={s.inputWrapper}>
              <label className={s.label}>Last name</label>
              <input type="text" placeholder="Text" className={s.input} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="grid grid-cols-[124px_1fr] gap-4">
              <div className={s.inputWrapper}>
                <label className={s.label}>Gender <span className="text-red-500">*</span></label>
                <select className={s.select} value={gender} onChange={(e) => setGender(e.target.value)} required>
                  <option value="">Select</option>
                  {optionList(GENDER_OPTIONS, gender)}
                </select>
              </div>
              <div className={s.inputWrapper}>
                <label className={s.label}>Date of birth</label>
                <input type="text" placeholder="DD/MM/YYYY" className={s.input} value={dob} onChange={(e) => setDob(e.target.value)} required />
              </div>
            </div>
            <div className={s.inputWrapper}>
              <label className={s.label}>Nationality</label>
              <select className={s.select} value={nationality} onChange={(e) => setNationality(e.target.value)} required>
                <option value="">Select</option>
                {optionList(COUNTRY_OPTIONS, nationality)}
              </select>
            </div>
            <div className={s.inputWrapper}>
              <label className={s.label}>City of residents</label>
              <select className={s.select} value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">Select</option>
                {optionList(INDIAN_CITY_OPTIONS, city)}
              </select>
            </div>
            <div className={s.inputWrapper}>
              <label className={s.label}>State</label>
              <select className={s.select} value={state} onChange={(e) => setState(e.target.value)}>
                <option value="">Select</option>
                {optionList(INDIAN_STATE_OPTIONS, state)}
              </select>
            </div>
          </div>
        </div>

        <div className={`${s.sectionOuter} pb-[11px]`}>
          <h2 className={s.formHeading}>Documents Details</h2>
          <div className={`${s.gridForm} gap-y-[11px]`}>
            <div className={s.inputWrapper}>
              <label className={s.label}>Passport number</label>
              <input
                type="text"
                placeholder={detail?.passport ? detail.passport.maskedPassportNumber : 'Text'}
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
                value={passportExpiry}
                onChange={(e) => setPassportExpiry(e.target.value)}
              />
            </div>
            <div className={s.inputWrapper}>
              <label className={s.label}>Issuing country</label>
              <select className={s.select} value={issuingCountry} onChange={(e) => setIssuingCountry(e.target.value)}>
                <option value="">Select</option>
                {optionList(COUNTRY_OPTIONS, issuingCountry)}
              </select>
            </div>
          </div>
        </div>

        <div className={s.checkboxRow}>
          <input
            type="checkbox"
            id="insurance-cotraveller"
            className={s.checkbox}
            checked={insurance}
            onChange={(e) => setInsurance(e.target.checked)}
          />
          <label htmlFor="insurance-cotraveller" className={s.checkboxLabel}>
            Auto-Add Travel Insurance/Trip Secure
          </label>
        </div>
      </form>
    </>
  );
};
