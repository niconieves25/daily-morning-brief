import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultPreferences, Preferences } from './morning';

const key = 'the-morning.preferences.v1';

export async function readPreferences(): Promise<Preferences> {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (!stored) return defaultPreferences;
    const parsed = JSON.parse(stored);
    return {
      name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : defaultPreferences.name,
      topics: Array.isArray(parsed.topics) ? parsed.topics.filter((item: unknown): item is string => typeof item === 'string') : defaultPreferences.topics,
    };
  } catch {
    return defaultPreferences;
  }
}

export async function savePreferences(preferences: Preferences) {
  await AsyncStorage.setItem(key, JSON.stringify(preferences));
}
