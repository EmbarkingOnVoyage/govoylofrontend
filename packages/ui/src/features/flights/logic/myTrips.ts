import { formatPrice } from './flightResults';
import type { TripBooking, TripBookingDetails, TripBookingSegment } from '../useMyTripsMobile';

// The supplier's status at booking time: 11-Success (ticketed), 22-Failed,
// 33-Block (hold), 44-paid with the ticket still being issued.
export const STATUS_ID_FAILED = '22';
export const STATUS_ID_HELD = '33';
export const STATUS_ID_TICKETING = '44';
export const STATUS_ID_TICKETED = '11';

// Why there's no e-ticket to download yet, or null when there is one.
export function eTicketUnavailableReason(booking: TripBooking): string | null {
  if (booking.statusId === STATUS_ID_TICKETED) return null;
  if (booking.statusId === STATUS_ID_HELD) return 'This booking is on hold. Your e-ticket will be ready once it is paid for and ticketed.';
  if (booking.statusId === STATUS_ID_TICKETING) return 'The airline is still issuing your ticket. Please try again in a little while.';
  return 'There is no e-ticket for this booking.';
}

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

// Same rules as every other price in the app (paise only when there are any).
export function formatCurrency(amount: number, currencyCode: string): string {
  return formatPrice(amount, currencyCode);
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
  // A return trip booked as one combined fare is stored as a single leg from
  // and back to the same airport; the turnaround city isn't stored.
  if (first.origin === last.destination) {
    return `${first.origin} · Round trip`;
  }
  return `${first.origin} → ${last.destination}`;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// A booking is upcoming until its last flying leg's date has passed. A hold
// that was never ticketed before then didn't fly, so it counts as cancelled.
export function tripTab(booking: TripBooking): TripTab {
  if (booking.localStatus !== 'Active' || booking.statusId === STATUS_ID_FAILED) {
    return 'Cancelled';
  }
  if (booking.statusId === STATUS_ID_HELD && isPast(booking)) {
    return 'Cancelled';
  }
  return isPast(booking) ? 'Completed' : 'Upcoming';
}

export function isExpiredHold(booking: TripBooking): boolean {
  return booking.localStatus === 'Active' && booking.statusId === STATUS_ID_HELD && isPast(booking);
}

function isPast(booking: TripBooking): boolean {
  const flying = booking.legs.filter((leg) => !leg.isCancelled);
  const lastDate = flying
    .map((leg) => parseLocal(leg.travelDate))
    .filter((d): d is Date => !!d)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  return !!lastDate && new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()) < startOfToday();
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
  if (isExpiredHold(booking)) {
    return { label: 'Expired', color: '#4C5973', background: '#F1F3F7' };
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

export interface FlightLine {
  key: string;
  legIndex: number;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  title: string;
  meta: string;
}

// One line per leg: the supplier's segments when it answered (times, stops,
// duration), otherwise the booking's own legs (date only).
export function flightLines(details: TripBookingDetails): FlightLine[] {
  const { booking, segments } = details;
  if (segments.length > 0) {
    const byLeg = new Map<number, TripBookingSegment[]>();
    segments.forEach((s) => byLeg.set(s.legIndex, [...(byLeg.get(s.legIndex) ?? []), s]));
    return [...byLeg.entries()]
      .sort(([a], [b]) => a - b)
      .map(([legIndex, segs]) => {
        const first = segs[0];
        const last = segs[segs.length - 1];
        const stops = segs.length - 1;
        // Flying time only: departure/arrival are each airport's local time, so
        // the gap between them isn't a real duration across time zones.
        const duration = formatDuration(segs.reduce((sum, s) => sum + s.durationMinutes, 0));
        return {
          key: `seg-${legIndex}`,
          legIndex,
          airlineCode: first.airlineCode,
          airlineName: first.airlineName,
          flightNumber: segs.map((s) => s.flightNumber).join(', '),
          title: `${first.origin} ${formatTime24(first.departureDateTime)} – ${last.destination} ${formatTime24(
            last.arrivalDateTime
          )}`,
          meta: [formatShortDate(first.departureDateTime), stops === 0 ? 'Non-stop' : `${stops} Stop${stops > 1 ? 's' : ''}`, duration]
            .filter(Boolean)
            .join(' · '),
        };
      });
  }
  return [...booking.legs]
    .sort((a, b) => a.legIndex - b.legIndex)
    .map((leg) => ({
      key: `leg-${leg.legIndex}`,
      legIndex: leg.legIndex,
      airlineCode: leg.airlineCode,
      airlineName: leg.airlineName,
      flightNumber: leg.flightNumber,
      title: `${leg.origin} → ${leg.destination}`,
      meta: formatShortDate(leg.travelDate),
    }));
}
