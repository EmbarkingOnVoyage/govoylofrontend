import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { ArrowLeft, MapPin, Plane } from 'lucide-react-native';
import { AIRPORTS, groupAirportsByCity, getRecentAirports, addRecentAirport, type Airport } from '../../data/airports';
import { styles } from './AirportSearchScreen.styles';

interface AirportSearchScreenProps {
  title: string;
  onSelect: (airport: Airport) => void;
  onBack: () => void;
}

export const AirportSearchScreen: React.FC<AirportSearchScreenProps> = ({ title, onSelect, onBack }) => {
  const [query, setQuery] = useState('');
  const recentAirports = getRecentAirports();

  const filtered =
    query.trim().length === 0
      ? AIRPORTS
      : AIRPORTS.filter((airport) => {
          const q = query.trim().toLowerCase();
          return (
            airport.city.toLowerCase().includes(q) ||
            airport.code.toLowerCase().includes(q) ||
            airport.name.toLowerCase().includes(q)
          );
        });

  const cityGroups = groupAirportsByCity(filtered);

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

        {cityGroups.length === 0 && <Text style={styles.emptyText}>No matches found.</Text>}

        {cityGroups.map((group) => (
          <View key={group.city} style={styles.cityGroup}>
            <View style={styles.cityHeaderRow}>
              <MapPin size={16} color="#4C5973" strokeWidth={2} />
              <Text style={styles.cityHeaderText}>
                {group.city}, India
              </Text>
            </View>
            <Text style={styles.cityStateText}>{group.state}, India</Text>
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
