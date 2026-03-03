import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExchangeRateResponse, ExchangeRateStoredRecord } from 'types';

const STORAGE_KEY = '@priceit_currency_rates';

export async function saveExchangeRateRecord(exchangeRate: ExchangeRateResponse): Promise<void> {
  try {
    const expiresAt = new Date();

    // Expires in one day
    expiresAt.setHours(expiresAt.getHours() + 24 * 1);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        exchangeRateResponse: exchangeRate,
        expiresAt: expiresAt.getTime(),
      })
    );
  } catch (error) {
    console.error('Error saving record:', error);
  }
}

export async function getExchangeRateRecord(): Promise<ExchangeRateResponse | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const parsedData = data ? (JSON.parse(data) as ExchangeRateStoredRecord) : null;

    if (!parsedData) return null;

    if (Date.now() >= parsedData.expiresAt) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsedData.exchangeRateResponse;
  } catch (error) {
    console.error('Error fetching record:', error);
    return null;
  }
}
