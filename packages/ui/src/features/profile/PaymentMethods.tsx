import React, { useState } from 'react';
import { CreditCard, Trash2 } from 'lucide-react';
import { profileStyles as s } from '../../styles/components/ProfileStep1.styles';
import { ProfileConfirmModal } from './ProfileConfirmModal';
import { showComingSoon } from '../../components/comingSoon.web';

interface SavedCard {
  name: string;
  last4: string;
}

// Payment methods (Web Dev Payment methods frames): empty, add card, saved
// card. There's no saved-cards API yet, so this only keeps the card for the
// session — Razorpay takes the card at checkout.
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

  // There's no payment-methods API yet, so a card "saved" here would only live
  // in this page: say it's coming soon instead.
  const handleAddCard = () => {
    showComingSoon('Saved cards');
  };

  return (
    <>
      <div className={s.headerRow}>
        <div>
          <h1 className={s.sectionTitle}>Payment method</h1>
          <p className={s.sectionSub}>Securely add or remove payment methods to make it easier when you book.</p>
        </div>
        {!isAdding && (
          <button type="button" className={`${s.saveBtn} w-[100px] px-0`} onClick={handleAddCard}>
            Add Card
          </button>
        )}
      </div>

      {isAdding && (
        <div className={s.sectionOuter}>
          <div className={`${s.formHeading} flex items-center`}>
            <span className="w-[430px]">Payment methods</span>
            <button type="button" className="translate-y-[9.5px] text-[15px] leading-5 font-medium text-[#7C1AEE]" onClick={() => setIsAdding(false)}>
              Cancel
            </button>
          </div>
          <div className="mt-[11.4px] grid grid-cols-[343px_auto] gap-x-[70px] gap-y-[15px] items-end">
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
            <div />

            <div className={s.inputWrapper}>
              <label className={s.label}>Card number</label>
              <div className="relative">
                <CreditCard
                  size={20}
                  strokeWidth={1.25}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182339]"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Text"
                  className={`${s.input} pl-10`}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>
            </div>
            <div />

            <div className={`${s.inputWrapper} w-[204px]`}>
              <label className={s.label}>Expiration date</label>
              <select className={s.select} defaultValue="">
                <option value="">MM/YYYY</option>
              </select>
            </div>
            <button type="button" className={`${s.saveBtn} mt-0 -mb-[4px] justify-self-start`} onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      )}

      {!isAdding && savedCard && (
        <div className={`${s.formHeading} pt-[19px] pb-[18px] flex items-start justify-between font-normal`}>
          <div className="flex items-start">
            <div className="w-[238px]">
              <div className="text-[15px] leading-5 font-medium text-[#182339]">{savedCard.name}</div>
              <div className="mt-3 text-[15px] leading-5 text-[#182339]">**** **** **** {savedCard.last4}</div>
            </div>
            <button type="button" className="mt-[10px] text-[15px] leading-5 font-medium text-[#7C1AEE]" onClick={handleEdit}>
              Edit
            </button>
          </div>
          <button
            type="button"
            className="mr-[1px] w-11 h-11 rounded-lg bg-white flex items-center justify-center text-[#697691] hover:bg-[#F8F9FB]"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete card"
          >
            <Trash2 size={20} strokeWidth={2} />
          </button>
        </div>
      )}
      <div className={s.sectionDivider} />

      {showDeleteConfirm && savedCard && (
        <ProfileConfirmModal
          title="Delete card details?"
          text={`Are you sure you want to delete the saved card ending in •••• ${savedCard.last4}?`}
          confirmLabel="Delete Card"
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            setSavedCard(null);
            setShowDeleteConfirm(false);
          }}
        />
      )}
    </>
  );
};
