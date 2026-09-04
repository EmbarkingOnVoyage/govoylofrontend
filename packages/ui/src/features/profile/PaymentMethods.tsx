import React, { useState } from 'react';
import { profileStyles as s } from '../../styles/components/ProfileStep1.styles';

interface SavedCard {
  name: string;
  last4: string;
}

export const PaymentMethodsContent: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [savedCard, setSavedCard] = useState<SavedCard | null>(null);
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    const digits = cardNumber.replace(/\D/g, '');
    setSavedCard({
      name: cardholderName.trim() || 'Cardholder',
      last4: digits.slice(-4) || '0000',
    });
    setIsAdding(false);
  };

  const handleEdit = () => {
    setCardholderName(savedCard?.name ?? '');
    setCardNumber('');
    setIsAdding(true);
  };

  const handleAddCard = () => {
    setCardholderName('');
    setCardNumber('');
    setIsAdding(true);
  };

  const handleConfirmDelete = () => {
    setSavedCard(null);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className={s.headerRow}>
        <div>
          <h1 className={s.sectionTitle}>Payment method</h1>
          <p className={s.sectionSub}>Securely add or remove payment methods to make it easier when you book.</p>
        </div>
        {!isAdding && (
          <button className={s.saveBtn} onClick={handleAddCard}>Add Card</button>
        )}
      </div>
      <div className={s.sectionDivider} />

      {isAdding && (
        <>
          <div className="mt-6 mb-4">
            <h2 className={s.subHeading}>Payment methods</h2>
          </div>
          <div className="grid grid-cols-[20rem_auto] gap-x-8 gap-y-4">
            <div className={s.inputWrapper}>
              <label className={s.label}>Cardholder's name</label>
              <input
                type="text"
                placeholder="Text"
                className={s.input}
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
              />
            </div>
            <button className={`${s.cancelBtn} self-start justify-self-start`} onClick={() => setIsAdding(false)}>Cancel</button>

            <div className={s.inputWrapper}>
              <label className={s.label}>Card number</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" aria-hidden="true">💳</span>
                <input
                  type="text"
                  placeholder="Text"
                  className={`${s.input} pl-9`}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>
            </div>
            <div />

            <div className={`${s.inputWrapper} max-w-[60%]`}>
              <label className={s.label}>Expiration date</label>
              <select className={s.select}>
                <option>MM/YYYY</option>
              </select>
            </div>
            <button className={`${s.saveBtn} self-end justify-self-start`} onClick={handleSave}>Save</button>
          </div>
          <div className={`${s.sectionDivider} mt-6`} />
        </>
      )}

      {!isAdding && savedCard && (
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-sm font-semibold text-gray-900">{savedCard.name}</div>
              <div className="text-sm text-gray-500 mt-1">**** **** **** {savedCard.last4}</div>
            </div>
            <button className={s.cancelBtn} onClick={handleEdit}>Edit</button>
          </div>
          <button
            className="text-gray-400 hover:text-red-500 transition-colors"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete card"
          >
            🗑
          </button>
        </div>
      )}

      {showDeleteConfirm && savedCard && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowDeleteConfirm(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete card details?</h2>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete the saved card ending in •••• {savedCard.last4}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm px-6 py-2.5 rounded-lg transition-all"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button className={s.saveBtn} onClick={handleConfirmDelete}>Delete Card</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
