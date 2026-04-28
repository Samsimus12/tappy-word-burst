# Tappy Word — Project Handoff

## What this is
A mobile word-synonym puzzle game for iOS and Android built with **Expo (React Native)**. The player is shown a target word and must tap all its synonyms floating around the screen before the timer runs out. Finding all synonyms advances to the next round; failing ends the game and shows a total score.

## Running the project
```
cd ~/Documents/repos/tappy-word
npx expo start --clear
```
- **Expo Go no longer works** — `react-native-google-mobile-ads` is a native module requiring a custom dev client
- Use `npx expo run:ios` for local device/simulator testing
- Or `eas build --platform ios --profile development` for a device build via EAS

## GitHub
https://github.com/Samsimus12/tappy-word

## Tech stack
- **Expo SDK 54** with New Architecture enabled (`newArchEnabled: true`)
- **React Native** built-in `Animated` API (NOT Reanimated — causes "Exception in HostFunction" crashes with this Expo config)
- **expo-av** for all audio (sound effects + background music)
- **react-native-google-mobile-ads** for AdMob (rewarded + interstitial ads)
- **Datamuse API** (`api.datamuse.com`) for synonym fetching — 6s timeout with AbortController
- **AsyncStorage** for hints, settings, and achievement persistence
- No navigation library — simple screen state machine in `App.js`

## File structure
```
App.js                          # Screen state machine + all ad/hint/round state
screens/
  HomeScreen.js                 # Difficulty picker, mode selector card, settings modal, achievements link
  GameScreen.js                 # Main game: floating/falling words, timer, ads, second chance modal
  RoundCompleteScreen.js        # Between rounds: scores, synonyms found, Watch Ad for hints
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
  admob.js                      # AdMob wrapper: showRewardedAd(), preloadInterstitial(), showInterstitial()
assets/
  sounds/                       # WAV sound effects (Success, Fail, Hint, Countdown, Go)
  music/                        # 4 WAV tracks: Menu.wav (home loop) + 4 game tracks (randomly selected)
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

Hard mode shows "X found" instead of "X / Y found". HomeScreen mode selector card border, arrows, label, dots, and Play button all use `diff.color` to reflect active difficulty.

## Scoring
- Points per correct tap scale by difficulty (+5/+10/+15), stored in `difficulty.js` as `correctPoints`
- Wrong taps penalize -2/-5/-8 (minimum 0 per round)
- **In-game header shows round score only** (resets each round)
- Total accumulated score shown on RoundCompleteScreen and ResultsScreen

## AdMob integration (fully implemented)
AdMob App ID: `ca-app-pub-7289760521218684~1657536521`

Three ad placements, all managed via `utils/admob.js`:

**1. Rewarded — Hint reward** (GameScreen + RoundCompleteScreen)
- Ad unit: `ca-app-pub-7289760521218684/5772041359`
- In-game: hint button shows "Watch Ad (+3)" (purple) when hints = 0
- Round complete screen: "Watch Ad · +3 Hints" amber outline button always visible
- Grants 3 hints via `onEarnHints(3)` on success

**2. Rewarded — Second Chance** (GameScreen)
- Reuses same rewarded ad unit as hints
- When timer hits 0: if second chance not yet used this game, pause and show modal instead of ending
- Player can watch ad to continue with +15 seconds, or tap "No thanks" to end normally
- One per game session — `secondChanceUsedRef` in `App.js` resets on Back/Play Again

**3. Interstitial — Between rounds** (App.js `handleContinue`)
- Ad unit: `ca-app-pub-7289760521218684/6650234092`
- Preloaded on app startup and immediately after each show
- Shows randomly every 3–6 rounds (`nextAdRoundRef` tracks threshold)
- Skipped if player watched a rewarded ad that round (`watchedRewardedAdRef`)
- Both refs reset on Back/Play Again for a clean new session

**Dev mode**: all ads use `TestIds.REWARDED` / `TestIds.INTERSTITIAL` automatically via `__DEV__`

## Hints
- Players start with 10 hints, persisted via AsyncStorage
- Tapping highlights a random unfound synonym for 2 seconds
- Long-press hint button resets to 10 (dev tool only)
- Earned via rewarded ads (+3 per ad) from GameScreen or RoundCompleteScreen

## Audio
`initAudio()` called on app startup. Uses `Promise.allSettled` so one bad file doesn't kill all audio. SFX uses `setPositionAsync(0)` + `playAsync()` (not `replayAsync()`) for reliability. Game music randomly picks from 4 tracks; `gameMusicActive` flag prevents restarts between rounds.

## Key technical notes
- **Animated API**: Use React Native's built-in `Animated`, NOT Reanimated (crashes with this Expo config)
- **Recursive animation**: FloatingBackground uses recursive `Animated.timing` callbacks, NOT `Animated.loop` — loop caused visible position snaps
- **Screen state bug (fixed)**: `const [screen, setScreen]` MUST be declared before any `useEffect` that references it
- **FallingWord recycling**: Handled internally via `tappedRef` to sync animation callbacks with React state
- **fallbackSynonyms.js** only covers the original ~58 BASE_WORDS — the 98 newer BASE_WORDS rely on Datamuse
- **ScrollView centering**: RoundCompleteScreen uses `flexGrow: 1` on `contentContainerStyle` so `justifyContent: 'center'` actually works

## Pending: App Store submission
Sam's Apple Developer account is approved. Bundle ID (`com.sammorrison.tappyword`) and EAS project ID (`8449672c-5804-457f-8203-702ba1dd8c05`) are already set in `app.json`.

**Blocked on**: app icon and splash screen assets (Sam is creating these)
- Icon: 1024×1024px PNG, no transparency, no rounded corners
- Splash: any size PNG, centered on `#0f0f2e` background, keep focal point in centre 500×500px safe zone
- Drop into `assets/` replacing `icon.png` and `splash-icon.png`

**Remaining steps after assets are ready:**
1. `eas build --platform ios`
2. `eas submit --platform ios` (or upload via Transporter)
3. Prepare App Store screenshots: 6.7" (1290×2796px) required, 5.5" (1242×2208px) recommended

## Known issues / things to revisit
- Datamuse occasionally returns 0 synonyms — fallback covers original BASE_WORDS only
- No persistent high score yet (AsyncStorage addition would be straightforward)
- No haptics yet (`expo-haptics` would pair well with tap sounds)
- App icon and splash screen are still Expo defaults (in progress)
- Android AdMob app ID in `app.json` is a placeholder — needs real ID when Android build is set up
