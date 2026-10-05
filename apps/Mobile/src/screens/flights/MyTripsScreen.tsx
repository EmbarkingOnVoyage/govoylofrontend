import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import { Bell, Search, Plane, Download, Star, ChevronRight, Luggage, Sparkles, Headset, Check } from 'lucide-react-native';
import { useMyTripsMobile, useCustomerProfileMobile, type TripBooking } from '@workspace/ui';
import { styles, PURPLE, MUTED } from './MyTripsScreen.styles';
import { TripDetailsScreen } from './TripDetailsScreen';
import {
  type TripTab,
  tripTab,
  statusDisplay,
  routeTitle,
  formatDate,
  formatTime12,
  formatCurrency,
  passengerCount,
  matchesSearch,
  greeting,
} from './myTripsHelpers';

const TABS: TripTab[] = ['Upcoming', 'Completed', 'Cancelled'];
const CATEGORIES = ['All', 'Flights', 'Hotels', 'Trains', 'Buses'] as const;
type Category = (typeof CATEGORIES)[number];
type SortOrder = 'newest' | 'oldest';

interface MyTripsScreenProps {
  // "Explore Trips" on the empty state — opens flight search.
  onExploreTrips: () => void;
}

export const MyTripsScreen: React.FC<MyTripsScreenProps> = ({ onExploreTrips }) => {
  const { data: trips, isLoading, isError, refetch, isRefetching } = useMyTripsMobile();
  const { data: profile } = useCustomerProfileMobile();
  const [activeTab, setActiveTab] = useState<TripTab>('Upcoming');
  const [category, setCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [openTripId, setOpenTripId] = useState<string | null>(null);

  const byTab = useMemo(() => {
    const groups: Record<TripTab, TripBooking[]> = { Upcoming: [], Completed: [], Cancelled: [] };
    (trips ?? []).forEach((trip) => groups[tripTab(trip)].push(trip));
    return groups;
  }, [trips]);

  const visibleTrips = useMemo(() => {
    // Only flights can be booked today, so every other category is empty.
    if (category !== 'All' && category !== 'Flights') return [];
    const sign = sortOrder === 'newest' ? -1 : 1;
    return byTab[activeTab]
      .filter((trip) => matchesSearch(trip, search))
      .sort((a, b) => sign * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
  }, [byTab, activeTab, category, search, sortOrder]);

  if (openTripId) {
    return <TripDetailsScreen tripBookingId={openTripId} onBack={() => setOpenTripId(null)} />;
  }

  const tabIsEmpty = byTab[activeTab].length === 0;
  const firstName = profile?.firstName?.trim();

  const listTitle = () => {
    if (activeTab === 'Upcoming') {
      const n = visibleTrips.length;
      return `${n} upcoming ${n === 1 ? 'trip' : 'trips'}`;
    }
    return activeTab === 'Completed' ? 'Past trips' : 'Cancelled trips';
  };

  const renderEmptyTab = () => {
    const copy: Record<TripTab, { title: string; text: string }> = {
      Upcoming: {
        title: 'No upcoming trips',
        text: 'Your next adventure is waiting. Start planning your journey with GoVoylo.',
      },
      Completed: { title: 'No past trips', text: 'Trips you have completed will show up here.' },
      Cancelled: { title: 'No cancelled trips', text: 'Bookings you cancel will show up here.' },
    };
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyArt}>
          <View style={styles.emptyCircle}>
            <Luggage size={52} color={PURPLE} strokeWidth={1.8} />
          </View>
          <View style={{ position: 'absolute', right: 0, top: 6 }}>
            <Plane size={26} color={PURPLE} strokeWidth={2} />
          </View>
          <View style={{ position: 'absolute', left: 6, bottom: 22 }}>
            <Sparkles size={20} color={PURPLE} strokeWidth={2} />
          </View>
        </View>
        <Text style={styles.emptyTitle}>{copy[activeTab].title}</Text>
        <Text style={styles.emptyText}>{copy[activeTab].text}</Text>
        <View style={styles.emptyButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={onExploreTrips}>
            <Text style={styles.primaryButtonText}>Explore Trips</Text>
          </TouchableOpacity>
          {activeTab === 'Upcoming' ? (
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setActiveTab('Completed')}>
              <Text style={styles.secondaryButtonText}>View Past Trips</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  const renderCard = ({ item }: { item: TripBooking }) => {
    const status = statusDisplay(item);
    const tab = tripTab(item);
    const firstLeg = [...item.legs].sort((a, b) => a.legIndex - b.legIndex)[0];
    const time = firstLeg ? formatTime12(firstLeg.travelDate) : '';
    const pax = passengerCount(item);

    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.typeChip}>
            <Plane size={14} color={PURPLE} strokeWidth={2} />
            <Text style={styles.typeChipText}>Flight</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.routeRow}>
          <View style={styles.planeTile}>
            <Plane size={20} color={PURPLE} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.routeText} numberOfLines={1}>
              {routeTitle(item)}
            </Text>
            {firstLeg ? (
              <Text style={styles.dateText}>
                {formatDate(firstLeg.travelDate)}
                {time ? ` · ${time}` : ''}
              </Text>
            ) : null}
          </View>
        </View>

        {firstLeg ? (
          <View style={styles.carrierRow}>
            <Text style={styles.carrierText}>
              {firstLeg.airlineName} · {firstLeg.airlineCode} {firstLeg.flightNumber}
            </Text>
            <Text style={styles.carrierMuted}>
              {'  •  '}
              {pax} {pax === 1 ? 'Passenger' : 'Passengers'}
            </Text>
          </View>
        ) : null}

        <View style={styles.cardDivider} />

        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>BOOKING ID</Text>
            <Text style={styles.metaValue}>{item.bookingRefNo}</Text>
          </View>
          {tab === 'Cancelled' ? (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.metaLabel}>REFUND STATUS</Text>
              {item.refundAmount != null ? (
                <Text style={styles.refundText}>{formatCurrency(item.refundAmount, item.currencyCode)} refunded</Text>
              ) : item.localStatus === 'Cancelled' ? (
                <Text style={styles.refundPending}>Being processed</Text>
              ) : (
                <Text style={[styles.metaValue, { color: MUTED }]}>
                  {item.localStatus === 'Released' ? 'Hold released' : 'Not ticketed'}
                </Text>
              )}
            </View>
          ) : (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.metaLabel}>TOTAL</Text>
              <Text style={styles.amountText}>{formatCurrency(item.totalAmount, item.currencyCode)}</Text>
            </View>
          )}
        </View>

        {tab === 'Upcoming' ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setOpenTripId(item.id)}>
              <Text style={styles.primaryButtonText}>View Details</Text>
            </TouchableOpacity>
            {/* No action yet — e-tickets aren't generated in the app. */}
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.7}>
              <Download size={16} color={PURPLE} strokeWidth={2} />
              <Text style={styles.secondaryButtonText}>Download Ticket</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {tab === 'Completed' ? (
          <>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setOpenTripId(item.id)}>
                <Text style={styles.primaryButtonText}>View Details</Text>
              </TouchableOpacity>
              {/* No action yet. */}
              <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.7}>
                <Text style={styles.secondaryButtonText}>Book Again</Text>
              </TouchableOpacity>
            </View>
            {/* No action yet. */}
            <TouchableOpacity style={styles.rateRow} activeOpacity={0.7}>
              <Star size={16} color={PURPLE} strokeWidth={2} />
              <Text style={styles.rateText}>Rate your trip</Text>
              <ChevronRight size={18} color={PURPLE} strokeWidth={2} />
            </TouchableOpacity>
          </>
        ) : null}

        {tab === 'Cancelled' ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.primaryButton, styles.halfButton]}
              onPress={() => setOpenTripId(item.id)}
            >
              <Text style={styles.primaryButtonText}>View Cancellation Details</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  const renderList = () => {
    if (isLoading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={PURPLE} />
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.stateText}>We couldn't load your trips.</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (tabIsEmpty && category !== 'Hotels' && category !== 'Trains' && category !== 'Buses' && !search.trim()) {
      return (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[PURPLE]} />}
        >
          {renderEmptyTab()}
        </ScrollView>
      );
    }

    return (
      <FlatList
        data={visibleTrips}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[PURPLE]} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{listTitle()}</Text>
            <TouchableOpacity onPress={() => setSortOpen(true)} hitSlop={8}>
              <Text style={styles.sortLink}>
                {activeTab === 'Upcoming' ? 'Sort' : sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
              </Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centerState}>
            <Text style={styles.stateText}>
              {category !== 'All' && category !== 'Flights'
                ? `No ${category.toLowerCase()} bookings yet.`
                : 'No trips match your search.'}
            </Text>
          </View>
        }
        ListFooterComponent={
          activeTab === 'Cancelled' && visibleTrips.length > 0 ? (
            // No action yet.
            <TouchableOpacity style={styles.helpBanner} activeOpacity={0.7}>
              <Headset size={22} color="#1E3A8A" strokeWidth={2} />
              <View style={{ flex: 1 }}>
                <Text style={styles.helpTitle}>Need help with a refund?</Text>
                <Text style={styles.helpText}>Our travel experts are available around the clock.</Text>
              </View>
              <ChevronRight size={18} color="#1E3A8A" strokeWidth={2} />
            </TouchableOpacity>
          ) : null
        }
      />
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          {firstName ? (
            <Text style={styles.greeting}>
              {greeting()}, {firstName}
            </Text>
          ) : null}
          <Text style={styles.title}>My Trips</Text>
        </View>
        {/* No action yet — notifications aren't built. */}
        <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
          <Bell size={20} color="#3E4B64" strokeWidth={2} />
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Search size={18} color={MUTED} strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search trips, booking ID or destination"
          placeholderTextColor={MUTED}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <TouchableOpacity key={tab} style={styles.tab} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
              {active ? <View style={styles.tabUnderline} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {!(tabIsEmpty && !isLoading && !isError) ? (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {CATEGORIES.map((c) => {
              const active = c === category;
              return (
                <TouchableOpacity key={c} style={[styles.chip, active && styles.chipActive]} onPress={() => setCategory(c)}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <View style={{ flex: 1 }}>{renderList()}</View>

      <Modal visible={sortOpen} transparent animationType="slide" onRequestClose={() => setSortOpen(false)}>
        <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={() => setSortOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <Text style={styles.sheetTitle}>Sort by</Text>
            {(['newest', 'oldest'] as SortOrder[]).map((order) => {
              const active = order === sortOrder;
              return (
                <TouchableOpacity
                  key={order}
                  style={styles.sheetOption}
                  onPress={() => {
                    setSortOrder(order);
                    setSortOpen(false);
                  }}
                >
                  <Text style={[styles.sheetOptionText, active && styles.sheetOptionTextActive]}>
                    {order === 'newest' ? 'Newest booking first' : 'Oldest booking first'}
                  </Text>
                  {active ? <Check size={18} color={PURPLE} strokeWidth={2.5} /> : null}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={styles.sheetClose} onPress={() => setSortOpen(false)}>
              <Text style={styles.sheetCloseText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
