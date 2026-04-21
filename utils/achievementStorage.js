import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_UNLOCKED = '@ach_unlocked';
const KEY_THEME    = '@ach_theme';
const KEY_MODES    = '@ach_modes';

export async function loadAchievementData() {
  try {
    const [u, t, m] = await Promise.all([
      AsyncStorage.getItem(KEY_UNLOCKED),
      AsyncStorage.getItem(KEY_THEME),
      AsyncStorage.getItem(KEY_MODES),
    ]);
    return {
      unlockedIds:   u ? JSON.parse(u) : [],
      selectedTheme: t ?? 'default',
      modesPlayed:   m ? JSON.parse(m) : [],
    };
  } catch {
    return { unlockedIds: [], selectedTheme: 'default', modesPlayed: [] };
  }
}

export async function saveAchievementData({ unlockedIds, selectedTheme, modesPlayed }) {
  try {
    await Promise.all([
      AsyncStorage.setItem(KEY_UNLOCKED, JSON.stringify(unlockedIds)),
      AsyncStorage.setItem(KEY_THEME, selectedTheme),
      AsyncStorage.setItem(KEY_MODES, JSON.stringify(modesPlayed)),
    ]);
  } catch {}
}
