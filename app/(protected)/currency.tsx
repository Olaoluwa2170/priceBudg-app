import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Menu } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useMemo } from 'react';
import { Picker } from '@react-native-picker/picker';
import { getExchangeRateRecord, saveExchangeRateRecord } from 'utils/storage/currency-rates';
import { ExchangeRateResponse } from 'types';
import { colors } from '../../styles/colors';
import { styles } from 'styles/app/(protected)/currency';

export default function CurrencyScreen() {
  const navigation = useNavigation();
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { isAuthenticated } = useConvexAuth();
  const activeUser = useQuery(api.users.getActiveUser);
  const userPrimaryCurrency = useQuery(
    api.currency.getUserPrimaryCurrency,
    isAuthenticated ? undefined : 'skip'
  );
  const setUserPrimaryCurrency = useMutation(api.currency.setUserPrimaryCurrency);

  // Get currency list from exchange rates
  const currencyList = useMemo(() => {
    if (!exchangeRates || !exchangeRates.conversion_rates) return [];
    return Object.keys(exchangeRates.conversion_rates).sort();
  }, [exchangeRates]);

  // Load exchange rates
  useEffect(() => {
    const loadExchangeRates = async () => {
      try {
        setLoading(true);
        const rates = await getExchangeRateRecord();
        if (rates) {
          setExchangeRates(rates);
        } else {
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

          setExchangeRates({
            ...data,
            conversion_rates: data.conversion_rates,
          });
        }
      } catch (error) {
        console.error('Error loading exchange rates:', error);
        Alert.alert('Error', 'Failed to load exchange rates.');
      } finally {
        setLoading(false);
      }
    };

    loadExchangeRates();
  }, []);

  // Set initial selected currency to user's primary currency if available
  useEffect(() => {
    if (userPrimaryCurrency && currencyList.includes(userPrimaryCurrency)) {
      setSelectedCurrency(userPrimaryCurrency);
    }
  }, [userPrimaryCurrency, currencyList]);

  const handleSave = async () => {
    if (!activeUser || !selectedCurrency) {
      Alert.alert('Error', 'Unable to save currency. Please try again.');
      return;
    }

    try {
      setSaving(true);
      await setUserPrimaryCurrency({
        userId: activeUser._id,
        currency: selectedCurrency,
      });
      Alert.alert('Success', `Primary currency set to ${selectedCurrency}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error saving primary currency:', error);
      Alert.alert('Error', 'Failed to save currency. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            // @ts-ignore - drawer navigation type
            navigation.openDrawer();
          }}>
          <Menu size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Primary Currency</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Select your primary currency. Prices will be displayed in this currency by default.
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primaryBlue} />
            <Text style={styles.loadingText}>Loading currencies...</Text>
          </View>
        ) : currencyList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No currencies available</Text>
          </View>
        ) : (
          <>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedCurrency}
                onValueChange={(itemValue) => setSelectedCurrency(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}>
                {currencyList.map((currency) => (
                  <Picker.Item key={currency} label={currency} value={currency} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Currency</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
