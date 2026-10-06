// Pure helpers for the baggage / meal / seat pickers (web; the mobile modals
// carry the same rules in their own files).
import { SSR_STATUS_AVAILABLE, type AncillaryOption, type SeatMapSegment } from '../useFlightAncillariesMobile';

function rupees(amount: number, currencyCode: string): string {
  return `${currencyCode === 'INR' ? '₹' : currencyCode + ' '}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

// Suppliers sometimes send a bare number of kilos ("5") for an allowance.
export function baggageText(value: string): string {
  return /^\d+(\.\d+)?$/.test(value.trim()) ? `${value.trim()} kg` : value;
}

// The same option can be offered on every segment of a connecting leg; one
// entry per description and price is enough, cheapest first.
export function uniqueOptions(options: AncillaryOption[]): AncillaryOption[] {
  const seen = new Set<string>();
  return options
    .filter((o) => {
      const key = `${o.ssrTypeDesc}|${o.totalAmount}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.totalAmount - b.totalAmount);
}

// Supplier descriptions vary ("Excess Baggage - 5 Kg", "1 Piece 15 Kg"):
// pieces when sold by the piece, otherwise extra weight.
export function describeBaggage(option: AncillaryOption): { pieces: number | null; weight: string } {
  const desc = option.ssrTypeDesc;
  const kg = /(\d+(?:\.\d+)?)\s*kg/i.exec(desc);
  const pieces = /(\d+)\s*(?:pieces?|pcs?|bags?)\b/i.exec(desc);
  return { pieces: pieces ? Number(pieces[1]) : null, weight: kg ? `${kg[1]} kg` : desc };
}

// Airlines return named meals, not a veg flag, so classify by name and code.
// Non-veg is checked first so "Non Veg" isn't read as veg.
const NON_VEG_PATTERN = /non[\s-]?veg|chicken|mutton|lamb|fish|prawn|seafood|egg|meat|beef|pork|NVML|MOML|SFML/i;
const VEG_PATTERN = /\bveg|paneer|vegetarian|vegan|VGML|AVML|VLML|VJML|VOML|RVML|JNML/i;

export function mealKind(option: AncillaryOption): 'veg' | 'nonveg' | null {
  const text = `${option.ssrTypeDesc} ${option.ssrCode ?? ''}`;
  if (NON_VEG_PATTERN.test(text)) return 'nonveg';
  if (VEG_PATTERN.test(text)) return 'veg';
  return null;
}

// "12A" -> row 12, letter A. Positions from the supplier win when present.
export function seatLabelParts(seat: AncillaryOption): { row: number | null; letter: string } {
  const match = /^(\d+)\s*([A-Z]+)$/i.exec(seat.ssrTypeDesc.trim());
  return {
    row: seat.seatRow ?? (match ? Number(match[1]) : null),
    letter: match ? match[2].toUpperCase() : seat.ssrTypeDesc,
  };
}

// Flyshop marks the aisle with placeholder entries (status 0); Tripjack gives
// each seat a column, and a skipped column is the aisle.
export const SSR_STATUS_AISLE = 0;

export type SeatRowCell = { kind: 'seat'; seat: AncillaryOption } | { kind: 'rowNumber' } | { kind: 'gap' };

export function layoutSeatRow(seats: AncillaryOption[]): SeatRowCell[] {
  const cells: SeatRowCell[] = [];
  let rowNumberPlaced = false;
  const placeAisle = () => {
    cells.push(rowNumberPlaced ? { kind: 'gap' } : { kind: 'rowNumber' });
    rowNumberPlaced = true;
  };

  if (seats.every((s) => s.seatColumn != null)) {
    const sorted = [...seats].sort((a, b) => (a.seatColumn ?? 0) - (b.seatColumn ?? 0));
    sorted.forEach((seat, i) => {
      if (i > 0 && (seat.seatColumn ?? 0) - (sorted[i - 1].seatColumn ?? 0) > 1) placeAisle();
      cells.push({ kind: 'seat', seat });
    });
  } else {
    seats.forEach((seat) => (seat.ssrStatus === SSR_STATUS_AISLE ? placeAisle() : cells.push({ kind: 'seat', seat })));
  }

  // No aisle reported: row number in the middle.
  if (!rowNumberPlaced) cells.splice(Math.ceil(cells.length / 2), 0, { kind: 'rowNumber' });
  return cells;
}

export interface SeatSection {
  heading: string;
  rows: { rowNumber: number | null; seats: AncillaryOption[]; exitRow: boolean }[];
}

// Consecutive rows with the same legroom and price band share a heading,
// e.g. "Extra leg room · ₹1,500" then "Standard · ₹550 - ₹650".
export function buildSeatSections(segment: SeatMapSegment | undefined, currencyCode: string): SeatSection[] {
  const sections: SeatSection[] = [];
  let currentKey = '';
  for (const row of segment?.rows ?? []) {
    const seats = row.seats.filter((s) => s.ssrStatus !== SSR_STATUS_AISLE);
    if (seats.length === 0) continue;
    const prices = seats.filter((s) => s.ssrStatus === SSR_STATUS_AVAILABLE).map((s) => s.totalAmount);
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 0;
    const legroom = seats.some((s) => s.isExtraLegroom);
    const key = `${legroom}|${min}|${max}`;
    if (key !== currentKey) {
      const price =
        prices.length === 0
          ? 'Sold out'
          : max === 0
            ? 'Free'
            : min === max
              ? rupees(min, currencyCode)
              : `${rupees(min, currencyCode)} - ${rupees(max, currencyCode)}`;
      sections.push({ heading: `${legroom ? 'Extra leg room' : 'Standard'} · ${price}`, rows: [] });
      currentKey = key;
    }
    sections[sections.length - 1].rows.push({
      rowNumber: seatLabelParts(seats[0]).row,
      seats: row.seats,
      exitRow: seats.some((s) => s.isExitRow),
    });
  }
  return sections;
}
