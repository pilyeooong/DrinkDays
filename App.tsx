import React, { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initializeAds } from './src/services/ads';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { RecordsProvider } from './src/contexts/RecordsContext';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [adsReady, setAdsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      // 1. splash 완전히 숨기기
      await SplashScreen.hideAsync();

      // 2. splash 애니메이션이 완전히 끝날 때까지 대기
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. ATT 다이얼로그 + AdMob 초기화
      try {
        await initializeAds();
      } catch (e) {
        console.warn('Ad init failed:', e);
      }

      setAdsReady(true);

      // 개발 모드에서 ATT 결과 확인용
      if (__DEV__ && Platform.OS === 'ios') {
        try {
          const { getTrackingPermissionsAsync } = require('expo-tracking-transparency');
          const { status } = await getTrackingPermissionsAsync();
          Alert.alert('ATT Status', `Current status: ${status}`);
        } catch (e) {
          Alert.alert('ATT Error', String(e));
        }
      }
    }
    prepare();
  }, []);

  return (
    <SettingsProvider>
      <RecordsProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </RecordsProvider>
    </SettingsProvider>
  );
}
