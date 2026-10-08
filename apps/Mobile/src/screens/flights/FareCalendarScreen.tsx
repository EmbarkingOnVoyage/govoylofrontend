import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useFareCalendarMobile, useHolidaysMobile, type FareCalendarDay, type Holiday } from '@workspace/ui';
import { styles } from './FareCalendarScreen.styles';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const INITIAL_MONTHS = 12;
const MONTHS_PER_PAGE = 12;

interface MonthKey {
  year: number;
  month: number;
}

interface FareCalendarScreenProps {
  title: string;
  footerLabel: string;
  // Existing selected date
  initialDate: string | null;

  // Used only for Round Trip
  initialReturnDate?: string | null;
  minDate?: Date;

  origin?: string;
  destination?: string;

  // single = One Way / Multi City
  // range = Round Trip
  selectionMode?: 'single' | 'range';

  onConfirm: (departureDate: Date, returnDate?: Date) => void;

  onBack: () => void;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toLocalIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function buildMonthGrid(year: number,month: number): (Date | null)[][] {
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

function formatHolidayNote(holiday: Holiday): string {
  // holiday.date arrives as "YYYY-MM-DDT00:00:00" with no timezone suffix,
  // which the Date constructor parses as local midnight on that calendar
  // day — so formatting with the default (local) timezone below is correct;
  // explicitly forcing UTC here would shift it back a day in any
  // positive-UTC-offset zone (India included).
  const [year, month, day] = holiday.date.slice(0, 10).split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayMonth = `${String(d.getDate()).padStart(2, '0')} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
  return `${dayMonth} : ${holiday.name}`;
}

function monthsFrom(earliest: Date, count: number): MonthKey[] {
  return Array.from({ length: count }, (_, offset) => {
    const d = new Date(earliest.getFullYear(), earliest.getMonth() + offset, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
}

type PriceTier = 'cheap' | 'mid' | 'high';

//Prices are colored by tertile of the days actually returned for that month
// (green / orange / red, as in Figma), rather than a hardcoded rupee
// threshold — a short domestic route and a long international one have
// wildly different price scales, so a fixed cutoff would mislabel one of them.
function buildPriceTierLookup(days: FareCalendarDay[]): Map<string, PriceTier> {
  const sorted = [...days].sort((a, b) => a.amount - b.amount);
  const at = (q: number) => (sorted.length > 0 ? sorted[Math.floor((sorted.length - 1) * q)].amount : 0);
  const lowCut = at(1 / 3);
  const highCut = at(2 / 3);
  const tiers = new Map<string, PriceTier>();
  for (const day of days) {
    tiers.set(day.date.slice(0, 10), day.amount <= lowCut ? 'cheap' : day.amount <= highCut ? 'mid' : 'high');
  }
  return tiers;
}

const PRICE_TIER_STYLE = {
  cheap: styles.priceTextCheap,
  mid: styles.priceTextMid,
  high: styles.priceTextHigh,
};

function formatPrice(amount: number): string {
  return Math.round(amount).toLocaleString('en-IN');
}

interface MonthBlockProps {
  year: number;
  month: number;
  earliest: Date;
  selected: Date | null;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  selectingReturn: boolean;
  selectionMode: 'single' | 'range';
  origin?: string;
  destination?: string;
  onSelectDay: (date: Date) => void;
}

const MonthBlock: React.FC<MonthBlockProps> = ({
  year,
  month,
  earliest,
  selected,
  rangeStart,
  rangeEnd,
  selectingReturn,
  selectionMode,
  origin,
  destination,
  onSelectDay,
}) => {
  const canFetchPrices = !!origin && !!destination;
  const { data } = useFareCalendarMobile(
    canFetchPrices ? { origin: origin!, destination: destination!, month: month + 1, year } : null
  );
  const { data: holidaysData } = useHolidaysMobile(year);

  const priceByDay = useMemo(() => {
    const map = new Map<string, FareCalendarDay>();
    for (const day of data?.days ?? []) {
      map.set(day.date.slice(0, 10), day);
    }
    return map;
  }, [data]);

  const tierByDay = useMemo(() => buildPriceTierLookup(data?.days ?? []), [data]);

  const holidayByDay = useMemo(() => {
    const map = new Map<string, Holiday>();
    for (const h of holidaysData?.holidays ?? []) {
      map.set(h.date.slice(0, 10), h);
    }
    return map;
  }, [holidaysData]);

  const monthHolidays = useMemo(
    () => (holidaysData?.holidays ?? []).filter((h) => Number(h.date.slice(5, 7)) - 1 === month),
    [holidaysData, month]
  );


  const isDateInRange = (date: Date) => {
    if (!rangeStart || !rangeEnd) {
      return false;
    }

    return (
      date > rangeStart &&
      date < rangeEnd
    );
  };

  return (
    <View style={styles.monthBlock}>
      <View style={styles.monthHeadingRow}>
        <View style={styles.monthHeadingLine} />
        <Text style={styles.monthHeading}>
          {MONTH_NAMES[month].toUpperCase()} {year}
        </Text>
        {monthHolidays.length > 0 && (
          <View style={styles.holidayCountBadge}>
            <Text style={styles.holidayCountBadgeText}>
              {monthHolidays.length} HOLIDAY{monthHolidays.length > 1 ? 'S' : ''}
            </Text>
          </View>
        )}
        <View style={styles.monthHeadingLine} />
      </View>

{buildMonthGrid(year, month).map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((date, di) => {
            if (!date) return <View key={di} style={styles.dayCell} />;
            const isPast = date < earliest;
            // const isSelected = !!selected && isSameDay(date, selected);
            const isSelected = !!selected && isSameDay(date, selected);
            const isRangeStart = !!rangeStart && isSameDay(date, rangeStart);
            const isRangeEnd = !!rangeEnd && isSameDay(date, rangeEnd);
            const isInRange = isDateInRange(date);
            const iso = toLocalIsoDate(date);
            const holiday = holidayByDay.get(iso);
            const priceDay = priceByDay.get(iso);
            const tier = tierByDay.get(iso) ?? 'cheap';
            return (
              <TouchableOpacity
                key={di}
                // style={[
                //   styles.dayCell,
                //   isSelected && styles.dayCellSelected,
                //   isPast && styles.dayCellDisabled,
                // ]}
                style={[
                  styles.dayCell,
                  isInRange && styles.dayCellInRange,
                  isRangeStart && styles.dayCellRangeStart,
                  isRangeEnd && styles.dayCellRangeEnd,
                  isSelected && styles.dayCellSelected,
                  isPast && styles.dayCellDisabled,
                ]}
                disabled={isPast}
                onPress={() => onSelectDay(date)}
              >
                <View style={styles.dayNumberRow}>
                  <Text style={[styles.dayText, isPast && styles.dayTextDisabled, isSelected && styles.dayTextSelected]}>
                    {date.getDate()}
                  </Text>
                  {!!holiday && <View style={[styles.holidayDot, isSelected && styles.holidayDotSelected]} />}
                </View>
                {!!priceDay && !isPast && (
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.priceText,
                      PRICE_TIER_STYLE[tier],
                      isSelected && styles.priceTextSelected,
                    ]}
                  >
                    {formatPrice(priceDay.amount)}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}


      {monthHolidays.length > 0 && (
        <View style={styles.holidayNotesBlock}>
          {monthHolidays.map((h) => (
            <View key={`${h.date}-${h.name}`} style={styles.holidayNoteRow}>
              <View style={styles.holidayNoteBullet} />
              <Text style={styles.holidayNoteText}>{formatHolidayNote(h)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export const FareCalendarScreen: React.FC<FareCalendarScreenProps> = ({
  title,
  footerLabel,
  initialDate,
  initialReturnDate,
  minDate,
  origin,
  destination,
  selectionMode = 'single',
  onConfirm,
  onBack,
}) => {
  const [selected, setSelected] = useState<Date | null>(initialDate ? new Date(initialDate) : null);
  const [departureDate, setDepartureDate] = useState<Date | null>(
  initialDate ? startOfDay(new Date(initialDate)) : null
);

const [returnDate, setReturnDate] = useState<Date | null>(
  initialReturnDate ? startOfDay(new Date(initialReturnDate)) : null
);

const [selectingReturn, setSelectingReturn] = useState(
  !!initialDate && !initialReturnDate
);

  const [monthCount, setMonthCount] = useState(INITIAL_MONTHS);

  const today = startOfDay(new Date());

  const baseEarliest = minDate
    ? startOfDay(minDate)
    : today;

  /*
   * For Round Trip:
   * after departure is selected, dates before
   * or equal to departure become unavailable.
   */
  const earliest =
    selectionMode === 'range' &&
    selectingReturn &&
    departureDate
      ? departureDate
      : baseEarliest;

  const months = useMemo(() => monthsFrom(earliest, monthCount), [earliest.getTime(), monthCount]);

  const formatDate = (
    date: Date | null
  ) => {
    if (!date) {
      return '';
    }

    return `${date.toLocaleDateString(
      'en-US',
      {
        weekday: 'short',
      }
    )}, ${date.getDate()} ${MONTH_NAMES[
      date.getMonth()
    ].slice(0, 3)}`;
  };

  const formattedSelected =
    selectionMode === 'range'
      ? departureDate && returnDate
        ? `${formatDate(
            departureDate
          )} → ${formatDate(returnDate)}`
        : departureDate
        ? `${formatDate(
            departureDate
          )} → Select return`
        : 'Select departure'
      : selected
      ? formatDate(selected)
      : 'Select a date';

  const handleSelectDay = (
    date: Date
  ) => {
    const selectedDate =
      startOfDay(date);

    /*
     * SINGLE DATE MODE
     * Used by One Way and Multi City.
     */
    if (selectionMode === 'single') {
      setSelected(selectedDate);
      return;
    }

    /*
     * RANGE MODE
     * First click = departure
     * Second click = return
     */
    if (
      !departureDate ||
      !selectingReturn
    ) {
      setDepartureDate(selectedDate);
      setReturnDate(null);
      setSelectingReturn(true);
      return;
    }

    /*
     * If somehow a date before/equal to departure
     * is selected, start a new departure selection.
     */
    if (
      selectedDate <= departureDate
    ) {
      setDepartureDate(selectedDate);
      setReturnDate(null);
      setSelectingReturn(true);
      return;
    }

    /*
     * Second valid selection = return.
     */
    setReturnDate(selectedDate);
    setSelectingReturn(false);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView>
        <View style={styles.grabber} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={24} color="#182339" strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      </SafeAreaView>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((w, i) => (
          <View key={i} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{w}</Text>
          </View>
        ))}
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={months}
        keyExtractor={(item) => `${item.year}-${item.month}`}
        onEndReachedThreshold={1}
        onEndReached={() => setMonthCount((c) => c + MONTHS_PER_PAGE)}
        renderItem={({ item: { year, month } }) => (
          <MonthBlock
            year={year}
            month={month}
            earliest={earliest}
            selected={selectionMode === 'single'
                ? selected
                : null
            }
            rangeStart={
              selectionMode === 'range'
                ? departureDate
                : null
            }
            rangeEnd={selectionMode === 'range'
                ? returnDate
                : null
            }
            selectingReturn={selectingReturn}
            selectionMode={selectionMode}
            origin={origin} destination={destination} onSelectDay={handleSelectDay}
          />
        )}
      />

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>
            {footerLabel}
          </Text>

          <Text style={styles.footerValue}>
            {formattedSelected}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.confirmButton,

            selectionMode === 'range'
              ? (!departureDate ||
                  !returnDate) &&
                styles.confirmButtonDisabled
              : !selected &&
                styles.confirmButtonDisabled,
          ]}
          disabled={
            selectionMode === 'range'
              ? !departureDate ||
                !returnDate
              : !selected
          }
          onPress={() => {
            if (selectionMode === 'range') {
              if (
                departureDate &&
                returnDate
              ) {
                onConfirm(
                  departureDate,
                  returnDate
                );
              }

              return;
            }

            if (selected) {
              onConfirm(selected);
            }
          }}
        >
          <Text
            style={styles.confirmButtonText}
          >
            Confirm
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};