import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFareCalendarWeb } from './useFareCalendarWeb';
import { useHolidaysWeb } from './useHolidaysWeb';
import type { FareCalendarDay } from './useFareCalendarMobile';
import type { Holiday } from './useHolidaysMobile';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date | null, b: Date): boolean {
  return !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function buildMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = mondayIndex(firstDay);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// Keys the day-cell lookups (price-by-day, holiday-by-day) by the cell's own
// local calendar date. date.toISOString() would convert through UTC first,
// which silently shifts the date backward a day for any positive UTC
// offset (India included) — this keeps everything anchored to the date the
// user actually sees on screen.
function toLocalIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatHolidayNote(holiday: Holiday): string {
  // holiday.date arrives as "YYYY-MM-DDT00:00:00" with no timezone suffix —
  // parse the date parts directly rather than through the Date constructor
  // (which would apply local-time parsing rules) to avoid any ambiguity.
  const [year, month, day] = holiday.date.slice(0, 10).split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayMonth = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  return `${dayMonth}: ${holiday.name}`;
}

function buildCheapLookup(days: FareCalendarDay[]): Map<string, boolean> {
  const sorted = [...days].sort((a, b) => a.amount - b.amount);
  const medianAmount = sorted.length > 0 ? sorted[Math.floor((sorted.length - 1) / 2)].amount : 0;
  const isCheap = new Map<string, boolean>();
  for (const day of days) {
    isCheap.set(day.date.slice(0, 10), day.amount <= medianAmount);
  }
  return isCheap;
}

function formatPrice(amount: number): string {
  return Math.round(amount).toLocaleString('en-IN');
}

interface MonthPanelProps {
  year: number;
  month: number;
  earliest: Date;
  selected: Date | null;
  origin?: string;
  destination?: string;
  onSelectDay: (date: Date) => void;
}

const MonthPanel: React.FC<MonthPanelProps> = ({ year, month, earliest, selected, origin, destination, onSelectDay }) => {
  const canFetch = !!origin && !!destination;
  const { data } = useFareCalendarWeb(canFetch ? { origin: origin!, destination: destination!, month: month + 1, year } : null);
  const { data: holidaysData } = useHolidaysWeb(year);

  const priceByDay = useMemo(() => {
    const map = new Map<string, FareCalendarDay>();
    for (const day of data?.days ?? []) map.set(day.date.slice(0, 10), day);
    return map;
  }, [data]);
  const cheapByDay = useMemo(() => buildCheapLookup(data?.days ?? []), [data]);

  const holidayByDay = useMemo(() => {
    const map = new Map<string, Holiday>();
    for (const h of holidaysData?.holidays ?? []) map.set(h.date.slice(0, 10), h);
    return map;
  }, [holidaysData]);

  const monthHolidays = useMemo(
    () => (holidaysData?.holidays ?? []).filter((h) => Number(h.date.slice(5, 7)) - 1 === month),
    [holidaysData, month]
  );

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px bg-[#ECEEF3]" />
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-[#182339] tracking-wide">
            {MONTH_NAMES[month].toUpperCase()} {year}
          </span>
          {monthHolidays.length > 0 && (
            <span className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.5 rounded">
              {monthHolidays.length} HOLIDAY{monthHolidays.length > 1 ? 'S' : ''}
            </span>
          )}
        </div>
        <div className="flex-1 h-px bg-[#ECEEF3]" />
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-[11px] font-bold text-[#7C8CAD] py-1">
            {w}
          </div>
        ))}
      </div>

      {buildMonthGrid(year, month).map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((date, di) => {
            if (!date) return <div key={di} className="h-14" />;
            const isPast = date < earliest;
            const isSelected = isSameDay(selected, date);
            const iso = toLocalIsoDate(date);
            const holiday = holidayByDay.get(iso);
            const priceDay = priceByDay.get(iso);
            const isCheap = cheapByDay.get(iso);
            return (
              <button
                key={di}
                type="button"
                disabled={isPast}
                onClick={() => onSelectDay(date)}
                className={[
                  'h-14 m-0.5 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors',
                  isPast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-[#F3E9FE]',
                  isSelected ? 'bg-[#7C1AEE]' : '',
                ].join(' ')}
              >
                <span className="flex items-center gap-1">
                  <span className={['text-sm font-medium', isSelected ? 'text-white font-bold' : 'text-[#182339]'].join(' ')}>
                    {date.getDate()}
                  </span>
                  {!!holiday && (
                    <span className={['w-1 h-1 rounded-full', isSelected ? 'bg-white' : 'bg-[#16A34A]'].join(' ')} />
                  )}
                </span>
                {!!priceDay && (
                  <span
                    className={[
                      'text-[10px] font-semibold leading-none',
                      isSelected ? 'text-white' : isCheap ? 'text-[#16A34A]' : 'text-[#D97706]',
                    ].join(' ')}
                  >
                    {formatPrice(priceDay.amount)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}

      {monthHolidays.length > 0 && (
        <div className="mt-2 space-y-1">
          {monthHolidays.map((h) => (
            <p key={h.date} className="text-xs text-[#4C5973]">
              {formatHolidayNote(h)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export interface FareCalendarDropdownProps {
  footerLabel: string;
  initialDate: string | null;
  minDate?: Date;
  origin?: string;
  destination?: string;
  showAddReturnLink?: boolean;
  onAddReturnDate?: () => void;
  onConfirm: (date: Date) => void;
}

export const FareCalendarDropdown: React.FC<FareCalendarDropdownProps> = ({
  footerLabel,
  initialDate,
  minDate,
  origin,
  destination,
  showAddReturnLink,
  onAddReturnDate,
  onConfirm,
}) => {
  const [selected, setSelected] = React.useState<Date | null>(initialDate ? new Date(initialDate) : null);
  // How many month-pairs forward from the earliest allowed month the user has
  // paged — there's no upper bound, so the calendar is never "capped" the way
  // a fixed date-range picker would be; the user can keep clicking the right
  // arrow indefinitely, same as mobile's infinite-scroll month list.
  const [pairOffset, setPairOffset] = React.useState(0);

  const today = startOfDay(new Date());
  const earliest = minDate ? startOfDay(minDate) : today;
  const base = new Date(earliest.getFullYear(), earliest.getMonth() + pairOffset * 2, 1);
  const next = new Date(earliest.getFullYear(), earliest.getMonth() + pairOffset * 2 + 1, 1);

  const formattedSelected = selected
    ? selected.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
    : 'Select a date';

  return (
    <div className="w-[808px] max-w-[95vw] bg-white rounded-2xl shadow-xl border border-[#ECEEF3] p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setPairOffset((o) => Math.max(0, o - 1))}
          disabled={pairOffset === 0}
          className="w-8 h-8 rounded-full border border-[#ADB8CD] flex items-center justify-center disabled:opacity-30"
          aria-label="Previous months"
        >
          <ChevronLeft size={16} color="#182339" />
        </button>
        <span className="text-[15px] font-bold text-[#182339]">Select travel dates</span>
        <button
          type="button"
          onClick={() => setPairOffset((o) => o + 1)}
          className="w-8 h-8 rounded-full border border-[#ADB8CD] flex items-center justify-center"
          aria-label="Next months"
        >
          <ChevronRight size={16} color="#182339" />
        </button>
      </div>

      <div className="flex gap-8">
        <MonthPanel
          year={base.getFullYear()}
          month={base.getMonth()}
          earliest={earliest}
          selected={selected}
          origin={origin}
          destination={destination}
          onSelectDay={setSelected}
        />
        <MonthPanel
          year={next.getFullYear()}
          month={next.getMonth()}
          earliest={earliest}
          selected={selected}
          origin={origin}
          destination={destination}
          onSelectDay={setSelected}
        />
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#ECEEF3]">
        <div>
          <p className="text-xs text-[#7C8CAD]">{footerLabel}</p>
          <p className="text-[15px] font-bold text-[#182339] mt-0.5">{formattedSelected}</p>
        </div>
        {!!showAddReturnLink && !!onAddReturnDate && (
          <div className="text-right">
            <p className="text-xs text-[#7C8CAD]">Save more on round trip</p>
            <button
              type="button"
              onClick={onAddReturnDate}
              className="text-[#7C1AEE] text-sm font-semibold hover:underline"
            >
              + Return date
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={!selected}
        onClick={() => selected && onConfirm(selected)}
        className={[
          'w-full h-12 mt-4 rounded-full text-white font-semibold text-base transition-colors',
          selected ? 'bg-[#7C1AEE] hover:bg-[#6B15D1]' : 'bg-[#CEAAFF] cursor-not-allowed',
        ].join(' ')}
      >
        Confirm
      </button>
    </div>
  );
};
