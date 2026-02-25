import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, BORDER_RADIUS, SPACING } from '../constants/theme';
import { isTrackingGranted, isAdsInitialized } from '../services/ads';

let BannerAdComponent: React.ComponentType<any> | null = null;
let BannerAdSizeValue: string | null = null;
let moduleLoadError: string | null = null;

try {
  const ads = require('react-native-google-mobile-ads');
  BannerAdComponent = ads.BannerAd;
  BannerAdSizeValue = ads.BannerAdSize.ANCHORED_ADAPTIVE_BANNER;
  console.log('[AdBanner] Module loaded OK');
} catch (e: any) {
  moduleLoadError = e?.message ?? 'unknown';
  console.warn('[AdBanner] Module load failed:', e);
}

interface AdBannerProps {
  unitId: string;
}

export function AdBanner({ unitId }: AdBannerProps) {
  const [adError, setAdError] = useState<string | null>(null);

  // AdMob SDK가 초기화되기 전에는 광고를 렌더링하지 않음
  // ATT 권한 처리가 완료된 후에만 광고 요청
  if (!isAdsInitialized()) {
    return null;
  }

  if (!BannerAdComponent || !BannerAdSizeValue) {
    if (!__DEV__) return null;
    return (
      <View style={styles.placeholder}>
        <View style={styles.placeholderInner}>
          <Text style={styles.placeholderText}>
            Ad (module: {moduleLoadError ?? 'null'})
          </Text>
        </View>
      </View>
    );
  }

  if (adError) {
    if (!__DEV__) return null;
    return (
      <View style={styles.placeholder}>
        <View style={styles.placeholderInner}>
          <Text style={styles.placeholderText}>Ad ({adError})</Text>
        </View>
      </View>
    );
  }

  return (
    <BannerAdComponent
      unitId={unitId}
      size={BannerAdSizeValue}
      requestOptions={{ requestNonPersonalizedAdsOnly: !isTrackingGranted() }}
      onAdLoaded={() => {
        console.log('[AdBanner] Ad loaded successfully');
      }}
      onAdFailedToLoad={(error: any) => {
        const msg = error?.message ?? error?.code ?? JSON.stringify(error);
        console.warn('[AdBanner] Ad failed to load:', msg);
        setAdError(msg);
      }}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderTopWidth: 1,
    borderTopColor: COLORS.primary + '1A',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING['2xl'],
  },
  placeholderInner: {
    height: 50,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray400,
  },
});
