import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { ArrowDownUp, ArrowLeft, MapPin, Plane, Trash2, X } from 'lucide-react-native';
import { useAirportsMobile } from '@workspace/ui';
import {
  groupAirportsByCity,
  getRecentAirports,
  addRecentAirport,
  clearRecentAirports,
  primeAirportCache,
  toAirport,
  type Airport,
} from '../../data/airports';
import { styles } from './AirportSearchScreen.styles';
import { useHardwareBack } from '../../navigation/useHardwareBack';

export type AirportField = 'origin' | 'destination';

interface AirportSearchScreenProps {
  field: AirportField;
  origin: Airport | null;
  destination: Airport | null;
  onSelect: (airport: Airport, field: AirportField) => void;
  onBack: () => void;
}

const PLACEHOLDERS: Record<AirportField, string> = {
  origin: 'Origin of city/airport code',
  destination: 'Destination city/airport code',
};

// Search box typing shouldn't fire a request per keystroke — wait for a
// short pause before hitting the backend.
const SEARCH_DEBOUNCE_MS = 300;

const airportLabel = (airport: Airport | null) => (airport ? `${airport.city}, ${airport.country}` : '');

// Figma "ROUND TRIP no border" airport picker: a lavender card holding the
// origin (top) and destination (bottom) rows. The row being edited is a text
// input; the swap button moves the cursor to the other row.
export const AirportSearchScreen: React.FC<AirportSearchScreenProps> = ({
  field: initialField,
  origin,
  destination,
  onSelect,
  onBack,
}) => {
  useHardwareBack(() => onBack());

  const [field, setField] = useState<AirportField>(initialField);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recentAirports, setRecentAirports] = useState(getRecentAirports());

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useAirportsMobile(debouncedQuery);

  useEffect(() => {
    if (results) {
      primeAirportCache(results);
    }
  }, [results]);

  const airports = (results ?? []).map(toAirport);
  const cityGroups = groupAirportsByCity(airports);
  const trimmedLength = debouncedQuery.trim().length;

  const handleSelect = (airport: Airport) => {
    addRecentAirport(airport);
    onSelect(airport, field);
  };

  const switchField = () => {
    setField(field === 'origin' ? 'destination' : 'origin');
    setQuery('');
  };

  const renderRow = (rowField: AirportField) => {
    if (rowField === field) {
      return (
        <TextInput
          key={rowField}
          style={styles.cardInput}
          value={query}
          onChangeText={setQuery}
          placeholder={PLACEHOLDERS[rowField]}
          placeholderTextColor="#697691"
          autoFocus
        />
      );
    }
    const value = airportLabel(rowField === 'origin' ? origin : destination);
    return (
      <TouchableOpacity key={rowField} style={styles.cardRow} onPress={switchField} activeOpacity={0.7}>
        <Text style={value ? styles.cardValue : styles.cardPlaceholder} numberOfLines={1}>
          {value || PLACEHOLDERS[rowField]}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView>
        <View style={styles.grabber} />
        <View style={styles.card}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={20} color="#040B1F" strokeWidth={1.2} />
          </TouchableOpacity>
          <View>
            {renderRow('origin')}
            <View style={styles.cardDivider} />
            {renderRow('destination')}
          </View>
          <TouchableOpacity style={styles.swapButton} onPress={switchField}>
            <ArrowDownUp size={16} color="#182339" strokeWidth={1.5} />
          </TouchableOpacity>
          {/* Figma puts the close button beside the row that already has a value. */}
          <TouchableOpacity
            style={[styles.clearButton, field === 'origin' && styles.clearButtonBottom]}
            onPress={() => (query ? setQuery('') : onBack())}
          >
            <X size={16} color="#182339" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
        {query.trim().length === 0 &&
          (recentAirports.length > 0 ? (
            <>
              <Text style={styles.sectionHeading}>Recent Searches</Text>
              <View style={styles.recentRow}>
                <View style={styles.recentChipsRow}>
                  {recentAirports.map((airport) => (
                    <TouchableOpacity key={airport.code} style={styles.recentChip} onPress={() => handleSelect(airport)}>
                      <Text style={styles.recentChipText}>{airport.city}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    clearRecentAirports();
                    setRecentAirports([]);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={22} color="#182339" strokeWidth={1.5} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity style={styles.nearbyRow}>
              <MapPin size={20} color="#182339" strokeWidth={1.5} />
              <View>
                <Text style={styles.nearbyTitle}>Nearby</Text>
                <Text style={styles.nearbySubtitle}>Find Airport near you</Text>
              </View>
            </TouchableOpacity>
          ))}

        {query.trim().length > 0 && trimmedLength < 2 && (
          <Text style={styles.emptyText}>Keep typing to search airports.</Text>
        )}

        {trimmedLength >= 2 && isLoading && <ActivityIndicator style={{ marginTop: 24 }} color="#7C1AEE" />}

        {trimmedLength >= 2 && !isLoading && cityGroups.length === 0 && (
          <Text style={styles.emptyText}>No matches found.</Text>
        )}

        {cityGroups.map((group) => (
          <View key={group.city} style={styles.cityGroup}>
            <View style={styles.cityHeaderRow}>
              <MapPin size={20} color="#182339" strokeWidth={1.5} />
              <View style={styles.cityHeaderText}>
                <Text style={styles.cityName}>
                  {group.city}, {group.country}
                </Text>
                {!!group.state && <Text style={styles.cityRegion}>{group.state}, {group.country}</Text>}
              </View>
            </View>
            {group.airports.map((airport) => (
              <TouchableOpacity key={airport.code} style={styles.airportRow} onPress={() => handleSelect(airport)}>
                <Plane size={20} color="#182339" strokeWidth={1.5} />
                <Text style={styles.airportName}>{airport.name}</Text>
                <Text style={styles.airportCode}>{airport.code}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
