import React from 'react';
import { View, ActivityIndicator, ScrollView, ViewStyle } from 'react-native';
import { useBookings } from '@workspace/api';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export function BookingDashboard() {
  // Execute our repository query hook layer
  const { data: bookings, isLoading, error, refetch } = useBookings();

  const containerStyle: ViewStyle = {
    flex: 1,
    padding: 16,
    backgroundColor: '#F4F4F4',
  };

  const statusBadgeStyle = (status: string): ViewStyle => ({
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: 
      status === 'confirmed' ? '#E3FBE3' : 
      status === 'pending' ? '#FFF3CD' : '#FCE8E6',
  });

  // 1. Asynchronous Handling: Loading State Engine Pass
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0F62FE" />
        <Text variant="body" style={{ marginTop: 8 }}>Loading bookings safely...</Text>
      </View>
    );
  }

  // 2. Asynchronous Handling: Resilient Network Error State Layout
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text variant="heading" style={{ color: '#DA1E28', marginBottom: 8 }}>
          Unable to load dashboard records
        </Text>
        <Text variant="body" style={{ textAlign: 'center', marginBottom: 16 }}>
          {error.message || 'An unexpected contract breach or transport error occurred.'}
        </Text>
        <Button label="Retry Connection" variant="secondary" onPress={() => refetch()} />
      </View>
    );
  }

  // 3. Main Dashboard UI Screen Layout composed of Global UI Atoms
  return (
    <ScrollView style={containerStyle}>
      <Text variant="title" weight="bold" style={{ marginBottom: 4 }}>
        My Bookings
      </Text>
      <Text variant="caption" style={{ color: '#525252', marginBottom: 16 }}>
        Securely validated cross-platform real-time data logs
      </Text>

      {bookings && bookings.length === 0 ? (
        <Text variant="body">No booking records found.</Text>
      ) : (
        bookings?.map((booking) => (
          <Card key={booking.id} style={{ marginBottom: 12 }}>
            <View style={statusBadgeStyle(booking.status)}>
              <Text 
                variant="caption" 
                weight="bold" 
                style={{ 
                  color: booking.status === 'confirmed' ? '#24A148' : 
                         booking.status === 'pending' ? '#B78103' : '#DA1E28' 
                }}
              >
                {booking.status.toUpperCase()}
              </Text>
            </View>

            <Text variant="heading" weight="bold" style={{ marginBottom: 4 }}>
              {booking.customerName}
            </Text>
            
            <Text variant="body" style={{ color: '#525252', marginBottom: 12 }}>
              Date: {new Date(booking.serviceDate).toLocaleDateString()}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="heading" weight="bold" style={{ color: '#0F62FE' }}>
                ${booking.amount.toFixed(2)}
              </Text>
              <Button label="Manage" variant="secondary" onPress={() => console.log(`Managing: ${booking.id}`)} />
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}
