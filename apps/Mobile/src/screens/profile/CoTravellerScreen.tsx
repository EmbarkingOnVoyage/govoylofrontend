import React from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react-native';
import { useTravellersMobile, useDeleteTravellerMobile, type Traveler } from '@workspace/ui';
import { styles } from './CoTravellerScreen.styles';
import { useHardwareBack } from '../../navigation/useHardwareBack';

const AVATAR_COLORS = ['#DC9898', '#A8DC98', '#A8C6DC', '#DCC998'];

// Read straight from the "YYYY-MM-DD..." string — see formatTravelerDob in
// TravelerDetailsScreen for why going through Date showed the wrong month.
function formatDate(isoDate: string | null | undefined): string {
  const match = isoDate ? /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate) : null;
  if (!match) return '';
  const [, year, month, day] = match;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[Number(month) - 1];
  return monthName ? `${day} ${monthName} ${year}` : '';
}

interface CoTravellerScreenProps {
  onBack: () => void;
  // asSelf: "Add yourself" (the signed-in customer isn't in the list yet).
  onAdd: (asSelf?: boolean) => void;
  onEdit: (id: string) => void;
}

export const CoTravellerScreen: React.FC<CoTravellerScreenProps> = ({ onBack, onAdd, onEdit }) => {
  useHardwareBack(() => onBack());

  const { data: travellers, isLoading } = useTravellersMobile();
  const deleteTraveller = useDeleteTravellerMobile();

  const handleDelete = (traveller: Traveler) => {
    Alert.alert(
      'Remove co-traveller',
      `Remove ${traveller.firstName} ${traveller.lastName} from your saved travellers?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteTraveller.mutate(traveller.id),
        },
      ]
    );
  };

  const renderItem = ({ item, index }: { item: Traveler; index: number }) => (
    <View>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
          <Text style={styles.avatarText}>{item.firstName?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowName}>
            {item.firstName} {item.lastName}
            {item.isAccountHolder ? <Text style={styles.youBadge}>  (You)</Text> : null}
          </Text>
          <Text style={styles.rowMeta}>
            {[item.gender, formatDate(item.dateOfBirth)].filter(Boolean).join(', ')}
          </Text>
        </View>
        <View style={styles.rowActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(item.id)}>
            <Pencil size={20} color="#182339" strokeWidth={1.2} />
          </TouchableOpacity>
          {/* The account holder can't be removed — they're always a traveller. */}
          {!item.isAccountHolder && (
            <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item)}>
              <Trash2 size={20} color="#182339" strokeWidth={1.2} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#7C1AEE', '#7C1AEE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <ArrowLeft size={20} color="#ECEEF3" strokeWidth={1.2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Co-Traveller</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <FlatList
        data={travellers ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No saved co-travellers yet.</Text>
            </View>
          ) : null
        }
        ListFooterComponentStyle={styles.footer}
        ListHeaderComponent={
          !isLoading && travellers && !travellers.some((t) => t.isAccountHolder) ? (
            <TouchableOpacity style={styles.addSelfRow} onPress={() => onAdd(true)} activeOpacity={0.8}>
              <Text style={styles.addSelfText}>+ Add yourself as a traveller</Text>
            </TouchableOpacity>
          ) : null
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.addButton} onPress={() => onAdd()} activeOpacity={0.8}>
            <Text style={styles.addButtonText}>Add Co-Traveller</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
};
