import { Audio } from 'expo-av';

const SOUND_FILES = {
  success: require('../assets/sounds/Success.wav'),
  correct: require('../assets/sounds/Success.wav'),
  fail:    require('../assets/sounds/Fail.wav'),
  wrong:   require('../assets/sounds/Fail.wav'),
  hint:    require('../assets/sounds/Hint.wav'),
  tick:    require('../assets/sounds/Countdown.wav'),
  go:      require('../assets/sounds/Go.wav'),
};

const GAME_MUSIC_FILES = [
  require('../assets/music/Pocket Parade.wav'),
  require('../assets/music/Tile Tap Loop.wav'),
  require('../assets/music/Taploop Arcade.wav'),
  require('../assets/music/Token Pop.wav'),
];

let sounds = {};
let menuMusic = null;
let gameMusic = null;
let gameMusicActive = false;
let sfxEnabled = true;
let musicEnabled = true;

export async function initAudio() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    const entries = await Promise.allSettled(
      Object.entries(SOUND_FILES).map(async ([key, file]) => {
        const { sound } = await Audio.Sound.createAsync(file);
        return [key, sound];
      })
    );
    sounds = Object.fromEntries(
      entries.filter(r => r.status === 'fulfilled').map(r => r.value)
    );

    const { sound } = await Audio.Sound.createAsync(
      require('../assets/music/Menu.wav'),
      { isLooping: true, volume: 0.35 }
    );
    menuMusic = sound;
  } catch {}
}

export function setSfxEnabled(val) { sfxEnabled = val; }
export function setMusicEnabled(val) { musicEnabled = val; }

export async function playSound(name) {
  if (!sfxEnabled) { console.log(`[audio] playSound(${name}) skipped — sfx disabled`); return; }
  const sound = sounds[name];
  if (!sound) { console.log(`[audio] playSound(${name}) skipped — sound not loaded`); return; }
  try {
    await sound.setPositionAsync(0);
    await sound.playAsync();
    console.log(`[audio] playSound(${name}) ok`);
  } catch (e) {
    console.error(`[audio] playSound(${name}) error:`, e);
  }
}

export async function startMenuMusic() {
  if (!musicEnabled || !menuMusic) return;
  try {
    const status = await menuMusic.getStatusAsync();
    if (!status.isPlaying) await menuMusic.playAsync();
  } catch {}
}

export async function stopMenuMusic() {
  if (!menuMusic) return;
  try {
    await menuMusic.stopAsync();
    await menuMusic.setPositionAsync(0);
  } catch {}
}

async function loadNextGameTrack() {
  if (gameMusic) {
    try { gameMusic.setOnPlaybackStatusUpdate(null); } catch {}
    try { await gameMusic.stopAsync(); } catch {}
    try { await gameMusic.unloadAsync(); } catch {}
    gameMusic = null;
  }

  if (!musicEnabled || !gameMusicActive) return;

  const file = GAME_MUSIC_FILES[Math.floor(Math.random() * GAME_MUSIC_FILES.length)];
  try {
    const { sound } = await Audio.Sound.createAsync(file, { volume: 0.35 });
    if (!gameMusicActive) { await sound.unloadAsync(); return; }
    gameMusic = sound;
    sound.setOnPlaybackStatusUpdate(status => {
      if (status.didJustFinish && gameMusicActive) loadNextGameTrack();
    });
    await sound.playAsync();
  } catch {}
}

export async function startMusic() {
  if (!musicEnabled) return;
  if (gameMusicActive) return;
  await stopMenuMusic();
  gameMusicActive = true;
  await loadNextGameTrack();
}

export async function stopMusic() {
  gameMusicActive = false;
  if (gameMusic) {
    try { gameMusic.setOnPlaybackStatusUpdate(null); } catch {}
    try { await gameMusic.stopAsync(); } catch {}
    try { await gameMusic.unloadAsync(); } catch {}
    gameMusic = null;
  }
}

export async function pauseMusic() {
  if (!gameMusic) return;
  try { await gameMusic.pauseAsync(); } catch {}
}

export async function resumeMusic() {
  if (!musicEnabled || !gameMusicActive || !gameMusic) return;
  try { await gameMusic.playAsync(); } catch {}
}
