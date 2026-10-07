import React, { useRef } from 'react';

// Web Dev slider: 4px grey track (#ADB8CD), blue (#114BFF) selected part,
// 24px white handles with a soft shadow and an 8px blue dot. One handle
// (`low` undefined) or two (a range).
export const RangeSliderWeb: React.FC<{
  min: number;
  max: number;
  step?: number;
  low?: number;
  high: number;
  onChange: (low: number | undefined, high: number) => void;
  label: string;
}> = ({ min, max, step = 1, low, high, onChange, label }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const span = Math.max(1, max - min);
  const pct = (v: number) => ((Math.min(max, Math.max(min, v)) - min) / span) * 100;
  const isRange = low !== undefined;

  const valueAt = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.round((min + ratio * span) / step) * step;
  };

  const startDrag = (which: 'low' | 'high') => (e: React.PointerEvent) => {
    e.preventDefault();
    const move = (ev: PointerEvent) => {
      const v = valueAt(ev.clientX);
      if (which === 'low' && isRange) onChange(Math.min(v, high), high);
      else onChange(low, isRange ? Math.max(v, low!) : v);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onTrackClick = (e: React.MouseEvent) => {
    const v = valueAt(e.clientX);
    if (isRange && Math.abs(v - low!) < Math.abs(v - high)) onChange(Math.min(v, high), high);
    else onChange(low, isRange ? Math.max(v, low!) : v);
  };

  const handle = (which: 'low' | 'high', value: number) => (
    <span
      role="slider"
      aria-label={`${label} ${which === 'low' ? 'minimum' : 'maximum'}`}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      tabIndex={0}
      onPointerDown={startDrag(which)}
      onKeyDown={(e) => {
        const delta = e.key === 'ArrowRight' ? step : e.key === 'ArrowLeft' ? -step : 0;
        if (!delta) return;
        e.preventDefault();
        if (which === 'low' && isRange) onChange(Math.min(Math.max(min, low! + delta), high), high);
        else onChange(low, Math.min(max, Math.max(isRange ? low! : min, high + delta)));
      }}
      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white flex items-center justify-center cursor-grab shadow-[0px_0px_1px_rgba(41,47,55,0.3),0px_1px_4px_rgba(79,94,113,0.12),0px_5px_16px_-3px_rgba(79,94,113,0.12),0px_8px_24px_-5px_rgba(79,94,113,0.1)]"
      style={{ left: `${pct(value)}%` }}
    >
      <span className="w-2 h-2 rounded-full bg-[#114BFF]" />
    </span>
  );

  return (
    <div className="px-3 py-2">
      <div ref={trackRef} onClick={onTrackClick} className="relative h-6 cursor-pointer">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-[#ADB8CD]" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 bg-[#114BFF]"
          style={{ left: `${isRange ? pct(low!) : 0}%`, width: `${pct(high) - (isRange ? pct(low!) : 0)}%` }}
        />
        {isRange && handle('low', low!)}
        {handle('high', high)}
      </div>
    </div>
  );
};
