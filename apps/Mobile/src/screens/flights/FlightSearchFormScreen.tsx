import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Switch, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowLeftRight, X } from 'lucide-react-native';
import {
  useSearchFlightsMobile,
  type TripType,
  type CabinClass,
  type FlightSearchSegment,
  type FlightOffer,
  type FlightSearchSummary,
} from '@workspace/ui';
import { AirportSearchScreen } from './AirportSearchScreen';
import { FareCalendarScreen } from './FareCalendarScreen';
import { TravellersClassScreen } from './TravellersClassScreen';
import type { Airport } from '../../data/airports';
import { styles } from './FlightSearchFormScreen.styles';

// Exported so the results screen's "edit" overlay (FlightResultsScreen's
// toFormInitialValues) can build a compatible list to prefill this form's
// multi-city rows with the search that's currently showing.
export interface MultiCitySegment {
  origin: Airport | null;
  destination: Airport | null;
  date: string;
}

const CABIN_CLASS_LABELS: Record<CabinClass, string> = {
  Economy: 'Economy',
  PremiumEconomy: 'Premium Economy',
  Business: 'Business',
  First: 'First',
};

const TRIP_TYPE_TABS: { key: TripType; label: string }[] = [
  { key: 'OneWay', label: 'One way' },
  { key: 'RoundTrip', label: 'Round trip' },
  { key: 'MultiCity', label: 'Multi city' },
];

function formatDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

