import type { TripBooking } from '@workspace/ui';

// The supplier's status at booking time: 11-Success (ticketed), 22-Failed,
// 33-Block (hold), 44-paid with the ticket still being issued.
export const STATUS_ID_FAILED = '22';
export const STATUS_ID_HELD = '33';
export const STATUS_ID_TICKETING = '44';

export type TripTab = 'Upcoming' | 'Completed' | 'Cancelled';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Booking dates come back without a timezone and are the airport's local time,
// so they're read as-is rather than converted.
export function parseLocal(iso: string): Date | null {
  const date = new Date(iso.replace(/Z$/, ''));
  return isNaN(date.getTime()) ? null : date;
}

// "28 Sep 2026"
export function formatDate(iso: string): string {
  const date = parseLocal(iso);
  if (!date) return '';
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// "Fri, 16 Oct"
export function formatShortDate(iso: string): string {
  const date = parseLocal(iso);
  if (!date) return '';
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

// "21:45"
export function formatTime24(iso: string): string {
  const date = parseLocal(iso);
  if (!date) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// "09:45 AM", or '' when the stored date has no time of day.
export function formatTime12(iso: string): string {
  const date = parseLocal(iso);
  if (!date || (date.getHours() === 0 && date.getMinutes() === 0)) return '';
  const hours = date.getHours() % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${
    date.getHours() < 12 ? 'AM' : 'PM'
  }`;
}

export function formatDuration(minutes: number): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function formatCurrency(amount: number, currencyCode: string): string {
  return `${currencyCode === 'INR' ? '₹' : currencyCode + ' '}${Math.round(amount).toLocaleString('en-IN')}`;
}

export function passengerCount(booking: TripBooking): number {
  return booking.passengerNames.split(',').filter((name) => name.trim()).length;
}

// "Mumbai → Dubai" style title from the airport codes; a return trip shows its
// outbound route with a round-trip marker.
export function routeTitle(booking: TripBooking): string {
  const legs = [...booking.legs].sort((a, b) => a.legIndex - b.legIndex);
  const first = legs[0];
  if (!first) return booking.bookingRefNo;
  const last = legs[legs.length - 1];
  if (legs.length > 1 && last.destination === first.origin) {
    return `${first.origin} ⇄ ${first.destination}`;
  }
  return `${first.origin} → ${last.destination}`;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// A booking is upcoming until its last flying leg's date has passed.
export function tripTab(booking: TripBooking): TripTab {
  if (booking.localStatus !== 'Active' || booking.statusId === STATUS_ID_FAILED) {
    return 'Cancelled';
  }
  const flying = booking.legs.filter((leg) => !leg.isCancelled);
  const lastDate = flying
    .map((leg) => parseLocal(leg.travelDate))
    .filter((d): d is Date => !!d)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  if (lastDate && new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()) < startOfToday()) {
    return 'Completed';
  }
  return 'Upcoming';
}

export interface StatusDisplay {
  label: string;
  color: string;
  background: string;
}

export function statusDisplay(booking: TripBooking): StatusDisplay {
  if (booking.localStatus === 'Cancelled') {
    return { label: 'Cancelled', color: '#C8102E', background: '#FDECEE' };
  }
  if (booking.localStatus === 'Released') {
    return { label: 'Released', color: '#4C5973', background: '#F1F3F7' };
  }
  if (booking.statusId === STATUS_ID_FAILED) {
    return { label: 'Failed', color: '#C8102E', background: '#FDECEE' };
  }
  if (booking.statusId === STATUS_ID_HELD) {
    return { label: 'On hold', color: '#B45309', background: '#FEF3C7' };
  }
  if (booking.statusId === STATUS_ID_TICKETING) {
    return { label: 'Ticketing', color: '#1D4ED8', background: '#E6EEFF' };
  }
  if (tripTab(booking) === 'Completed') {
    return { label: 'Completed', color: '#1D4ED8', background: '#E6EEFF' };
  }
  return { label: 'Confirmed', color: '#15803D', background: '#E7F8EE' };
}

// Ticketed (or held) and not yet cancelled — what the Cancel Booking button needs.
export function canCancel(booking: TripBooking): boolean {
  return (
    booking.localStatus === 'Active' &&
    booking.statusId !== STATUS_ID_FAILED &&
    booking.statusId !== STATUS_ID_TICKETING &&
    !!booking.airlinePnr &&
    tripTab(booking) === 'Upcoming'
  );
}

export function matchesSearch(booking: TripBooking, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    booking.bookingRefNo,
    booking.airlinePnr ?? '',
    booking.passengerNames,
    ...booking.legs.flatMap((leg) => [
      leg.origin,
      leg.destination,
      leg.airlineName,
      `${leg.airlineCode} ${leg.flightNumber}`,
      `${leg.airlineCode}${leg.flightNumber}`,
    ]),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export const REFUND_DESTINATION = 'To your original payment method · within 5–7 working days';
