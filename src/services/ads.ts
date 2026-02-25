import { Platform } from 'react-native';

const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/2934735716';
const PROD_BANNER_ID = 'ca-app-pub-2370970221825852/8038671760';

export const AD_UNIT_IDS = {
  BANNER: __DEV__ ? TEST_BANNER_ID : PROD_BANNER_ID,
};

let trackingGranted = false;
let adsInitialized = false;

export function isTrackingGranted(): boolean {
  return trackingGranted;
}

export function isAdsInitialized(): boolean {
  return adsInitialized;
}

/**
 * ATT 권한 요청 → AdMob SDK 초기화 (순차 실행)
 *
 * 반드시 SplashScreen이 사라지고 앱 UI가 화면에 표시된 후에 호출해야 함.
 * iOS에서 ATT 다이얼로그는 앱 화면이 보이는 상태에서만 정상 표시됨.
 */
export async function initializeAds(): Promise<void> {
  // iOS: ATT 권한을 반드시 먼저 처리
  // delay_app_measurement_init: true로 네이티브 SDK도 ATT 전에 데이터 수집 안 함
  if (Platform.OS === 'ios') {
    try {
      const {
        getTrackingPermissionsAsync,
        requestTrackingPermissionsAsync,
      } = require('expo-tracking-transparency');

      const { status: currentStatus } = await getTrackingPermissionsAsync();

      if (currentStatus === 'undetermined') {
        const { status } = await requestTrackingPermissionsAsync();
        trackingGranted = status === 'granted';
        console.log('[Ads] ATT requested, status:', status);
      } else {
        trackingGranted = currentStatus === 'granted';
        console.log('[Ads] ATT already decided, status:', currentStatus);
      }
    } catch (e) {
      console.warn('[Ads] ATT request failed:', e);
      trackingGranted = false;
    }
  }

  // ATT 처리 완료 후 AdMob SDK 초기화
  try {
    const { default: mobileAds } = require('react-native-google-mobile-ads');
    await mobileAds().initialize();
    adsInitialized = true;
    console.log('[Ads] SDK initialized successfully');
  } catch (e) {
    console.warn('[Ads] SDK initialization failed:', e);
  }
}
