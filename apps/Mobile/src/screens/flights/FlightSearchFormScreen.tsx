import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Switch } from 'react-native';
import { ArrowLeft, ArrowLeftRight, X } from 'lucide-react-native';
import {
  useSearchFlightsMobile,
  type TripType,
  type CabinClass,
  type FlightSearchSegment,
  type FlightOffer,
} from '@workspace/ui';
import { AirportSearchScreen } from './AirportSearchScreen';
import { FareCalendarScreen } from './FareCalendarScreen';
import { TravellersClassScreen } from './TravellersClassScreen';
import type { Airport } from '../../data/airports';
import { styles } from './FlightSearchFormScreen.styles';

interface MultiCitySegment {
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
  { key: 'RoundTrip', label: 'Round trip' },
  { key: 'OneWay', label: 'One way' },
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

interface FlightSearchFormScreenProps {
  onBack: () => void;
  onResults: (offers: FlightOffer[]) => void;
}

export const FlightSearchFormScreen: React.FC<FlightSearchFormScreenProps> = ({ onBack, onResults }) => {
  const searchFlights = useSearchFlightsMobile();

  const [subScreen, setSubScreen] = useState<SubScreen>({ type: 'form' });
  const [tripType, setTripType] = useState<TripType>('RoundTrip');

  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const [multiCitySegments, setMultiCitySegments] = useState<MultiCitySegment[]>([
    { origin: null, destination: null, date: '' },
    { origin: null, destination: null, date: '' },
  ]);

  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);
  const [cabinClass, setCabinClass] = useState<CabinClass>('Economy');

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
    setMultiCitySegments((prev) => (prev.length > 2 ? prev.filter((_, i) => i !== index) : prev));
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
      }
    }

    try {
      const response = await searchFlights.mutateAsync({
        tripType,
        cabinClass,
        segments,
        adultCount,
        childCount,
        infantCount,
      });
      onResults(response.offers);
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
    const minDate = subScreen.field === 'return' ? parseDisplayDateLocal(departureDate) ?? undefined : undefined;

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

  return (
    <View style={styles.screen}>
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={22} color="#182339" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerPills}>
            <View style={styles.pillActive}>
              <Text style={styles.pillActiveText}>Flights</Text>
            </View>
            <View style={styles.pillInactive}>
              <Text style={styles.pillInactiveText}>Voylo AI</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.card}>
          <View style={styles.tabRow}>
            {TRIP_TYPE_TABS.map((tab) => {
              const isActive = tripType === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  onPress={() => setTripType(tab.key)}
                >
                  <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.cardBody}>
            {tripType !== 'MultiCity' ? (
              <>
                <View style={styles.odRow}>
                  <View style={styles.odField}>
                    <Text style={styles.odLabel}>{origin ? `From - ${origin.code}` : 'From'}</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setSubScreen({ type: 'airportSearch', field: 'origin', segmentIndex: null })}
                    >
                      <Text style={origin ? styles.odValue : styles.odPlaceholder}>
                        {origin ? `${origin.city} (${origin.code})` : 'Origin'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
                    <ArrowLeftRight size={16} color="#7C1AEE" strokeWidth={2} />
                  </TouchableOpacity>
                  <View style={styles.odField}>
                    <Text style={styles.odLabel}>{destination ? `To - ${destination.code}` : 'To'}</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setSubScreen({ type: 'airportSearch', field: 'destination', segmentIndex: null })}
                    >
                      <Text style={destination ? styles.odValue : styles.odPlaceholder}>
                        {destination ? `${destination.city} (${destination.code})` : 'Destination'}
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
                  {tripType === 'RoundTrip' && (
                    <View style={styles.dateField}>
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
                  )}
                </View>
              </>
            ) : (
              <>
                {multiCitySegments.map((seg, index) => (
                  <View key={index} style={styles.segmentCard}>
                    <View style={styles.segmentHeaderRow}>
                      <Text style={styles.segmentTag}>Flight {index + 1}</Text>
                      {multiCitySegments.length > 2 && (
                        <TouchableOpacity onPress={() => removeMultiCitySegment(index)}>
                          <X size={18} color="#7C8CAD" strokeWidth={2} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.odRow}>
                      <View style={styles.odField}>
                        <Text style={styles.odLabel}>{seg.origin ? `From - ${seg.origin.code}` : 'From'}</Text>
                        <TouchableOpacity
                          style={styles.input}
                          onPress={() => setSubScreen({ type: 'airportSearch', field: 'origin', segmentIndex: index })}
                        >
                          <Text style={seg.origin ? styles.odValue : styles.odPlaceholder}>
                            {seg.origin ? `${seg.origin.city} (${seg.origin.code})` : 'Origin'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity style={styles.swapButton} onPress={() => swapMultiCitySegment(index)}>
                        <ArrowLeftRight size={16} color="#7C1AEE" strokeWidth={2} />
                      </TouchableOpacity>
                      <View style={styles.odField}>
                        <Text style={styles.odLabel}>{seg.destination ? `To - ${seg.destination.code}` : 'To'}</Text>
                        <TouchableOpacity
                          style={styles.input}
                          onPress={() =>
                            setSubScreen({ type: 'airportSearch', field: 'destination', segmentIndex: index })
                          }
                        >
                          <Text style={seg.destination ? styles.odValue : styles.odPlaceholder}>
                            {seg.destination ? `${seg.destination.city} (${seg.destination.code})` : 'Destination'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.odLabel}>Departure</Text>
                      <TouchableOpacity
                        style={styles.input}
                        onPress={() => setSubScreen({ type: 'calendar', field: 'departure', segmentIndex: index })}
                      >
                        <Text style={seg.date ? styles.odValue : styles.odPlaceholder}>{seg.date || 'DD/MM/YYYY'}</Text>
                      </TouchableOpacity>
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
              <Text style={styles.nonStopLabel}>Non stop flight only</Text>
              <Switch
                value={nonStopOnly}
                onValueChange={setNonStopOnly}
                trackColor={{ true: '#7C1AEE', false: '#ADB8CD' }}
                thumbColor="#FFFFFF"
              />
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
        </View>
      </ScrollView>
    </View>
  );
};
