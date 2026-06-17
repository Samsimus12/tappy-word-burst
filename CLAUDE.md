# Tappy Word Burst — Project Handoff

## What this is
A mobile word-synonym puzzle game for iOS and Android built with **Expo (React Native)**. The player sees a target word and must find all its synonyms (floating, falling, or tossed) before the timer runs out. Four game modes, three difficulty levels, AdMob ads, achievements, and themes.

## Running the project
```bash
cd ~/Documents/repos/tappy-word-burst
npx expo start --clear
```
- **Expo Go no longer works** — `react-native-google-mobile-ads` requires a custom dev client
- Use `npx expo run:ios` / `npx expo run:android` for device/simulator testing

**Simulator commands for App Store screenshots:**
```bash
npx expo run:ios --device "iPhone 17 Pro Max"     # 6.9" — required
npx expo run:ios --device "iPad Pro 13-inch (M5)"  # 13" — required
```
Flag is `--device`, not `--simulator`. Take screenshots with `Cmd+S` in Simulator.

**Android prerequisites** (one-time): Java 17 via `brew install --cask zulu@17`, `ANDROID_HOME=$HOME/Library/Android/sdk`, AVD created in Android Studio.

## GitHub
https://github.com/Samsimus12/tappy-word-burst

## App identity
- **Bundle ID / package**: `com.sammorrison.tappyword` (NOT tappywordburst)
- **EAS project ID**: `5079b3ac-0adf-4824-868e-1f48247c525c`
- **App Store Connect app ID**: `6764457991` (pinned in `eas.json` as `ascAppId`)
- **AdMob publisher**: `ca-app-pub-7289760521218684`
- **Current version**: 2.1.0, iOS build number 3 — EAS build in progress for App Store submission

## Tech stack
- **Expo SDK 54**, New Architecture enabled (`newArchEnabled: true`)
- **React Native `Animated` API only** — NOT Reanimated (causes "Exception in HostFunction" crashes)
- **expo-av** for audio; **react-native-google-mobile-ads** for AdMob
- **Datamuse API** for synonyms (6s timeout); **AsyncStorage** for persistence
- No navigation library — screen state machine in `App.js`

## File structure
```
App.js                          # Screen state machine + ad/hint/round state
screens/
  HomeScreen.js                 # Difficulty picker, 4-mode selector, settings, achievements, new-modes banner
  GameScreen.js                 # Game loop: all 4 modes, timer, ads, second chance, lives (slice)
  RoundCompleteScreen.js        # Between rounds: scores, Watch Ad for hints
  ResultsScreen.js              # End: total score, missed synonyms, play again
  AchievementsScreen.js         # Achievement grid + theme selector
  LoadingScreen.js              # Animated splash during word pool build
components/
  FloatingWord.js               # Standard/Survival mode — floating bubbles, JS-driver position
  CatchyWord.js                 # Catchy Word mode — single falling bubble in a lane
  CatchyGameArea.js             # Catchy Word orchestrator — 5 lanes, bucket, collision poll
  SliceWord.js                  # Word Slice mode — parabolic arc bubble, JS-driver position
  SliceGameArea.js              # Word Slice orchestrator — spawn/queue, swipe detection, lives display
  FallingWord.js                # UNUSED — was Falling Words mode (replaced by Catchy Word)
constants/
  difficulty.js                 # Easy/Medium/Hard configs
  wordList.js                   # BASE_WORDS (156) and DISTRACTOR_WORDS (321)
  fallbackSynonyms.js           # Offline fallback synonyms for original ~58 BASE_WORDS
  achievements.js               # THEMES (8) + ACHIEVEMENTS (10)
  blocklist.js                  # Set of ~70 blocked words (profanity/slurs) — filtered from all gameplay
utils/
  datamuse.js                   # fetchSynonyms() / fetchRelatedWords() — filters blocklist + frequency
  wordPool.js                   # buildWordPool() — seeds ~1000-word pool on startup
  wordQueue.js                  # initQueue() + nextWord() — no-repeat shuffle queue
  hintStorage.js / settingsStorage.js / achievementStorage.js  # AsyncStorage wrappers
  audio.js                      # initAudio(), playSound(name), startMusic/stopMusic/pauseMusic/resumeMusic
  admob.js                      # showRewardedAd(), preloadInterstitial(), showInterstitial()
  androidSafeTop.js             # ANDROID_TOP = StatusBar.currentHeight on Android, 0 on iOS
```

## Game modes
**Standard** — floating word bubbles; tap synonyms before timer runs out; round complete → next round.

**Survival** — same as Standard but starts at 30s, +25s per word solved, -5s per wrong tap; no rounds.

**Catchy Word** (`CatchyGameArea`) — words fall in 5 fixed lanes; player drags a bucket at the bottom to catch synonyms. Bucket width = `Math.max(56, laneWidth - 8)` (exactly one lane). Collision polled every 50ms via `addListener`. Words only start falling when `paused` first becomes false (`startedRef` guard). Missed synonyms are re-queued. `wordArea` uses `pointerEvents="box-none"` so `CatchyGameArea` owns its own touches via `PanResponder`.

