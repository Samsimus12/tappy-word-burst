# Tappy Word — Project Handoff

## What this is
A mobile word-synonym puzzle game for iOS and Android built with **Expo (React Native)**. The player is shown a target word and must tap all its synonyms floating around the screen before the timer runs out. Finding all synonyms advances to the next round; failing ends the game and shows a total score.

## Running the project
```
cd ~/Documents/repos/tappy-word
npx expo start --clear
```
- Test on device via **Expo Go** app (App Store / Google Play)
- Same network required, OR use `npx expo start --tunnel` to demo anywhere
- Scan the QR code in Expo Go to load the app

## GitHub
https://github.com/Samsimus12/tappy-word

## Tech stack
- **Expo SDK 54** with New Architecture enabled (`newArchEnabled: true`)
- **React Native** built-in `Animated` API (NOT Reanimated — causes "Exception in HostFunction" crashes with this Expo config)
- **expo-av** for all audio (sound effects + background music)
- **Datamuse API** (`api.datamuse.com`) for synonym fetching — 6s timeout with AbortController
- **AsyncStorage** for hints, settings, and achievement persistence
- No navigation library — simple screen state machine in `App.js`

## File structure
```
App.js                          # Screen state machine (home → game → round-complete → results → achievements)
screens/
  HomeScreen.js                 # Difficulty picker, mode selector card, settings modal, achievements link
  GameScreen.js                 # Main game: floating/falling words, timer, round score, sound triggers
  RoundCompleteScreen.js        # Between rounds: round score + total + found synonyms + continue
  ResultsScreen.js              # End screen: total score, missed synonyms, play again / back to home
  AchievementsScreen.js         # Achievement grid + theme selector
components/
  FloatingWord.js               # Animated floating word bubble — accepts bubbleColor prop
  FallingWord.js                # Falling word bubble for Falling Words mode — accepts bubbleColor prop
constants/
  difficulty.js                 # Easy/Medium/Hard configs (duration, synonyms, distractors, speed, correctPoints, wrongPenalty)
  wordList.js                   # BASE_WORDS (156 target words) and DISTRACTOR_WORDS (321 words)
  fallbackSynonyms.js           # Offline fallback synonym map for original BASE_WORDS
  achievements.js               # THEMES object (8 themes) + ACHIEVEMENTS array (10 achievements)
utils/
  datamuse.js                   # fetchSynonyms() and fetchRelatedWords() with frequency filter
  wordPool.js                   # buildWordPool() — seeds ~1000-word pool from Datamuse on startup
  wordQueue.js                  # Shuffle queue: initQueue(words) + nextWord() — no-repeat word selection
  hintStorage.js                # AsyncStorage wrapper for hint count (initializes to 10)
  settingsStorage.js            # AsyncStorage wrapper for { sfxEnabled, musicEnabled }
  achievementStorage.js         # AsyncStorage wrapper for { unlockedIds, selectedTheme, modesPlayed }
  audio.js                      # expo-av audio manager: initAudio(), playSound(name), startMusic(), stopMusic()
assets/
  sounds/                       # WAV sound effects (Success, Fail, Hint, Countdown, Go)
  music/                        # 4 WAV tracks: Menu.wav (home loop), Pocket Parade.wav, Tile Tap Loop.wav,
                                #   Taploop Arcade.wav, Token Pop.wav (game tracks, randomly selected)
```

## Game flow
1. **HomeScreen** — pick difficulty + mode, tap Play
2. **GameScreen** — countdown 3-2-1-Go!, word bubbles, timer, round score popups
3. **RoundCompleteScreen** — found all synonyms: round score + running total + synonyms found, Continue
4. **GameScreen** (next round) — repeats until timer runs out
5. **ResultsScreen** — time ran out: total score, last word stats, missed synonyms, Play Again / Back to Home

**Survival Mode** — continuous session: starts at 30s, +25s per word solved, -5s per wrong tap

**Falling Words Mode** — synonyms fall top-to-bottom and recycle if missed; same timer/scoring as Standard

