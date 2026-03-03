import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuery } from 'convex/react';
import { Search as SearchIcon, Package } from 'lucide-react-native';
import { api } from 'convex/_generated/api';
import { getLocationData } from '../../../utils/storage/location';
import { searchItemsByDescription } from '../../../utils/gemini';
import { SearchResultItem, ExchangeRateResponse } from '../../../types';
import { styles } from 'styles/app/(protected)/(tabs)/search';
import { colors } from '../../../styles/colors';
import { getExchangeRateRecord, saveExchangeRateRecord } from 'utils/storage/currency-rates';
import { useConvexAuth } from 'convex/react';

export default function SearchItemScreen() {
  const [query, setQuery] = useState('');

  const { isAuthenticated } = useConvexAuth();
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [rates, setRates] = useState<ExchangeRateResponse | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);

  // const activeSubscription = useQuery(api.subscriptions.getActiveSubscription);
  // const plans = useQuery(api.subscriptions.getPlans);
  // const userPrimaryCurrency = useQuery(api.currency.getUserPrimaryCurrency);
  const userPrimaryCurrency = useQuery(
    api.currency.getUserPrimaryCurrency,
    isAuthenticated ? undefined : 'skip'
  );

  // const currentPlan = activeSubscription?.plan
  //   ? plans?.find((p) => p.slug === activeSubscription.plan?.slug)
  //   : FREE_PLAN;
  // const isPremium = currentPlan?.slug === 'premium';

  useEffect(() => {
    const fetchRates = async () => {
      if (rates || ratesLoading) return;

      try {
        const rates_from_local = await getExchangeRateRecord();

        if (rates_from_local) {
          setRates({
            ...rates_from_local,
            conversion_rates: rates_from_local.conversion_rates,
          });
          return;
        }

        setRatesLoading(true);
        const res = await fetch(
          'https://v6.exchangerate-api.com/v6/bc74645c6d3b4aac8f84b0c1/latest/USD'
        );
        if (!res.ok) {
          throw new Error('Failed to fetch exchange rates');
        }
        const data: ExchangeRateResponse = await res.json();
        if (data.result !== 'success' || !data.conversion_rates) {
          throw new Error('Invalid exchange rates response');
        }

        // Save excahnge rate record
        await saveExchangeRateRecord(data);

        setRates({
          ...data,
          conversion_rates: data.conversion_rates,
        });
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      } finally {
        setRatesLoading(false);
      }
    };

    fetchRates();
  }, [rates, ratesLoading]);

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed || isSearching) return;

    setIsSearching(true);
    setHasSearched(true);
    setResults([]);

    try {
      const locationData = await getLocationData();
      const location =
        locationData?.address?.city || locationData?.address?.country
          ? {
              city: locationData.address?.city,
              country: locationData.address?.country,
            }
          : undefined;

      const items = await searchItemsByDescription(trimmed, location);
      setResults(items);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, isSearching]);

  const formatPrice = (priceUsd: number) => {
    const currency = userPrimaryCurrency ?? 'USD';

    if (currency === 'USD') {
      return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(priceUsd);
    }

    if (rates && rates.conversion_rates[currency]) {
      const rate = rates.conversion_rates[currency];
      const converted = priceUsd * rate;
      return Intl.NumberFormat('en-US', { style: 'currency', currency }).format(converted);
    }

    return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(priceUsd);
  };

  // const handleUpgrade = () => {
  //   router.push('/(protected)/subscription');
  // };

  // Premium gate: show upgrade CTA for non-premium users
  // if (!isPremium) {
  //   return (
  //     <View style={styles.container}>
  //       <View style={styles.header}>
  //         <Text style={styles.headerTitle}>Search</Text>
  //         <Text style={styles.headerSubtitle}>
  //           Find items by description and get price estimates
  //         </Text>
  //       </View>
  //       <View style={styles.premiumGateContainer}>
  //         <View style={styles.premiumIconWrap}>
  //           <Crown size={40} color={colors.success} fill={colors.success} />
  //         </View>
  //         <Text style={styles.premiumTitle}>Premium feature</Text>
  //         <Text style={styles.premiumSubtitle}>
  //           Search is available for Premium subscribers. Describe what you’re looking for and get a
  //           list of matching items with estimated prices.
  //         </Text>
  //         <TouchableOpacity
  //           style={styles.upgradeButton}
  //           onPress={handleUpgrade}
  //           activeOpacity={0.8}>
  //           <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
  //         </TouchableOpacity>
  //       </View>
  //     </View>
  //   );
  // }

  const renderResultItem = ({ item }: { item: SearchResultItem }) => (
    <View style={styles.resultItem}>
      <View style={styles.resultThumb}>
        {item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            style={{ width: 56, height: 56, borderRadius: 10 }}
          />
        ) : (
          <Package size={28} color={colors.gray500} />
        )}
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.resultPrice}>{formatPrice(item.estimatedPrice)}</Text>
      </View>
    </View>
  );

  const showEmpty = hasSearched && !isSearching && results.length === 0;
  const showList = hasSearched && (results.length > 0 || isSearching);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <Text style={styles.headerSubtitle}>
          Describe what you’re looking for and get price estimates
        </Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="e.g. wireless earbuds under $100"
          placeholderTextColor={colors.placeholderGray}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          editable={!isSearching}
        />
        <TouchableOpacity
          style={[
            styles.searchButton,
            (!query.trim() || isSearching) && styles.searchButtonDisabled,
          ]}
          onPress={handleSearch}
          disabled={!query.trim() || isSearching}
          activeOpacity={0.8}>
          <SearchIcon
            size={22}
            color={!query.trim() || isSearching ? colors.gray500 : colors.white}
          />
        </TouchableOpacity>
      </View>

      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {showEmpty && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubtext}>
            Try a different description or more specific keywords
          </Text>
        </View>
      )}

      {showList && !isSearching && results.length > 0 && (
        <FlatList
          data={results}
          renderItem={renderResultItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </KeyboardAvoidingView>
  );
}
