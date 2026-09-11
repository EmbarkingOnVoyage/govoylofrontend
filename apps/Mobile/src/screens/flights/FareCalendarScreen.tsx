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

// How many months are on screen initially, and how many more get appended
// each time the user scrolls near the bottom — the list keeps growing as far
// as the user scrolls, rather than stopping at some fixed date far out.
const INITIAL_MONTHS = 12;
const MONTHS_PER_PAGE = 12;

interface MonthKey {
  year: number;
  month: number;
}

interface FareCalendarScreenProps {
  title: string;
  footerLabel: string;
  initialDate: string | null;
  minDate?: Date;
  origin?: string;
  destination?: string;
  onConfirm: (date: Date) => void;
  onBack: () => void;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Keys the day-cell lookups (price-by-day, holiday-by-day) by the cell's own
// local calendar date. date.toISOString() would convert through UTC first,
// which silently shifts the date backward a day for any positive UTC
// offset (India included) — this keeps everything anchored to the date the
// user actually sees on screen.
function toLocalIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Monday-first weekday index (0 = Monday .. 6 = Sunday), matching Figma's M-S header order.
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

function formatHolidayNote(holiday: Holiday): string {
  // holiday.date arrives as "YYYY-MM-DDT00:00:00" with no timezone suffix,
  // which the Date constructor parses as local midnight on that calendar
  // day — so formatting with the default (local) timezone below is correct;
  // explicitly forcing UTC here would shift it back a day in any
  // positive-UTC-offset zone (India included).
  const [year, month, day] = holiday.date.slice(0, 10).split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayMonth = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  return `${dayMonth}: ${holiday.name}`;
}

function monthsFrom(earliest: Date, count: number): MonthKey[] {
  return Array.from({ length: count }, (_, offset) => {
    const d = new Date(earliest.getFullYear(), earliest.getMonth() + offset, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
}

// Prices are colored relative to the cheapest half of the days actually
// returned for that month, rather than a hardcoded rupee threshold — a
// short domestic route and a long international one have wildly different
// price scales, so a fixed cutoff would mislabel one of them as all-cheap
// or all-expensive.
function buildPriceColorLookup(days: FareCalendarDay[]): Map<string, boolean> {
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

interface MonthBlockProps {
  year: number;
  month: number;
  earliest: Date;
  selected: Date | null;
  origin?: string;
  destination?: string;
  onSelectDay: (date: Date) => void;
}

const MonthBlock: React.FC<MonthBlockProps> = ({
  year,
  month,
  earliest,
  selected,
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

  const cheapByDay = useMemo(() => buildPriceColorLookup(data?.days ?? []), [data]);

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

  return (
    <View style={styles.monthBlock}>
      <View style={styles.monthHeadingRow}>
        <Text style={styles.monthHeading}>
          {MONTH_NAMES[month].toUpperCase()} {year}
        </Text>
        {monthHolidays.length > 0 && (
          <Text style={styles.holidayCountBadge}>
            {monthHolidays.length} HOLIDAY{monthHolidays.length > 1 ? 'S' : ''}
          </Text>
        )}
      </View>
      {buildMonthGrid(year, month).map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((date, di) => {
            if (!date) return <View key={di} style={styles.dayCell} />;
            const isPast = date < earliest;
            const isSelected = !!selected && isSameDay(date, selected);
            const iso = toLocalIsoDate(date);
            const holiday = holidayByDay.get(iso);
            const priceDay = priceByDay.get(iso);
            const isCheap = cheapByDay.get(iso);
            return (
              <TouchableOpacity
                key={di}
                style={[
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                  isPast && styles.dayCellDisabled,
                ]}
                disabled={isPast}
                onPress={() => onSelectDay(date)}
              >
                <View style={styles.dayNumberRow}>
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{date.getDate()}</Text>
                  {!!holiday && <View style={[styles.holidayDot, isSelected && styles.holidayDotSelected]} />}
                </View>
                {!!priceDay && (
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.priceText,
                      isCheap ? styles.priceTextCheap : styles.priceTextRegular,
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
            <Text key={h.date} style={styles.holidayNoteText}>
              {formatHolidayNote(h)}
            </Text>
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
  minDate,
  origin,
  destination,
  onConfirm,
  onBack,
}) => {
  const [selected, setSelected] = useState<Date | null>(initialDate ? new Date(initialDate) : null);
  const [monthCount, setMonthCount] = useState(INITIAL_MONTHS);

  const today = startOfDay(new Date());
  const earliest = minDate ? startOfDay(minDate) : today;

  const months = useMemo(() => monthsFrom(earliest, monthCount), [earliest.getTime(), monthCount]);

  const formattedSelected = selected
    ? selected.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
    : 'Select a date';

  return (
    <View style={styles.screen}>
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={22} color="#182339" strokeWidth={2} />
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
            selected={selected}
            origin={origin}
            destination={destination}
            onSelectDay={setSelected}
          />
        )}
      />

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>{footerLabel}</Text>
          <Text style={styles.footerValue}>{formattedSelected}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.confirmButton, !selected && styles.confirmButtonDisabled]}
        disabled={!selected}
        onPress={() => selected && onConfirm(selected)}
      >
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};
