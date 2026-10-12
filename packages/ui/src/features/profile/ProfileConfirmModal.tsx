import React from 'react';
import { X } from 'lucide-react';

const MODAL_SHADOW =
  '0 60px 40px rgba(79,94,113,0.05), 0 40px 30px rgba(79,94,113,0.08), 0 24px 24px rgba(79,94,113,0.14), 0 5px 16px rgba(79,94,113,0.15), 0 2px 6px -1px rgba(79,94,113,0.14), 0 -1px 2px -1px rgba(79,94,113,0.15)';

// Web Dev "Modal (Desktop)": 740px, 16px radius, 24px title, Cancel + action.
export const ProfileConfirmModal: React.FC<{
  title: string;
  text: string;
  confirmLabel: string;
  busy?: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
}> = ({ title, text, confirmLabel, busy, error, onConfirm, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(24,35,57,0.4)] p-4 font-['Inter',sans-serif]"
    onClick={() => !busy && onClose()}
  >
    <div
      className="relative w-[740px] max-w-full bg-white rounded-2xl px-8 pt-[32px] pb-8"
      style={{ boxShadow: MODAL_SHADOW }}
      role="dialog"
      aria-label={title}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onClose}
        disabled={busy}
        aria-label="Close"
        className="absolute right-[15.5px] top-[16.5px] w-5 h-5 flex items-center justify-center text-[#182339]"
      >
        <X size={20} strokeWidth={1.5} />
      </button>
      <h2 className="text-[24px] leading-[30px] font-bold text-[#182339]">{title}</h2>
      <p className="mt-[8.8px] text-[15px] leading-5 text-[#182339]">{text}</p>
      {error && <p className="mt-2 text-[13px] leading-4 text-[#C5001F]">{error}</p>}
      <div className="mt-[33px] flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="min-w-[101px] h-11 px-6 rounded-xl bg-[#CCD3E0] text-[15px] leading-5 font-medium text-[#182339]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="min-w-[117px] h-11 px-4 rounded-xl bg-[#7C1AEE] text-[15px] leading-5 font-medium text-white disabled:opacity-60"
        >
          {busy ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);
