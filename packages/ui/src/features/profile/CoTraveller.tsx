import React, { useState } from 'react';
import { profileStyles as s } from '../../styles/components/ProfileStep1.styles';

interface Traveller {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  avatarColor: string;
}

const AVATAR_COLORS = [
  'bg-pink-200 text-pink-700',
  'bg-green-200 text-green-700',
  'bg-blue-200 text-blue-700',
  'bg-amber-200 text-amber-700',
  'bg-purple-200 text-purple-700',
];

const INITIAL_TRAVELLERS: Traveller[] = [
  { id: '1', firstName: 'Ananya', lastName: 'Sharma', gender: 'Female', dob: '12 Jan 2024', avatarColor: AVATAR_COLORS[0] },
  { id: '2', firstName: 'David', lastName: 'Chen', gender: 'Male', dob: '3 Mar 2023', avatarColor: AVATAR_COLORS[1] },
];

export const CoTravellerContent: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [travellers, setTravellers] = useState<Traveller[]>(INITIAL_TRAVELLERS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Traveller | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setGender('');
    setDob('');
    setEditingId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleEdit = (traveller: Traveller) => {
    setFirstName(traveller.firstName);
    setLastName(traveller.lastName);
    setGender(traveller.gender);
    setDob(traveller.dob);
    setEditingId(traveller.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    setTravellers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      handleDelete(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  const handleSave = () => {
    if (editingId) {
      setTravellers((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? { ...t, firstName: firstName.trim() || t.firstName, lastName: lastName.trim() || t.lastName, gender: gender || t.gender, dob: dob.trim() || t.dob }
            : t
        )
      );
    } else {
      const newTraveller: Traveller = {
        id: Date.now().toString(),
        firstName: firstName.trim() || 'First',
        lastName: lastName.trim() || 'Last',
        gender: gender || 'Not specified',
        dob: dob.trim() || 'DD/MM/YYYY',
        avatarColor: AVATAR_COLORS[travellers.length % AVATAR_COLORS.length],
      };
      setTravellers((prev) => [...prev, newTraveller]);
    }
    setIsAdding(false);
    resetForm();
  };

  if (!isAdding) {
    return (
      <>
        <div className={s.headerRow}>
          <div>
            <h1 className={s.sectionTitle}>Add Co-Traveller</h1>
            <p className={s.sectionSub}>Update your info and find out how it's used.</p>
          </div>
          <button className={s.saveBtn} onClick={handleAddNew}>
            + Add new Co-traveller
          </button>
        </div>
        <div className={s.sectionDivider} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5">
          <div>
            {travellers.map((traveller) => (
              <div key={traveller.id} className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${traveller.avatarColor}`}>
                    {traveller.firstName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{traveller.firstName} {traveller.lastName}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{traveller.gender}, {traveller.dob}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => handleEdit(traveller)}
                    aria-label={`Edit ${traveller.firstName} ${traveller.lastName}`}
                  >
                    ✏️
                  </button>
                  <button
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    onClick={() => setDeleteTarget(traveller)}
                    aria-label={`Delete ${traveller.firstName} ${traveller.lastName}`}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {deleteTarget && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setDeleteTarget(null)}
                aria-label="Close"
              >
                ✕
              </button>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Delete co-traveller?</h2>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete {deleteTarget.firstName} {deleteTarget.lastName} as a saved co-traveller?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm px-6 py-2.5 rounded-lg transition-all"
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </button>
                <button className={s.saveBtn} onClick={handleConfirmDelete}>Delete Co-traveller</button>
              </div>
            </div>
          </div>
        )}
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
          <button className={s.saveBtn} onClick={handleSave}>Save</button>
        </div>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        {/* General Section */}
        <div className={s.sectionOuter}>
        <h2 className={s.formHeading}>General information</h2>
        <div className={s.gridForm}>
          <div className={s.inputWrapper}>
            <label className={s.label}>First name</label>
            <input type="text" placeholder="Text" className={s.input} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className={s.inputWrapper}>
            <label className={s.label}>Last name</label>
            <input type="text" placeholder="Text" className={s.input} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4 col-span-1">
            <div className={s.inputWrapper}>
              <label className={s.label}>Gender</label>
              <select className={s.select} value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </div>
            <div className={s.inputWrapper}>
              <label className={s.label}>Date of birth</label>
              <input type="text" placeholder="DD/MM/YYYY" className={s.input} value={dob} onChange={(e) => setDob(e.target.value)} />
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
