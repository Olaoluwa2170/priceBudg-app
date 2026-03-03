import { useRouter } from 'expo-router';
import { useQuery, useConvexAuth } from 'convex/react';
import { colors } from '../styles/colors';
import { api } from 'convex/_generated/api';
import { styles } from 'styles/modals/result-modal';
import { Trash2, Camera, ShareIcon } from 'lucide-react-native';
import { ExchangeRateResponse, ScanItem } from '../types';
import { SUPPORTED_CURRENCIES } from 'constants/supported_currencies';
import { useRef, useMemo, useEffect, useCallback, useState } from 'react';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { getExchangeRateRecord, saveExchangeRateRecord } from 'utils/storage/currency-rates';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { SelectBudgetModal } from './SelectBudgetModal';

interface ResultsModalProps {
  item: ScanItem | null;
  visible: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onScanAnother: () => void;
  setShowModal: (value: boolean) => void;
}

export function ResultsModal({
  item,
  visible,
  onClose,
  onDelete,
  onScanAnother,
  setShowModal,
}: ResultsModalProps) {
  const router = useRouter();
  const viewShotRef = useRef<View>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['80%'], []);
  const [rates, setRates] = useState<ExchangeRateResponse | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [showSelectBudgetModal, setShowSelectBudgetModal] = useState(false);

  const { isAuthenticated } = useConvexAuth();
  const userPrimaryCurrency = useQuery(
    api.currency.getUserPrimaryCurrency,
    isAuthenticated ? undefined : 'skip'
  );

  useEffect(() => {
    if (visible && item) {
      bottomSheetRef.current?.expand();
    } else if (!visible) {
      bottomSheetRef.current?.close();
    }
  }, [visible, item]);

  useEffect(() => {
    const fetchRates = async () => {
      if (!visible || !item || rates || ratesLoading) return;

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
        setRatesError(null);
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
        setRatesError('Unable to load currency comparison right now.');
      } finally {
        setRatesLoading(false);
      }
    };

    fetchRates();
  }, [visible, item, rates, ratesLoading]);

  const parseBasePrice = (price: number): number | null => {
    return !price || isNaN(price) ? null : price;
  };

  const basePrice = item ? parseBasePrice(item.price) : null;

  const defaultFormattedPrice = () => {
    if (!rates || !basePrice) return null;
    const USDRate = rates.conversion_rates['USD'];
    if (!USDRate) return null;
    const converted = basePrice * USDRate;
    return `${Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(converted)}`;
  };

  const formattedConvertedPrice = () => {
    if (!rates || !basePrice || !selectedCurrency) return null;
    const rate = rates.conversion_rates[selectedCurrency];
    if (!rate) return null;
    const converted = basePrice * rate;
    return `${Intl.NumberFormat('en-US', { style: 'currency', currency: selectedCurrency }).format(converted)}`;
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const currencyKeys = useMemo(
    () =>
      rates
        ? Object.keys(rates.conversion_rates).filter((cur) => SUPPORTED_CURRENCIES.includes(cur))
        : [],
    [rates]
  );

  const itemPriceInPrimaryCurrency = useMemo(() => {
    if (!rates || !basePrice || !userPrimaryCurrency) return null;
    return Intl.NumberFormat('en-US', { style: 'currency', currency: userPrimaryCurrency }).format(
      rates.conversion_rates[userPrimaryCurrency] * basePrice
    );
  }, [basePrice, rates, userPrimaryCurrency]);

  const handleOnSetDefaultClick = () => {
    onClose();
    router.push('/(protected)/currency');
  };

  const handleShareScanPress = async () => {
    try {
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 0.8,
        result: 'tmpfile',
      });

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to share image.');
    }
  };

  const renderSharedItemContent = () => {
    if (!item) return null;
    return (
      <>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUri }} style={styles.image} />
        </View>

        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.price}>
          {itemPriceInPrimaryCurrency ? `${itemPriceInPrimaryCurrency}` : defaultFormattedPrice()}
        </Text>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            AI confidence: {item.confidence || 'Medium'}. Price estimate based on current online
            listings.
          </Text>
        </View>
      </>
    );
  };

  if (!item) return null;

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        index={visible ? 0 : -1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        backdropComponent={renderBackdrop}>
        <BottomSheetView style={styles.content}>
          {renderSharedItemContent()}

          {basePrice !== null && (
            <View style={styles.currencySection}>
              <Text style={styles.currencySectionTitle}>Compare price in other currencies</Text>
              {ratesLoading && (
                <View style={styles.ratesLoadingRow}>
                  <ActivityIndicator size="small" color={colors.gray500} />
                  <Text style={styles.ratesHelperText}>Loading exchange rates…</Text>
                </View>
              )}
              {!ratesLoading && ratesError && (
                <Text style={styles.ratesErrorText}>{ratesError}</Text>
              )}
              {!ratesLoading && !ratesError && rates && currencyKeys.length > 0 && (
                <>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.currencyChipsContainer}>
                    {currencyKeys.map((code) => {
                      const selected = code === selectedCurrency;
                      return (
                        <TouchableOpacity
                          key={code}
                          style={[styles.currencyChip, selected && styles.currencyChipSelected]}
                          onPress={() => setSelectedCurrency(code)}
                          accessibilityRole="button"
                          accessibilityLabel={`Convert price to ${code}`}>
                          <Text
                            style={[
                              styles.currencyChipText,
                              selected && styles.currencyChipTextSelected,
                            ]}>
                            {code}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    <TouchableOpacity
                      key="select-primary-currency"
                      accessibilityRole="button"
                      accessibilityLabel="Select default currency"
                      style={styles.selectPrimaryCurrencyButton}
                      onPress={handleOnSetDefaultClick}>
                      <Text style={styles.currencyChipText}>Set default</Text>
                    </TouchableOpacity>
                  </ScrollView>
                  {formattedConvertedPrice() && (
                    <Text style={styles.convertedPriceText}>
                      Approximate price in {selectedCurrency}: {formattedConvertedPrice()}
                    </Text>
                  )}
                  <Text style={styles.ratesHelperText}>
                    Based on live exchange rates from {rates.base_code}. For comparison only.
                  </Text>
                </>
              )}
            </View>
          )}

          {onDelete && (
            <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item.id)}>
              <Trash2 size={20} color={colors.white} />
              <Text style={styles.deleteButtonText}>DELETE RESULT</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.scanButton} onPress={onScanAnother}>
            <Camera size={20} color={colors.white} />
            <Text style={styles.scanButtonText}>SCAN ANOTHER ITEM</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareScanButton} onPress={handleShareScanPress}>
            <ShareIcon size={20} color={colors.white} />
            <Text style={styles.shareScanButtonText}>SHARE RESULT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.scanButton,
              {
                marginTop: 12,
                backgroundColor: colors.white,
                borderWidth: 1,
                borderColor: colors.primaryBlue,
              },
            ]}
            onPress={() => setShowSelectBudgetModal(true)}>
            <Text style={[styles.scanButtonText, { color: colors.primaryBlue }]}>
              ADD TO BUDGET
            </Text>
          </TouchableOpacity>

          <ViewShot
            ref={viewShotRef}
            options={{ format: 'jpg', quality: 0.9 }}
            style={[
              styles.hiddenOffScreenCapture,
              { flex: 1, alignItems: 'center', backgroundColor: colors.white },
            ]}>
            {renderSharedItemContent()}

            <View style={styles.captureFooterContainer}>
              <Text style={styles.captureFooterText}>Powered by PriceIt</Text>
            </View>
          </ViewShot>
        </BottomSheetView>
      </BottomSheet>

      <SelectBudgetModal
        visible={showSelectBudgetModal}
        onClose={() => {
          setShowSelectBudgetModal(false);
        }}
        item={item}
        basePrice={basePrice}
      />
    </>
  );
}
