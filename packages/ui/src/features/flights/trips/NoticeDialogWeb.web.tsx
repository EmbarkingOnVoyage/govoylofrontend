import React from 'react';

// A small message or confirmation dialog (the web stand-in for mobile's Alert).
export const NoticeDialogWeb: React.FC<{
  title: string;
  text: React.ReactNode;
  onClose: () => void;
  confirmLabel?: string;
  onConfirm?: () => void;
  cancelLabel?: string;
  destructive?: boolean;
}> = ({ title, text, onClose, confirmLabel, onConfirm, cancelLabel = 'Cancel', destructive }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full" role="alertdialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-[#182339] mb-2">{title}</h3>
      <div className="text-sm text-[#4C5973] mb-5">{text}</div>
      <div className="flex justify-end gap-3">
        {onConfirm ? (
          <>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[#D5DAE3] text-sm text-[#182339]">
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-5 py-2 rounded-lg text-white text-sm font-medium ${destructive ? 'bg-[#C8102E]' : 'bg-[#7C1AEE]'}`}
            >
              {confirmLabel ?? 'Continue'}
            </button>
          </>
        ) : (
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg bg-[#7C1AEE] text-white text-sm font-medium">
            OK
          </button>
        )}
      </div>
    </div>
  </div>
);
