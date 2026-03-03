import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  SectionList,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { getScans, deleteScan, clearAllScans } from '../../../utils/storage/scans';
import { formatDate } from '../../../utils/date';
import { ScanItem, ScanSection } from '../../../types';
import { ResultsModal } from '../../../components/ResultsModal';
import { colors } from '../../../styles/colors';
import { styles } from 'styles/app/(protected)/(tabs)/history';
import { useQuery, useConvexAuth } from 'convex/react';
import { api } from 'convex/_generated/api';

export default function HistoryScreen() {
  const [scans, setScans] = useState<ScanSection[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScanItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const { isAuthenticated } = useConvexAuth();
  const userPrimaryCurrency = useQuery(
    api.currency.getUserPrimaryCurrency,
    isAuthenticated ? undefined : 'skip'
  );

  useEffect(() => {
    if (userPrimaryCurrency) {
      setSelectedCurrency(userPrimaryCurrency);
    }
  }, [userPrimaryCurrency]);

  const loadScans = async () => {
    try {
      const allScans = await getScans();

      // Group by date
      const grouped: { [key: string]: ScanItem[] } = {};
      allScans.forEach((scan) => {
        const dateKey = formatDate(scan.date);
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(scan);
      });

      // Convert to section format and sort
      const sections: ScanSection[] = Object.keys(grouped)
        .sort((a, b) => {
          // Sort dates: Today first, then Yesterday, then by date
          if (a === 'Today') return -1;
          if (b === 'Today') return 1;
          if (a === 'Yesterday' && b !== 'Today') return -1;
          if (b === 'Yesterday' && a !== 'Today') return 1;
          // For other dates, try to parse and compare
          try {
            const dateA = new Date(a);
            const dateB = new Date(b);
            if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
              return dateB.getTime() - dateA.getTime();
            }
          } catch {
            // If parsing fails, keep original order
          }
          return 0;
        })
        .map((title) => ({
          title,
          data: grouped[title],
        }));

      setScans(sections);
    } catch (error) {
      console.error('Error loading scans:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadScans();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadScans();
    setRefreshing(false);
  }, []);

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteScan(id);
          await loadScans();
        },
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Clear All', 'Are you sure you want to delete all scan history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          await clearAllScans();
          await loadScans();
        },
      },
    ]);
  };

  const handleItemPress = (item: ScanItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const formattedConvertedPrice = (price: number, currency: string) => {
    return Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(price);
  };

  const renderItem = ({ item }: { item: ScanItem }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleItemPress(item)} activeOpacity={0.7}>
      <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
      <View style={styles.itemContent}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>
          {formattedConvertedPrice(item.price, selectedCurrency)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteIcon}
        onPress={() => handleDelete(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Trash2 size={18} color={colors.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: ScanSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan History</Text>
        {scans.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {scans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No scans yet</Text>
          <Text style={styles.emptySubtext}>Start scanning items to see them here</Text>
        </View>
      ) : (
        <SectionList
          sections={scans}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      {showModal && selectedItem && (
        <ResultsModal
          item={selectedItem}
          visible={showModal}
          onClose={() => setShowModal(false)}
          onDelete={async (id) => {
            await handleDelete(id);
            setShowModal(false);
          }}
          onScanAnother={() => setShowModal(false)}
          setShowModal={setShowModal}
        />
      )}
    </View>
  );
}
