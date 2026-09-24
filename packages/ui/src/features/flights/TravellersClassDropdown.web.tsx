import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

export type CabinClass = 'Economy' | 'PremiumEconomy' | 'Business' | 'First';

const CLASS_OPTIONS: { key: CabinClass; label: string }[] = [
  { key: 'Economy', label: 'Economy' },
  { key: 'PremiumEconomy', label: 'Premium Economy' },
  { key: 'Business', label: 'Business Class' },
  { key: 'First', label: 'First Class' },
];

interface StepperRowProps {
  label: string;
  sublabel: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

const StepperRow: React.FC<StepperRowProps> = ({ label, sublabel, value, min, max, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-[15px] font-bold text-[#182339]">{label}</p>
      <p className="text-xs text-[#7C8CAD]">{sublabel}</p>
    </div>
    <div className="flex items-center gap-4">
      <button
        type="button"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 rounded-full bg-[#ECEEF3] flex items-center justify-center disabled:opacity-40"
      >
        <Minus size={14} color="#182339" />
      </button>
      <span className="text-[15px] font-bold text-[#182339] w-4 text-center">{value}</span>
      <button
        type="button"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-8 rounded-full bg-[#ECEEF3] flex items-center justify-center disabled:opacity-40"
      >
        <Plus size={14} color="#182339" />
      </button>
    </div>
  </div>
);

export interface TravellersClassValues {
  adultCount: number;
  childCount: number;
  infantCount: number;
  cabinClass: CabinClass;
  nonStopOnly: boolean;
}

interface TravellersClassDropdownProps {
  initial: TravellersClassValues;
  onConfirm: (values: TravellersClassValues) => void;
}

export const TravellersClassDropdown: React.FC<TravellersClassDropdownProps> = ({ initial, onConfirm }) => {
  const [adultCount, setAdultCount] = useState(initial.adultCount);
  const [childCount, setChildCount] = useState(initial.childCount);
  const [infantCount, setInfantCount] = useState(initial.infantCount);
  const [cabinClass, setCabinClass] = useState<CabinClass>(initial.cabinClass);
  const [nonStopOnly, setNonStopOnly] = useState(initial.nonStopOnly);

  return (
    <div className="w-[375px] bg-white rounded-b-2xl shadow-xl border border-[#ECEEF3] border-t-0 overflow-hidden">
      <div className="px-5 pt-4 pb-2">
        <p className="text-sm font-bold text-[#182339]">Add number of travellers</p>
      </div>
      <div className="px-5 divide-y divide-[#ECEEF3]">
        <StepperRow label="Adult" sublabel="12 yrs and above" value={adultCount} min={1} max={9} onChange={setAdultCount} />
        <StepperRow label="Children" sublabel="2-12 yrs" value={childCount} min={0} max={8} onChange={setChildCount} />
        <StepperRow label="Infant" sublabel="Under 2 yrs" value={infantCount} min={0} max={adultCount} onChange={setInfantCount} />
      </div>

      <div className="border-t border-[#ECEEF3] px-5 pt-4">
        <p className="text-sm font-bold text-[#182339] mb-3">Select class</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {CLASS_OPTIONS.map((opt) => {
            const isSelected = cabinClass === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setCabinClass(opt.key)}
                className={[
                  'h-10 rounded-full border text-sm font-medium transition-colors',
                  isSelected
                    ? 'border-[#7C1AEE] bg-[#F3E9FE] text-[#7C1AEE] font-semibold'
                    : 'border-[#ADB8CD] text-[#4C5973]',
                ].join(' ')}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-[#ECEEF3]">
        <span className="text-[15px] font-semibold text-[#182339]">Non stop flight only</span>
        <button
          type="button"
          onClick={() => setNonStopOnly((v) => !v)}
          className={['w-11 h-6 rounded-full transition-colors relative', nonStopOnly ? 'bg-[#7C1AEE]' : 'bg-[#ADB8CD]'].join(' ')}
        >
          <span
            className={[
              'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform',
              nonStopOnly ? 'translate-x-[22px]' : 'translate-x-0.5',
            ].join(' ')}
          />
        </button>
      </div>

      <div className="p-5 pt-3">
        <button
          type="button"
          onClick={() => onConfirm({ adultCount, childCount, infantCount, cabinClass, nonStopOnly })}
          className="w-full h-12 rounded-full bg-[#7C1AEE] hover:bg-[#6B15D1] text-white font-semibold text-base transition-colors"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};