**Word Slice** (`SliceGameArea`) — words tossed up from the bottom in a parabolic arc (rise 1400–1700ms, fall 1500–1800ms) and fall back off screen. Player swipes to slice; Liang-Barsky line-vs-AABB detects hits. **3 lives**: lose one for missing a synonym or slicing a distractor. Lives recover +1 every 20s (max 3). Lives=0 ends the game immediately (no second chance). Difficulty controls `maxConcurrent` words in the air (easy=2, medium=3, hard=5), not speed. `maxConcurrentRef` ramps +1 every 25s. `slicedLocalRef` Set prevents double-slicing before React state propagates. `useNativeDriver: false` required for JS-side hit testing.

## Profanity filter
`constants/blocklist.js` exports `BLOCKED_WORDS` (a `Set`). Applied in two places:
1. `utils/datamuse.js` — strips blocked words from API results before returning
2. `screens/GameScreen.js` — filters synonym list and distractor pool; retry loop checks *clean* synonym count so a word isn't selected if it only appears to have enough synonyms before filtering

Matching is exact + case-insensitive — "class" and "assembly" are never affected.

## New-modes banner
`HomeScreen.js` shows a dismissible banner announcing Catchy Word and Word Slice between the subtitle and difficulty picker.
- AsyncStorage key: `newModesBannerDismissed` — set on dismiss, checked on mount
- `BANNER_EXPIRY = new Date('2026-07-01')` — if current date ≥ expiry, banner never loads regardless of storage

## Difficulty levels
| | Easy | Medium | Hard |
|---|---|---|---|
| Timer | 45s | 30s | 20s |
| Synonyms shown | 4 | 6 | 8 |
| Distractors | 8 | 12 | 16 |
| Speed multiplier | 0.6× | 1.0× | 1.6× |
| Correct points | +5 | +10 | +15 |
| Wrong penalty | -2 | -5 | -8 |

Hard mode hides total synonym count ("X found" not "X / Y found").

## AdMob
All IDs platform-specific in `utils/admob.js`. Music always pauses/resumes around ads.
- **Rewarded (hints)**: hint button shows "Watch Ad (+3)" at 0 hints; timer freezes during ad
- **Rewarded (second chance)**: at timer=0, modal offers +15s; one per game; `secondChanceUsedRef` in `App.js`
- **Interstitial**: randomly every 3–6 rounds in `App.js handleContinue`; skipped if rewarded ad watched that round
- Dev mode uses `TestIds` automatically via `__DEV__`

## Key technical gotchas

### Animation & touch
- **`useNativeDriver: false` for position animations** in FloatingWord, SliceWord — native driver moves the visual but not the touch hitbox on Android. CatchyWord uses `useNativeDriver: true` for Y (visual-only fall; collision is polled externally, not touch-based).
- **FloatingWord uses recursive animation** (not `Animated.loop`) — each step picks a new target from `boundsRef.current` to stay in-bounds.
- **Touch in Standard/Survival via responder API** on the `Animated.View` (`onStartShouldSetResponder` + `onResponderRelease`) — NOT `Pressable`.
- **Catchy/Slice modes**: `wordArea` is `pointerEvents="box-none"`; `onStartShouldSetResponder` returns false — each game area component owns its own `PanResponder`.

### Android edge-to-edge
`"edgeToEdgeEnabled": true` in `app.json` draws behind the status bar. `SafeAreaView` does NOT fix this on Android. All screens apply `ANDROID_TOP` as `paddingTop`.

### Other
- `fallbackSynonyms.js` only covers original ~58 BASE_WORDS; newer words rely entirely on Datamuse
- Sound files in `assets/sounds/` use capitalized names (Success.wav, Fail.wav) — must match exactly or EAS Linux build fails
- `PanResponder` closures in `CatchyGameArea` and `SliceGameArea` are created once on mount — use refs (`bucketWidthRef`, `screenWidthRef`, `pausedRef`) for values that change over time

## Deploying
```bash
# iOS
eas build --platform ios --profile production
eas submit --platform ios --latest

# Android
eas build --platform android --profile production
eas submit --platform android --latest
```
- **v2.0.2 live on App Store**; v2.1.0 build in progress
- Android versionCode managed by EAS (`appVersionSource: "remote"`, `autoIncrement: true`)
- Google Play internal testing track is active; service account configured in EAS
- **app-ads.txt** at `https://samsimus12.github.io/app-ads.txt`
- App Store screenshots uploaded; search-result display has 24–72h propagation delay

## Still needed / ideas
- Sharper `assets/icon.png` (current is slightly blurry — upscaled from low-res)
- Update Support/Marketing URLs in App Store Connect (only editable on new version submission)
- No persistent high score yet (AsyncStorage addition is straightforward)
- No haptics yet (`expo-haptics` pairs well with tap sounds)
- Time bonus on round complete: award points based on time remaining (calculate in `App.js handleRoundComplete` where `timeLeft` is accessible)
