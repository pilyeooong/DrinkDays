import { Platform } from 'react-native';

const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/2934735716';
const PROD_BANNER_ID = 'ca-app-pub-2370970221825852/8038671760';

export const AD_UNIT_IDS = {
  BANNER: __DEV__ ? TEST_BANNER_ID : PROD_BANNER_ID,
};

export async function initializeAds(): Promise<void> {
  // ATT 먼저 (실패해도 광고 초기화는 진행)
  if (Platform.OS === 'ios') {
    try {
      const { requestTrackingPermissionsAsync } = require('expo-tracking-transparency');
      await requestTrackingPermissionsAsync();
    } catch (e) {
      console.warn('[Ads] ATT request failed:', e);
    }
  }

  // AdMob SDK 초기화
  try {
    const { default: mobileAds } = require('react-native-google-mobile-ads');
    await mobileAds().initialize();
    console.log('[Ads] SDK initialized successfully');
  } catch (e) {
    console.warn('[Ads] SDK initialization failed:', e);
  }
}
