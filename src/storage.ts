import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData } from './types';

const KEY = '@remaining/data-v1';
export const initialData: AppData = { target: 2000, entries: [] };

export async function loadData(): Promise<AppData> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return initialData;
  try {
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      target: typeof parsed.target === 'number' ? parsed.target : 2000,
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch {
    return initialData;
  }
}

export function saveData(data: AppData) {
  return AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export function clearData() {
  return AsyncStorage.removeItem(KEY);
}
