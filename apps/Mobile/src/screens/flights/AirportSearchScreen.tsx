import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { ArrowLeft, MapPin, Plane } from 'lucide-react-native';
import { useAirportsMobile } from '@workspace/ui';
import { groupAirportsByCity, getRecentAirports, addRecentAirport, primeAirportCache, toAirport, type Airport } from '../../data/airports';
import { styles } from './AirportSearchScreen.styles';

interface AirportSearchScreenProps {
  title: string;
  onSelect: (airport: Airport) => void;
  onBack: () => void;
}

// Search box typing shouldn't fire a request per keystroke — wait for a
// short pause before hitting the backend.
const SEARCH_DEBOUNCE_MS = 300;

export const AirportSearchScreen: React.FC<AirportSearchScreenProps> = ({ title, onSelect, onBack }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const recentAirports = getRecentAirports();

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
    onSelect(airport);
  };

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

      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
        placeholder="City or airport code"
        placeholderTextColor="#9CA3AF"
        autoFocus
      />

      <ScrollView keyboardShouldPersistTaps="handled">
        {query.trim().length === 0 && (
          <>
            <TouchableOpacity style={styles.nearbyRow}>
              <MapPin size={18} color="#7C1AEE" strokeWidth={2} />
              <Text style={styles.nearbyText}>Find airport near you</Text>
            </TouchableOpacity>

            {recentAirports.length > 0 && (
              <>
                <Text style={styles.sectionHeading}>Recent Searches</Text>
                <View style={styles.recentChipsRow}>
                  {recentAirports.map((airport) => (
                    <TouchableOpacity
                      key={airport.code}
                      style={styles.recentChip}
                      onPress={() => handleSelect(airport)}
                    >
                      <Text style={styles.recentChipText}>{airport.city}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={styles.divider} />
          </>
        )}

        {query.trim().length > 0 && trimmedLength < 2 && (
          <Text style={styles.emptyText}>Keep typing to search airports.</Text>
        )}

        {trimmedLength >= 2 && isLoading && (
          <ActivityIndicator style={{ marginTop: 24 }} color="#7C1AEE" />
        )}

        {trimmedLength >= 2 && !isLoading && cityGroups.length === 0 && (
          <Text style={styles.emptyText}>No matches found.</Text>
        )}

        {cityGroups.map((group) => (
          <View key={group.city} style={styles.cityGroup}>
            <View style={styles.cityHeaderRow}>
              <MapPin size={16} color="#4C5973" strokeWidth={2} />
              <Text style={styles.cityHeaderText}>
                {group.city}, {group.country}
              </Text>
            </View>
            {group.airports.map((airport) => (
              <TouchableOpacity
                key={airport.code}
                style={styles.airportRow}
                onPress={() => handleSelect(airport)}
              >
                <View style={styles.airportRowLeft}>
                  <Plane size={16} color="#7C8CAD" strokeWidth={2} />
                  <Text style={styles.airportName}>{airport.name}</Text>
                </View>
                <Text style={styles.airportCode}>{airport.code}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