## Difficulty levels
| | Easy | Medium | Hard |
|---|---|---|---|
| Timer | 45s | 30s | 20s |
| Synonyms shown | 4 | 6 | 8 |
| Distractors | 8 | 12 | 16 |
| Word speed | 0.6× | 1.0× | 1.6× |
| Correct points | +5 | +10 | +15 |
| Wrong penalty | -2 | -5 | -8 |
| Synonym count | shown | shown | hidden |

Difficulty applies to **all three modes** — the HomeScreen mode selector color (border, arrows, label, dots, Play button) reflects the active difficulty color to make this clear. Hard mode shows "X found" instead of "X / Y found" so players don't know how many synonyms remain.

## Scoring
- Points per correct tap scale by difficulty (+5/+10/+15), stored in `difficulty.js` as `correctPoints`
- Wrong taps penalize -2/-5/-8 (minimum 0 per round)
- **In-game header shows round score only** (resets each round)
- Total accumulated score shown on RoundCompleteScreen and ResultsScreen
- Score popups (green/red) float up from the bottom on each tap

## HomeScreen layout
- Top bar: 🏆 (AchievementsScreen) | ⚙️ (settings modal)
- Difficulty row: Easy / Medium / Hard pill buttons (color-coded: green/amber/red)
- Mode selector card: ‹ [icon + name + description] › with 3 dots indicator below
  - Modes: Standard (🎯), Survival (⚡), Falling Words (🌊)
  - Card border, arrows, label, dots, and Play button all use `diff.color` so difficulty changes are visible across all modes
- Single **Play** button launches `onPlay(difficulty, mode)`
- Animated floating background words (40 words drifting with recursive Animated.timing)

## Hints
- Players start with 10 hints, persisted via AsyncStorage
- Tapping highlights a random unfound synonym for 2 seconds; long-press resets to 10 (dev tool)
- **Stub for AdMob rewarded ads** — future: "Watch an ad to earn hints"

## Audio
`initAudio()` called on app startup via `utils/audio.js`. Uses `Promise.allSettled` so one bad file doesn't kill all audio. SFX uses `setPositionAsync(0)` + `playAsync()` (not `replayAsync()`) for reliability.

Game music randomly picks from 4 tracks and auto-advances when a track ends. `gameMusicActive` flag prevents restarts between rounds — `startMusic()` is a no-op if already playing.

## Key technical notes
- **Animated API**: Use React Native's built-in `Animated`, NOT Reanimated (crashes with this Expo config)
- **Recursive animation**: FloatingBackground uses recursive `Animated.timing` callbacks, NOT `Animated.loop` — loop caused visible position snaps
- **Screen state bug (fixed)**: `const [screen, setScreen]` MUST be declared before any `useEffect` that references it — Babel hoists `const` as `var undefined` otherwise
- **FallingWord recycling**: Handled internally by the component via `tappedRef` to sync animation callbacks with React state
- **fallbackSynonyms.js** only covers the original ~58 BASE_WORDS — the 98 newer BASE_WORDS rely on Datamuse

## Pending: App Store submission
Sam has an Apple Developer account (pending ID verification). Steps when ready:
1. Set bundle ID in `app.json` — use `com.sammorrison.tappyword`
2. Replace default Expo app icon and splash screen with real assets
3. Prepare App Store screenshots (6.7" and 5.5" iPhone minimum)
4. `npm install -g eas-cli && eas login && eas build:configure`
5. `eas build --platform ios` — handles signing/provisioning automatically
6. `eas submit --platform ios` or upload via Transporter

## Pending: AdMob integration
Hints are already stubbed for rewarded ads. When ready:
1. Create AdMob account at admob.google.com, set up payments profile (pays out monthly at $100 threshold)
2. Register the app in AdMob, generate Ad Unit IDs
3. Install `react-native-google-mobile-ads` (has Expo config plugin support)
4. Add AdMob app ID to `app.json`
5. Wire rewarded ad into hint button — show ad → grant hints on completion
6. Optionally add interstitial ads between rounds (every 2–3 rounds)

## Known issues / things to revisit
- Datamuse occasionally returns 0 synonyms — fallback covers original BASE_WORDS only
- No persistent high score yet (AsyncStorage addition would be straightforward)
- No haptics yet (`expo-haptics` would pair well with tap sounds)
- App icon and splash screen are still Expo defaults
