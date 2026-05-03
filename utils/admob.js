import MobileAds, { RewardedAd, RewardedAdEventType, InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

const REWARDED_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : Platform.OS === 'android'
    ? 'ca-app-pub-7289760521218684/4168464429'
    : 'ca-app-pub-7289760521218684/5772041359';

const INTERSTITIAL_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === 'android'
    ? 'ca-app-pub-7289760521218684/4559346663'
    : 'ca-app-pub-7289760521218684/6650234092';

export async function initAdMob() {
  await MobileAds().initialize();
}

let _interstitial = null;
let _interstitialReady = false;

export function preloadInterstitial() {
  _interstitialReady = false;
  _interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT_ID, {
    keywords: ['game', 'puzzle', 'word'],
  });
  _interstitial.addAdEventListener(AdEventType.LOADED, () => {
    _interstitialReady = true;
  });
  _interstitial.load();
}

export function showInterstitial() {
  return new Promise((resolve) => {
    if (!_interstitial || !_interstitialReady) {
      resolve(false);
      return;
    }
    const unsubs = [];
    const cleanup = () => unsubs.forEach(fn => fn());

    unsubs.push(_interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      cleanup();
      _interstitialReady = false;
      preloadInterstitial();
      resolve(true);
    }));
    unsubs.push(_interstitial.addAdEventListener(AdEventType.ERROR, () => {
      cleanup();
      _interstitialReady = false;
      resolve(false);
    }));

    _interstitial.show();
  });
}

export function showRewardedAd() {
  return new Promise((resolve) => {
    const rewarded = RewardedAd.createForAdRequest(REWARDED_UNIT_ID, {
      keywords: ['game', 'puzzle', 'word'],
    });

    let earned = false;
    const unsubs = [];
    const cleanup = () => unsubs.forEach(fn => fn());

    unsubs.push(rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      rewarded.show();
    }));

    unsubs.push(rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      earned = true;
    }));

    unsubs.push(rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      cleanup();
      resolve(earned);
    }));

    unsubs.push(rewarded.addAdEventListener(AdEventType.ERROR, () => {
      cleanup();
      resolve(false);
    }));

    rewarded.load();
  });
}
