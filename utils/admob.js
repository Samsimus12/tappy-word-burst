import { RewardedAd, RewardedAdEventType, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : 'ca-app-pub-7289760521218684/5772041359';

export function showRewardedAd() {
  return new Promise((resolve) => {
    const rewarded = RewardedAd.createForAdRequest(AD_UNIT_ID, {
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
