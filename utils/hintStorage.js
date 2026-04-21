import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'hint_count';
const INITIAL_HINTS = 10;

export async function loadHints() {
  const val = await AsyncStorage.getItem(KEY);
  if (val === null) {
    await AsyncStorage.setItem(KEY, String(INITIAL_HINTS));
    return INITIAL_HINTS;
  }
  return parseInt(val, 10);
}

export async function saveHints(count) {
  await AsyncStorage.setItem(KEY, String(count));
}
