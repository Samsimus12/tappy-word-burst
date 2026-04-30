# Word Sweep (formerly Tappy Word / Synonym Bun) — Project Handoff

## What this is
A mobile word-synonym puzzle game for iOS and Android built with **Expo (React Native)**. The player is shown a target word and must tap all its synonyms floating around the screen before the timer runs out. Finding all synonyms advances to the next round; failing ends the game and shows a total score.

## Running the project
```
cd ~/Documents/repos/synonym-bun
npx expo start --clear
```
- **Expo Go no longer works** — `react-native-google-mobile-ads` is a native module requiring a custom dev client
- Use `npx expo run:ios` for local device/simulator testing
- Or `eas build --platform ios --profile development` for a device build via EAS

**Simulator commands for App Store screenshots:**
```bash
npx expo run:ios --device "iPhone 17 Pro Max"    # 6.9" — required
npx expo run:ios --device "iPad Pro 13-inch (M5)" # 13" — required (supportsTablet: true)
```
Note: flag is `--device`, not `--simulator` (changed in newer Expo CLI). Xcode only has iPhone 17 models — no iPhone 16.
Take screenshots with `Cmd+S` in Simulator, or `xcrun simctl io booted screenshot screenshot.png`.

## GitHub
https://github.com/Samsimus12/synonym-bun (rename to `word-sweep` pending)

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
  icon.png                      # 1024×1024 app icon (currently Synonym Bun branded — needs Word Sweep replacement; has alpha flag but no transparent pixels — strip if App Store rejects)
  splash-icon.png               # 688×1504 splash logo — resizeMode: contain, bg #0f0f2e (dark navy) — needs Word Sweep replacement
  sounds/                       # WAV sound effects (Success, Fail, Hint, Countdown, Go) — all capitalized
  music/                        # Menu.wav (home loop) + 4 game tracks (randomly selected per round)
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
All ad unit IDs are platform-specific via `Platform.OS` in `utils/admob.js`.

| | iOS | Android |
|---|---|---|
| App ID | `~1657536521` | `~9372375010` |
| Rewarded | `/5772041359` | `/4168464429` |
| Interstitial | `/6650234092` | `/4559346663` |

Three ad placements:

**1. Rewarded — Hint reward** (GameScreen + RoundCompleteScreen)
- In-game: hint button shows "Watch Ad (+3)" (purple) when hints = 0
- Round complete screen: "Watch Ad · +3 Hints" amber outline button always visible
- Grants 3 hints via `onEarnHints(3)` on success

**2. Rewarded — Second Chance** (GameScreen)
- Reuses same rewarded ad unit as hints
- When timer hits 0: if second chance not yet used this game, show modal instead of ending
- Player watches ad to continue with +15 seconds, or taps "No thanks" to end normally
- One per game session — `secondChanceUsedRef` in `App.js` resets on Back/Play Again

**3. Interstitial — Between rounds** (App.js `handleContinue`)
- Shows randomly every 3–6 rounds (`nextAdRoundRef` tracks threshold)
- Skipped if player watched a rewarded ad that round (`watchedRewardedAdRef`)
- Both refs reset on Back/Play Again for a clean new session

**Dev mode**: all ads use `TestIds.REWARDED` / `TestIds.INTERSTITIAL` automatically via `__DEV__`

**AdMob status**: App linked to AdMob (publisher `ca-app-pub-7289760521218684`), ad units active. Ads were not yet serving as of April 29 — likely needs 24h to activate. Test ads confirmed working in simulator. When ads fail to load in production, `showRewardedAd()` resolves `false` silently — button briefly shows "Loading..." then resets.

## Hints
- Players start with 10 hints, persisted via AsyncStorage
- Tapping highlights a random unfound synonym for 2 seconds
- Long-press hint button resets to 10 (dev tool only)
- Earned via rewarded ads (+3 per ad) from GameScreen or RoundCompleteScreen

## Audio
`initAudio()` called on app startup. Uses `Promise.allSettled` so one bad file doesn't kill all audio. SFX uses `setPositionAsync(0)` + `playAsync()` (not `replayAsync()`) for reliability. Game music randomly picks from 4 tracks; `gameMusicActive` flag prevents restarts between rounds. Simulator audio is unreliable — test music on a physical device.

## Key technical notes
- **Animated API**: Use React Native's built-in `Animated`, NOT Reanimated (crashes with this Expo config)
- **Recursive animation**: FloatingBackground uses recursive `Animated.timing` callbacks, NOT `Animated.loop` — loop caused visible position snaps
- **Screen state bug (fixed)**: `const [screen, setScreen]` MUST be declared before any `useEffect` that references it
- **FallingWord recycling**: Handled internally via `tappedRef` to sync animation callbacks with React state
- **fallbackSynonyms.js** only covers the original ~58 BASE_WORDS — the 98 newer BASE_WORDS rely on Datamuse
- **ScrollView centering**: RoundCompleteScreen uses `flexGrow: 1` on `contentContainerStyle` so `justifyContent: 'center'` actually works
- **Sound file casing**: All sound files in `assets/sounds/` use capitalized names (Success.wav, Fail.wav, Hint.wav) — must match exactly or EAS build fails on Linux

## Rename status — "Word Sweep" (final name)

**Done:**
- HomeScreen title updated to "Word Sweep" (`screens/HomeScreen.js` line 109)
- `app.json` updated: `name` → "Word Sweep", `slug` → "word-sweep", `bundleIdentifier` → `com.sammorrison.wordsweep`

**Still needed (do in order):**
1. Rename GitHub repo from `synonym-bun` → `word-sweep` (Settings → Repository name)
2. Replace `assets/icon.png` with Word Sweep branded 1024×1024 icon
3. Replace `assets/splash-icon.png` with Word Sweep branded splash (688×1504, portrait, bg #0f0f2e)
4. Take App Store screenshots using simulator commands above
5. Create new App Store Connect listing (name conflict: existing "Tappy Word" and "Tappy Word 2" apps on store)

Current bundle ID: `com.sammorrison.wordsweep` | EAS project ID: `8449672c-5804-457f-8203-702ba1dd8c05`

Android: AdMob IDs set, no build done yet — full Google Play submission still needed.

## Ideas / future features
- **Rocket power-up**: destroys all remaining synonym bubbles on screen at once. Earned ~1 per 1000 points scored. Rare and satisfying — not purchasable, purely score-gated.
- No persistent high score yet (AsyncStorage addition would be straightforward)
- No haptics yet (`expo-haptics` would pair well with tap sounds)
- Datamuse occasionally returns 0 synonyms — fallback covers original BASE_WORDS only