// Parses DD/MM/YYYY into an ISO string built at UTC midnight so the calendar
// day survives the round trip regardless of the device's timezone offset.
function parseDisplayDate(display: string): string | null {
  const match = display.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

function parseDisplayDateLocal(display: string): Date | null {
  const match = display.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

type SubScreen =
  | { type: 'form' }
  | { type: 'airportSearch'; field: 'origin' | 'destination'; segmentIndex: number | null }
  | { type: 'calendar'; field: 'departure' | 'return'; segmentIndex: number | null }
  | { type: 'travellers' };

// Lets the results screen's "edit" overlay reopen this form pre-filled with the
// search that's currently showing, instead of a blank form — display-format
// dates (DD/MM/YYYY) since that's what the form's own date fields use internally.
export interface FlightSearchFormInitialValues {
  tripType: TripType;
  origin: Airport;
  destination: Airport;
  departureDate: string;
  returnDate?: string;
  // Only meaningful when tripType is 'MultiCity' — the single origin/
  // destination/departureDate above are that case's placeholder-only fields
  // (the form ignores them once tripType is 'MultiCity' and reads this
  // instead), one entry per route the search had.
  multiCitySegments?: MultiCitySegment[];
  adultCount: number;
  childCount: number;
  infantCount: number;
  cabinClass: CabinClass;
}

interface FlightSearchFormScreenProps {
  onBack: () => void;
  onResults: (offers: FlightOffer[], summary: FlightSearchSummary) => void;
  initialValues?: FlightSearchFormInitialValues;
  // 'screen' (default): fills the device height, as when opened from Home.
  // 'overlay': sized to its content with rounded bottom corners, matching
  // Figma's "Round Trip" popup — for use inside a Modal over another screen.
  variant?: 'screen' | 'overlay';
}

export const FlightSearchFormScreen: React.FC<FlightSearchFormScreenProps> = ({
  onBack,
  onResults,
  initialValues,
  variant = 'screen',
}) => {
  const searchFlights = useSearchFlightsMobile();

  const [subScreen, setSubScreen] = useState<SubScreen>({ type: 'form' });
  const [tripType, setTripType] = useState<TripType>(initialValues?.tripType ?? 'OneWay');

  const [origin, setOrigin] = useState<Airport | null>(initialValues?.origin ?? null);
  const [destination, setDestination] = useState<Airport | null>(initialValues?.destination ?? null);
  const [departureDate, setDepartureDate] = useState(initialValues?.departureDate ?? '');
  const [returnDate, setReturnDate] = useState(initialValues?.returnDate ?? '');

  const [multiCitySegments, setMultiCitySegments] = useState<MultiCitySegment[]>(
    initialValues?.multiCitySegments ?? [
      { origin: null, destination: null, date: '' },
      { origin: null, destination: null, date: '' },
    ]
  );

  const [adultCount, setAdultCount] = useState(initialValues?.adultCount ?? 1);
  const [childCount, setChildCount] = useState(initialValues?.childCount ?? 0);
  const [infantCount, setInfantCount] = useState(initialValues?.infantCount ?? 0);
  const [cabinClass, setCabinClass] = useState<CabinClass>(initialValues?.cabinClass ?? 'Economy');

  const [selectedFare, setSelectedFare] = useState<'Student' | 'SeniorCitizen' | null>(null);
  const [nonStopOnly, setNonStopOnly] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSwap = () => {
    const prevOrigin = origin;
    setOrigin(destination);
    setDestination(prevOrigin);
  };

  const updateMultiCitySegment = (index: number, patch: Partial<MultiCitySegment>) => {
    setMultiCitySegments((prev) => prev.map((seg, i) => (i === index ? { ...seg, ...patch } : seg)));
  };

  const swapMultiCitySegment = (index: number) => {
    setMultiCitySegments((prev) =>
      prev.map((seg, i) => (i === index ? { ...seg, origin: seg.destination, destination: seg.origin } : seg))
    );
  };

  const addMultiCitySegment = () => {
    if (multiCitySegments.length >= 5) return;
    setMultiCitySegments((prev) => [...prev, { origin: null, destination: null, date: '' }]);
  };

  const removeMultiCitySegment = (index: number) => {
    setMultiCitySegments((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const passengerSummary = `${adultCount} Adult${adultCount > 1 ? 's' : ''}${
    childCount > 0 ? `, ${childCount} Child${childCount > 1 ? 'ren' : ''}` : ''
  }${infantCount > 0 ? `, ${infantCount} Infant${infantCount > 1 ? 's' : ''}` : ''}, ${
    CABIN_CLASS_LABELS[cabinClass]
  }`;

  const handleSearch = async () => {
    setFormError('');

    const segments: FlightSearchSegment[] = [];

    if (tripType === 'MultiCity') {
      for (const seg of multiCitySegments) {
        const travelDate = parseDisplayDate(seg.date);
        if (!seg.origin || !seg.destination || !travelDate) {
          setFormError('Please fill in origin, destination and date for every flight.');
          return;
        }
        segments.push({ origin: seg.origin.code, destination: seg.destination.code, travelDate });
      }
    } else {
      const departure = parseDisplayDate(departureDate);
      if (!origin || !destination || !departure) {
        setFormError('Please fill in origin, destination and departure date.');
        return;
      }
      segments.push({ origin: origin.code, destination: destination.code, travelDate: departure });

      if (tripType === 'RoundTrip') {
        const returnTravelDate = parseDisplayDate(returnDate);
        if (!returnTravelDate) {
          setFormError('Please select a return date.');
          return;
        }
        segments.push({ origin: destination.code, destination: origin.code, travelDate: returnTravelDate });
      } else {
        // One-way: return date is optional. If the user added one anyway
        // (the "Add for discount" nudge), fold it in as a return leg.
        const returnTravelDate = parseDisplayDate(returnDate);
        if (returnTravelDate) {
          segments.push({ origin: destination.code, destination: origin.code, travelDate: returnTravelDate });
        }
      }
    }

    const request = {
      tripType,
      cabinClass,
      segments,
      adultCount,
      childCount,
      infantCount,
    };

    try {
      const response = await searchFlights.mutateAsync(request);

      const summary: FlightSearchSummary = {
        request,
        originCode: segments[0].origin,
        destinationCode: segments[0].destination,
        departureDate: segments[0].travelDate,
        returnDate: segments[1]?.travelDate,
        passengerCount: adultCount + childCount + infantCount,
        cabinClass,
      };

      onResults(response.offers, summary);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to search flights.');
    }
  };

  // --- Sub-screen navigation (full pages, matching Figma — not modals) ---

  if (subScreen.type === 'airportSearch') {
    return (
      <AirportSearchScreen
        title={subScreen.field === 'origin' ? 'Origin of city/airport code' : 'Destination city/airport code'}
        onBack={() => setSubScreen({ type: 'form' })}
        onSelect={(airport) => {
          if (subScreen.segmentIndex !== null) {
            updateMultiCitySegment(subScreen.segmentIndex, { [subScreen.field]: airport } as Partial<MultiCitySegment>);
          } else if (subScreen.field === 'origin') {
            setOrigin(airport);
          } else {
            setDestination(airport);
          }
          setSubScreen({ type: 'form' });
        }}
      />
    );
  }

  if (subScreen.type === 'calendar') {
    const segIndex = subScreen.segmentIndex;
    const currentOrigin = segIndex !== null ? multiCitySegments[segIndex].origin : origin;
    const currentDestination = segIndex !== null ? multiCitySegments[segIndex].destination : destination;
    const currentValue = segIndex !== null ? multiCitySegments[segIndex].date : subScreen.field === 'departure' ? departureDate : returnDate;
    // Each multi-city leg must depart on or after the previous leg's date —
    // round-trip's return leg has the same constraint against its departure.
    const minDate =
      segIndex !== null && segIndex > 0
        ? parseDisplayDateLocal(multiCitySegments[segIndex - 1].date) ?? undefined
        : subScreen.field === 'return'
        ? parseDisplayDateLocal(departureDate) ?? undefined
        : undefined;

    return (
      <FareCalendarScreen
        title={
          currentOrigin && currentDestination
            ? `${currentOrigin.city} → ${currentDestination.city}`
            : subScreen.field === 'departure'
            ? 'Departure date'
            : 'Return date'
        }
        footerLabel={subScreen.field === 'departure' ? 'Departure date' : 'Return date'}
        initialDate={parseDisplayDate(currentValue)}
        minDate={minDate}
        origin={currentOrigin?.code}
        destination={currentDestination?.code}
        onBack={() => setSubScreen({ type: 'form' })}
        onConfirm={(date) => {
          const formatted = formatDisplayDate(date);
          if (segIndex !== null) {
            updateMultiCitySegment(segIndex, { date: formatted });
          } else if (subScreen.field === 'departure') {
            setDepartureDate(formatted);
          } else {
            setReturnDate(formatted);
            // Adding a return date is what makes this a round trip — the "Add
            // for discount" nudge on the One way tab shouldn't leave the tab
            // saying "One way" once it stops being one.
            if (tripType === 'OneWay') {
              setTripType('RoundTrip');
            }
          }
          setSubScreen({ type: 'form' });
        }}
      />
    );
  }

  if (subScreen.type === 'travellers') {
    return (
      <TravellersClassScreen
        adultCount={adultCount}
        childCount={childCount}
        infantCount={infantCount}
        cabinClass={cabinClass}
        onBack={() => setSubScreen({ type: 'form' })}
        onConfirm={(values) => {
          setAdultCount(values.adultCount);
          setChildCount(values.childCount);
          setInfantCount(values.infantCount);
          setCabinClass(values.cabinClass);
          setSubScreen({ type: 'form' });
        }}
      />
    );
  }

  // --- Main form ---

  const isOverlay = variant === 'overlay';

  const formContent = (
    <>
      <LinearGradient
        colors={['rgba(11,19,237,0.8)', 'rgba(211,178,250,0.3)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientWrap}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <ArrowLeft size={22} color="#182339" strokeWidth={2} />
            </TouchableOpacity>
            <LinearGradient
              colors={['#9335FF', '#5731FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pillGroupBorder}
            >
              <View style={styles.pillGroupInner}>
                <LinearGradient
                  colors={['#9335FF', '#5731FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.pillActive}
                >
                  <Text style={styles.pillActiveText}>Flights</Text>
                </LinearGradient>
                <View style={styles.pillInactive}>
                  <Text style={styles.pillInactiveText}>Voylo AI</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </SafeAreaView>

        <View style={styles.tabBarWrap}>
          {TRIP_TYPE_TABS.map((tab) => {
            const isActive = tripType === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => {
                  // A leftover return date from the round-trip nudge would
                  // silently turn a "One way" search back into a round trip
                  // one at submit time (see handleSearch) — clearing it here
                  // keeps the tab and the request in agreement.
                  if (tab.key === 'OneWay') {
                    setReturnDate('');
                  }
                  setTripType(tab.key);
                }}
              >
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.contentWrap}>
          {tripType !== 'MultiCity' ? (
            <View style={styles.fieldsGroup}>
              <View style={styles.odRow}>
                <View style={styles.odField}>
                  <Text style={styles.odLabel}>{origin ? `From - ${origin.code}` : 'From'}</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setSubScreen({ type: 'airportSearch', field: 'origin', segmentIndex: null })}
                  >
                    <Text style={origin ? styles.odValue : styles.odPlaceholder}>
                      {origin ? origin.city : 'Origin'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
                  <ArrowLeftRight size={16} color="#7C1AEE" strokeWidth={2} />
                </TouchableOpacity>
                <View style={[styles.odField, styles.odFieldEnd]}>
                  <Text style={styles.odLabel}>{destination ? `To - ${destination.code}` : 'To'}</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setSubScreen({ type: 'airportSearch', field: 'destination', segmentIndex: null })}
                  >
                    <Text style={destination ? styles.odValue : styles.odPlaceholder}>
                      {destination ? destination.city : 'Destination'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <Text style={styles.odLabel}>Departure</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setSubScreen({ type: 'calendar', field: 'departure', segmentIndex: null })}
                  >
                    <Text style={departureDate ? styles.odValue : styles.odPlaceholder}>
                      {departureDate || 'DD/MM/YYYY'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.dateField, styles.odFieldEnd]}>
                  <Text style={styles.odLabel}>Return</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setSubScreen({ type: 'calendar', field: 'return', segmentIndex: null })}
                  >
                    <Text style={returnDate ? styles.odValue : styles.odPlaceholder}>
                      {returnDate || 'Add for discount'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <>
                {multiCitySegments.map((seg, index) => (
                  <View key={index} style={styles.segmentCard}>
                    <View style={styles.odRow}>
                      <View style={styles.odField}>
                        <Text style={styles.odLabel}>{seg.origin ? `From - ${seg.origin.code}` : 'From'}</Text>
                        <TouchableOpacity
                          style={styles.input}
                          onPress={() => setSubScreen({ type: 'airportSearch', field: 'origin', segmentIndex: index })}
                        >
                          <Text style={seg.origin ? styles.odValue : styles.odPlaceholder}>
                            {seg.origin ? seg.origin.city : 'Origin'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity style={styles.swapButton} onPress={() => swapMultiCitySegment(index)}>
                        <ArrowLeftRight size={16} color="#7C1AEE" strokeWidth={2} />
                      </TouchableOpacity>
                      <View style={[styles.odField, styles.odFieldEnd]}>
                        <Text style={styles.odLabel}>{seg.destination ? `To - ${seg.destination.code}` : 'To'}</Text>
                        <TouchableOpacity
                          style={styles.input}
                          onPress={() =>
                            setSubScreen({ type: 'airportSearch', field: 'destination', segmentIndex: index })
                          }
                        >
                          <Text style={seg.destination ? styles.odValue : styles.odPlaceholder}>
                            {seg.destination ? seg.destination.city : 'Destination'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.odLabel}>Departure</Text>
                      <View style={styles.multiCityDateRow}>
                        <TouchableOpacity
                          style={[styles.input, styles.multiCityDateInput]}
                          onPress={() => setSubScreen({ type: 'calendar', field: 'departure', segmentIndex: index })}
                        >
                          <Text style={seg.date ? styles.odValue : styles.odPlaceholder}>
                            {seg.date || 'DD/MM/YYYY'}
                          </Text>
                        </TouchableOpacity>
                        <View style={styles.flightTag}>
                          <Text style={styles.flightTagText}>Flight {index + 1}</Text>
                          {multiCitySegments.length > 1 && (
                            <TouchableOpacity
                              onPress={() => removeMultiCitySegment(index)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <X size={14} color="#6014B7" strokeWidth={2} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                ))}

                {multiCitySegments.length < 5 && (
                  <TouchableOpacity style={styles.addFlightButton} onPress={addMultiCitySegment}>
                    <Text style={styles.addFlightText}>Add Flight</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            <TouchableOpacity style={styles.passengerRow} onPress={() => setSubScreen({ type: 'travellers' })}>
              <Text style={styles.passengerRowText}>{passengerSummary}</Text>
            </TouchableOpacity>

            <Text style={styles.sectionHeading}>Special Fares (Optional)</Text>
            <View style={styles.fareRow}>
              <TouchableOpacity
                style={[styles.fareButton, selectedFare === 'Student' && styles.fareButtonSelected]}
                onPress={() => setSelectedFare(selectedFare === 'Student' ? null : 'Student')}
              >
                <Text style={[styles.fareButtonText, selectedFare === 'Student' && styles.fareButtonTextSelected]}>
                  Student
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fareButton, selectedFare === 'SeniorCitizen' && styles.fareButtonSelected]}
                onPress={() => setSelectedFare(selectedFare === 'SeniorCitizen' ? null : 'SeniorCitizen')}
              >
                <Text
                  style={[styles.fareButtonText, selectedFare === 'SeniorCitizen' && styles.fareButtonTextSelected]}
                >
                  Senior Citizen
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.nonStopRow}>
              <Switch
                value={nonStopOnly}
                onValueChange={setNonStopOnly}
                trackColor={{ true: '#7C1AEE', false: '#ADB8CD' }}
                thumbColor="#FFFFFF"
              />
              <Text style={styles.nonStopLabel}>Non stop flight only</Text>
            </View>

            <TouchableOpacity
              style={[styles.searchButton, searchFlights.isPending && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={searchFlights.isPending}
            >
              <Text style={styles.searchButtonText}>{searchFlights.isPending ? 'Searching...' : 'Search'}</Text>
            </TouchableOpacity>

            {!!formError && <Text style={styles.errorText}>{formError}</Text>}
        </View>
      </LinearGradient>
    </>
  );

  if (isOverlay) {
    // A percentage/maxHeight-only View has no concrete height for a flex:1
    // ScrollView to fill — Yoga collapses it to 0 (invisible overlay, only
    // the backdrop showed). A real pixel cap on the ScrollView itself avoids
    // that and reliably caps + scrolls regardless of ancestor sizing.
    const overlayMaxHeight = Dimensions.get('window').height * 0.85;
    return (
      <View style={styles.overlayContainer}>
        <ScrollView style={{ maxHeight: overlayMaxHeight }} contentContainerStyle={{ paddingBottom: 32 }}>
          {formContent}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>{formContent}</ScrollView>
    </View>
  );
};
