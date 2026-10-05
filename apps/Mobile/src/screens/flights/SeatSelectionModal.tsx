import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView, ActivityIndicator } from 'react-native';
import { ArrowLeft, ArrowRight, X } from 'lucide-react-native';
import { SSR_STATUS_AVAILABLE, type AncillaryOption, type SeatMapSegment } from '@workspace/ui';
import { styles } from './SeatSelectionModal.styles';

export interface SeatTraveler {
  id: string;
  firstName: string;
  lastName: string;
}

// A traveller's seat on one flight segment of the leg.
export interface SeatPick {
  segmentIndex: number;
  travelerId: string;
  seat: AncillaryOption;
}

function pickKey(segmentIndex: number, travelerId: string): string {
  return `${segmentIndex}:${travelerId}`;
}

function formatPrice(amount: number, currencyCode: string): string {
  return `${currencyCode === 'INR' ? '₹' : currencyCode + ' '}${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
}

// "12A" → { row: 12, letter: 'A' }. Positions from the supplier win when present.
function seatLabelParts(seat: AncillaryOption): { row: number | null; letter: string } {
  const match = /^(\d+)\s*([A-Z]+)$/i.exec(seat.ssrTypeDesc.trim());
  return {
    row: seat.seatRow ?? (match ? Number(match[1]) : null),
    letter: match ? match[2].toUpperCase() : seat.ssrTypeDesc,
  };
}

// Flyshop lays rows out itself and marks the aisle with placeholder entries
// (status 0); Tripjack gives each seat a column, and a skipped column is the aisle.
const SSR_STATUS_AISLE = 0;

type RowCell = { kind: 'seat'; seat: AncillaryOption } | { kind: 'rowNumber' } | { kind: 'gap' };

function layoutRow(seats: AncillaryOption[]): RowCell[] {
  const cells: RowCell[] = [];
  let rowNumberPlaced = false;
  const placeAisle = () => {
    cells.push(rowNumberPlaced ? { kind: 'gap' } : { kind: 'rowNumber' });
    rowNumberPlaced = true;
  };

  const positioned = seats.every((s) => s.seatColumn != null);
  if (positioned) {
    const sorted = [...seats].sort((a, b) => (a.seatColumn ?? 0) - (b.seatColumn ?? 0));
    sorted.forEach((seat, i) => {
      if (i > 0 && (seat.seatColumn ?? 0) - (sorted[i - 1].seatColumn ?? 0) > 1) placeAisle();
      cells.push({ kind: 'seat', seat });
    });
  } else {
    seats.forEach((seat) => {
      if (seat.ssrStatus === SSR_STATUS_AISLE) {
        placeAisle();
      } else {
        cells.push({ kind: 'seat', seat });
      }
    });
  }

  // No aisle reported (e.g. a single block of seats): row number in the middle.
  if (!rowNumberPlaced) {
    cells.splice(Math.ceil(cells.length / 2), 0, { kind: 'rowNumber' });
  }
  return cells;
}

interface SeatSection {
  heading: string;
  rows: { rowNumber: number | null; seats: AncillaryOption[]; exitRow: boolean }[];
}

// Consecutive rows with the same legroom and price band share a heading,
// e.g. "Extra leg room · ₹1,500" then "Standard · ₹550 - ₹650".
function buildSections(segment: SeatMapSegment | undefined, currencyCode: string): SeatSection[] {
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
              ? formatPrice(min, currencyCode)
              : `${formatPrice(min, currencyCode)} - ${formatPrice(max, currencyCode)}`;
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

interface SeatSelectionModalProps {
  visible: boolean;
  origin: string;
  destination: string;
  // This leg's seat maps — one per flight segment.
  segments: SeatMapSegment[];
  isLoading: boolean;
  loadError: boolean;
  // Infants sit on a lap and don't get a seat, so they aren't passed in.
  travelers: SeatTraveler[];
  initialPicks: SeatPick[];
  currencyCode: string;
  onSave: (picks: SeatPick[]) => void;
  onClose: () => void;
}

export const SeatSelectionModal: React.FC<SeatSelectionModalProps> = ({
  visible,
  origin,
  destination,
  segments,
  isLoading,
  loadError,
  travelers,
  initialPicks,
  currencyCode,
  onSave,
  onClose,
}) => {
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [activeTravelerId, setActiveTravelerId] = useState(travelers[0]?.id ?? '');
  const [picks, setPicks] = useState<Record<string, AncillaryOption>>({});

  // Start from what was saved before each time the modal opens.
  useEffect(() => {
    if (!visible) return;
    const initial: Record<string, AncillaryOption> = {};
    initialPicks.forEach((p) => (initial[pickKey(p.segmentIndex, p.travelerId)] = p.seat));
    setPicks(initial);
    setSegmentIndex(0);
    setActiveTravelerId(travelers[0]?.id ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const segment = segments[segmentIndex];
  const sections = useMemo(() => buildSections(segment, currencyCode), [segment, currencyCode]);

  // Which traveller (if any) holds each seat on the current segment.
  const holderBySeatKey = useMemo(() => {
    const map = new Map<string, string>();
    travelers.forEach((t) => {
      const seat = picks[pickKey(segmentIndex, t.id)];
      if (seat) map.set(seat.ssrKey, t.id);
    });
    return map;
  }, [picks, segmentIndex, travelers]);

  const total = Object.values(picks).reduce((sum, seat) => sum + seat.totalAmount, 0);

  const handleSeatPress = (seat: AncillaryOption) => {
    const holder = holderBySeatKey.get(seat.ssrKey);
    if (holder && holder !== activeTravelerId) {
      // Someone else's seat: switch to them rather than taking it.
      setActiveTravelerId(holder);
      return;
    }
    const key = pickKey(segmentIndex, activeTravelerId);
    const next = { ...picks };
    if (holder === activeTravelerId) {
      delete next[key];
    } else {
      next[key] = seat;
    }
    setPicks(next);

    // Move on to the next traveller still without a seat on this segment.
    if (holder !== activeTravelerId) {
      const start = travelers.findIndex((t) => t.id === activeTravelerId);
      const nextTraveler = [...travelers.slice(start + 1), ...travelers.slice(0, start)].find(
        (t) => !next[pickKey(segmentIndex, t.id)]
      );
      if (nextTraveler) setActiveTravelerId(nextTraveler.id);
    }
  };

  const handleSave = () => {
    onSave(
      Object.entries(picks).map(([key, seat]) => {
        const [segment, ...rest] = key.split(':');
        return { segmentIndex: Number(segment), travelerId: rest.join(':'), seat };
      })
    );
  };

  const renderSeat = (seat: AncillaryOption) => {
    const { letter } = seatLabelParts(seat);
    const available = seat.ssrStatus === SSR_STATUS_AVAILABLE;
    const holder = holderBySeatKey.get(seat.ssrKey);
    if (!available && !holder) {
      return (
        <View key={seat.ssrKey} style={[styles.seat, styles.seatUnavailable]}>
          <X size={14} color="#9AA3B2" strokeWidth={2} />
        </View>
      );
    }
    const mine = holder === activeTravelerId;
    const taken = !!holder && !mine;
    return (
      <TouchableOpacity
        key={seat.ssrKey}
        style={[
          styles.seat,
          seat.isExtraLegroom ? styles.seatLegroom : styles.seatAvailable,
          taken && styles.seatTaken,
          mine && styles.seatSelected,
        ]}
        onPress={() => handleSeatPress(seat)}
        activeOpacity={0.7}
      >
        {seat.isExtraLegroom && !mine && !taken && <View style={styles.legroomDot} />}
        <Text
          style={[
            styles.seatText,
            seat.isExtraLegroom && styles.seatTextLegroom,
            (mine || taken) && styles.seatTextSelected,
          ]}
        >
          {taken ? travelers.find((t) => t.id === holder)?.firstName.charAt(0).toUpperCase() : letter}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ArrowLeft size={22} color="#182339" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>Seat selection</Text>
            <Text style={styles.subtitle}>
              {segment?.origin ?? origin} → {segment?.destination ?? destination}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {segments.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentTabs}>
            {segments.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.segmentChip, i === segmentIndex && styles.segmentChipActive]}
                onPress={() => setSegmentIndex(i)}
              >
                <Text style={[styles.segmentChipText, i === segmentIndex && styles.segmentChipTextActive]}>
                  {s.origin && s.destination ? `${s.origin} → ${s.destination}` : `Flight ${i + 1}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.travelerTabs}>
          {travelers.map((t) => {
            const active = t.id === activeTravelerId;
            const seat = picks[pickKey(segmentIndex, t.id)];
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.travelerTab, active && styles.travelerTabActive]}
                onPress={() => setActiveTravelerId(t.id)}
              >
                <Text style={[styles.travelerTabName, active && styles.travelerTabNameActive]}>{t.firstName}</Text>
                <Text style={seat ? styles.travelerTabSeat : styles.travelerTabRandom}>
                  {seat ? seat.ssrTypeDesc : 'Random'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSeat, styles.seatAvailable]}>
              <Text style={styles.seatText}>A</Text>
            </View>
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSeat, styles.seatLegroom]}>
              <View style={styles.legroomDot} />
              <Text style={[styles.seatText, styles.seatTextLegroom]}>A</Text>
            </View>
            <Text style={styles.legendText}>Extra legroom</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSeat, styles.seatUnavailable]}>
              <X size={12} color="#9AA3B2" strokeWidth={2} />
            </View>
            <Text style={styles.legendText}>Unavailable</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color="#7C1AEE" style={styles.stateBox} />
        ) : loadError ? (
          <Text style={[styles.stateBox, styles.stateText]}>Couldn't load the seat map right now. Please try again.</Text>
        ) : sections.length === 0 ? (
          <Text style={[styles.stateBox, styles.stateText]}>
            Seat selection isn't available for this flight. A seat will be assigned at check-in.
          </Text>
        ) : (
          <ScrollView contentContainerStyle={styles.mapContent}>
            {sections.map((section, sectionIndex) => (
              <View key={sectionIndex}>
                <View style={styles.sectionHeadingRow}>
                  <View style={styles.sectionLine} />
                  <Text style={styles.sectionHeading}>{section.heading}</Text>
                  <View style={styles.sectionLine} />
                </View>
                {section.rows.map((row, rowIndex) => (
                  <View key={`${sectionIndex}-${rowIndex}`} style={styles.seatRow}>
                    <View style={styles.exitSlot}>
                      {row.exitRow && <ArrowLeft size={14} color="#697691" strokeWidth={2} />}
                    </View>
                    {layoutRow(row.seats).map((cell, cellIndex) =>
                      cell.kind === 'seat' ? (
                        renderSeat(cell.seat)
                      ) : (
                        <View key={`c${cellIndex}`} style={styles.aisle}>
                          {cell.kind === 'rowNumber' && <Text style={styles.rowNumber}>{row.rowNumber ?? ''}</Text>}
                        </View>
                      )
                    )}
                    <View style={styles.exitSlot}>
                      {row.exitRow && <ArrowRight size={14} color="#697691" strokeWidth={2} />}
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.footer}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total, currencyCode)}</Text>
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
