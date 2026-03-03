import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanItem } from '../../types';

const STORAGE_KEY = '@priceit_scans';

export async function saveScan(item: ScanItem): Promise<void> {
  try {
    const existing = await getScans();
    const updated = [item, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving scan:', error);
    throw error;
  }
}

export async function getScans(): Promise<ScanItem[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting scans:', error);
    return [];
  }
}

export async function deleteScan(id: string): Promise<void> {
  try {
    const existing = await getScans();
    const updated = existing.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting scan:', error);
    throw error;
  }
}

export async function clearAllScans(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing scans:', error);
    throw error;
  }
}

