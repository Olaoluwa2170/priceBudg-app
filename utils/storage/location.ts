import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData, ReverseGeocodeResult } from 'types';

const STORAGE_KEY = '@priceit_location';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Save reverse geocode result for given coordinates
 */
export async function saveLocationData(
  latitude: number,
  longitude: number,
  result: ReverseGeocodeResult
): Promise<void> {
  try {
    const locationData: LocationData = {
      result,
      latitude,
      longitude,
      savedAt: Date.now(),
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(locationData));
  } catch (error) {
    console.error('Error saving location data:', error);
    throw error;
  }
}

/**
 * Get saved reverse geocode result for coordinates
 * Returns null if no data exists or cache has expired
 */
export async function getLocationData(
  latitude?: number,
  longitude?: number
): Promise<ReverseGeocodeResult | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const locationData = JSON.parse(data) as LocationData;

    // Check if cache has expired
    if (Date.now() - locationData.savedAt > CACHE_DURATION) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // If coordinates are provided, check if they match (within a small tolerance)
    if (latitude !== undefined && longitude !== undefined) {
      const latDiff = Math.abs(locationData.latitude - latitude);
      const lonDiff = Math.abs(locationData.longitude - longitude);
      // Allow ~1km difference (approximately 0.01 degrees)
      const tolerance = 0.01;
      if (latDiff > tolerance || lonDiff > tolerance) {
        return null;
      }
    }

    return locationData.result;
  } catch (error) {
    console.error('Error getting location data:', error);
    return null;
  }
}

/**
 * Clear saved location data
 */
export async function clearLocationData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing location data:', error);
    throw error;
  }
}
