// Pure traveller rules for the booking step, shared by the mobile Traveller
// Details screen and the web traveller page: passenger types by age on the
// travel dates, and GSTIN validation.
import type { Traveler } from '../../profile/useTravellersMobile';

// The saved-traveller API's travelerType values, in the order the booking
// lists passengers (adults first, then children, then infants).
export type PaxType = 'adult' | 'child' | 'infant';
export const PAX_TYPES: PaxType[] = ['adult', 'child', 'infant'];

export const PAX_LABELS: Record<PaxType, { block: string; singular: string; plural: string }> = {
  adult: { block: 'Adult', singular: 'adult', plural: 'adults' },
  child: { block: 'Children', singular: 'child', plural: 'children' },
  infant: { block: 'Infant', singular: 'infant', plural: 'infants' },
};

export function savedPaxType(traveler: Traveler): PaxType {
  const type = traveler.travelerType?.toLowerCase();
  return type === 'child' || type === 'infant' ? type : 'adult';
}

export const PAX_API_TYPES: Record<PaxType, 'Adult' | 'Child' | 'Infant'> = {
  adult: 'Adult',
  child: 'Child',
  infant: 'Infant',
};

// Year/month/day straight from a "YYYY-MM-DD..." string — calendar dates
// with no time zone, same reasoning as formatTravelerDob.
export function calendarDate(iso: string | null | undefined): [number, number, number] | null {
  const match = iso ? /^(\d{4})-(\d{2})-(\d{2})/.exec(iso) : null;
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

export function isBefore(a: [number, number, number], b: [number, number, number]): boolean {
  return a[0] !== b[0] ? a[0] < b[0] : a[1] !== b[1] ? a[1] < b[1] : a[2] < b[2];
}

// Completed years between a date of birth and a travel date.
export function ageOn(dob: [number, number, number], on: [number, number, number]): number {
  const hadBirthday = on[1] > dob[1] || (on[1] === dob[1] && on[2] >= dob[2]);
  return on[0] - dob[0] - (hadBirthday ? 0 : 1);
}

export interface TravelerAgeCheck {
  type: PaxType;
  // Shown under the traveller's name when the travel dates change how they fly.
  note: string;
  // Born after the first flight — can't be booked at all.
  blocked: boolean;
}

// The passenger type a traveller actually flies as, by age on the travel dates
// (the airline checks date of birth against it): an infant must be under 2 on
// every flight, so on the last one; a child is 2–11 and an adult 12+ on the
// first. Without a date of birth the saved type is used as-is.
export function checkTravelerAge(
  traveler: Traveler,
  firstTravelIso: string | undefined,
  lastTravelIso: string | undefined
): TravelerAgeCheck {
  const saved = savedPaxType(traveler);
  const dob = calendarDate(traveler.dateOfBirth);
  const first = calendarDate(firstTravelIso);
  const last = calendarDate(lastTravelIso) ?? first;
  if (!dob || !first || !last) {
    return { type: saved, note: '', blocked: false };
  }
  if (isBefore(first, dob)) {
    return { type: saved, note: 'Date of birth is after the travel date', blocked: true };
  }

  const ageFirst = ageOn(dob, first);
  const ageLast = ageOn(dob, last);
  const type: PaxType = ageLast < 2 ? 'infant' : ageFirst < 12 ? 'child' : 'adult';
  if (type === saved) {
    return { type, note: '', blocked: false };
  }

  const note =
    ageFirst < 2 && type === 'child'
      ? `Turns 2 before ${formatTravelerDob(lastTravelIso)}, so travels as a child`
      : `Travels as ${type === 'adult' ? 'an adult' : `a ${PAX_LABELS[type].singular}`}: age ${ageFirst} on ${formatTravelerDob(firstTravelIso)}`;
  return { type, note, blocked: false };
}

export function paxCountText(type: PaxType, count: number): string {
  return `${count} ${count === 1 ? PAX_LABELS[type].singular : PAX_LABELS[type].plural}`;
}

// 2-digit state code, 10-char PAN, entity number, 'Z', checksum character.
export const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

// A date of birth is a calendar date with no time zone, so it's read straight
// from the "YYYY-MM-DD..." string. Going through Date mixed a local day with
// a UTC month, which put a 1st-of-the-month birthday in the previous month.
export function formatTravelerDob(isoDate: string | null | undefined): string {
  const match = isoDate ? /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate) : null;
  if (!match) return '';
  const [, year, month, day] = match;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[Number(month) - 1];
  return monthName ? `${day} ${monthName} ${year}` : '';
}
