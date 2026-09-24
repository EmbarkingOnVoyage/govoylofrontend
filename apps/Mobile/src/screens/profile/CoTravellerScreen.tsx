import React from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react-native';
import { useTravellersMobile, useDeleteTravellerMobile, type Traveler } from '@workspace/ui';
import { styles } from './CoTravellerScreen.styles';

const AVATAR_COLORS = ['#DC9898', '#A8DC98', '#A8C6DC', '#DCC998'];

function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

interface CoTravellerScreenProps {
  onBack: () => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
}

export const CoTravellerScreen: React.FC<CoTravellerScreenProps> = ({ onBack, onAdd, onEdit }) => {
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
          </Text>
          <Text style={styles.rowMeta}>
            {[item.gender, formatDate(item.dateOfBirth)].filter(Boolean).join(', ')}
          </Text>
        </View>
        <View style={styles.rowActions}>
          <TouchableOpacity onPress={() => onEdit(item.id)}>
            <Pencil size={18} color="#4C5973" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)}>
            <Trash2 size={18} color="#EF4444" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.separator} />
    </View>
  );

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#6A16CB', '#350B65']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <ArrowLeft size={22} color="#FFFFFF" />
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
        ListFooterComponent={
          <TouchableOpacity style={styles.addButton} onPress={onAdd} activeOpacity={0.8}>
            <Text style={styles.addButtonText}>Add Co-Traveller</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
};
