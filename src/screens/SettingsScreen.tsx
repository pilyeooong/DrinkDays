import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useSettings } from '../contexts/SettingsContext';
import { useT, getDefaultBottlePrice } from '../constants/i18n';

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettings();
  const t = useT();
  const [priceText, setPriceText] = useState(String(settings.bottlePrice));
  const [gpbText, setGpbText] = useState(String(settings.glassesPerBottle));

  useEffect(() => {
    setPriceText(String(settings.bottlePrice));
  }, [settings.bottlePrice]);

  const autoSavePrice = () => {
    const price = parseInt(priceText, 10);
    if (isNaN(price) || price <= 0) {
      setPriceText(String(settings.bottlePrice));
      return;
    }
    if (price !== settings.bottlePrice) {
      updateSettings({ bottlePrice: price });
    }
  };

  const autoSaveGpb = () => {
    const gpb = parseInt(gpbText, 10);
    if (isNaN(gpb) || gpb <= 0) {
      setGpbText(String(settings.glassesPerBottle));
      return;
    }
    if (gpb !== settings.glassesPerBottle) {
      updateSettings({ glassesPerBottle: gpb });
    }
  };

  const priceSuffix = t.settings.perBottle;

  const handleCurrencyChange = async (currency: 'KRW' | 'USD') => {
    if (currency === settings.currency) return;
    const newPrice = getDefaultBottlePrice(currency);
    await updateSettings({ currency, bottlePrice: newPrice });
    setPriceText(String(newPrice));
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.lg }]}>
        <Text style={styles.headerTitle}>{t.settings.title}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Language */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: '#8B5CF620' }]}>
              <Ionicons name="language-outline" size={22} color="#8B5CF6" />
            </View>
            <Text style={styles.sectionTitle}>{t.settings.language}</Text>
          </View>
          <Text style={styles.description}>{t.settings.languageDesc}</Text>
          <View style={styles.presetRow}>
            {([['ko', '한국어'], ['en', 'English']] as const).map(([code, label]) => (
              <TouchableOpacity
                key={code}
                style={[
                  styles.presetButton,
                  settings.language === code && styles.presetButtonActive,
                ]}
                onPress={() => updateSettings({ language: code })}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.presetText,
                  settings.language === code && styles.presetTextActive,
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price (includes currency toggle) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="cash-outline" size={22} color={COLORS.accent} />
            </View>
            <Text style={styles.sectionTitle}>{t.settings.priceSettings}</Text>
          </View>

          <Text style={styles.description}>{t.settings.priceDesc}</Text>

          <Text style={styles.subLabel}>{t.settings.currency}</Text>
          <View style={[styles.presetRow, { marginBottom: SPACING['2xl'] }]}>
            {([['KRW', '₩ 원'], ['USD', '$ USD']] as const).map(([code, label]) => (
              <TouchableOpacity
                key={code}
                style={[
                  styles.presetButton,
                  settings.currency === code && styles.presetButtonActive,
                ]}
                onPress={() => handleCurrencyChange(code)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.presetText,
                  settings.currency === code && styles.presetTextActive,
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={priceText}
              onChangeText={setPriceText}
              onEndEditing={autoSavePrice}
              onBlur={autoSavePrice}
              keyboardType="number-pad"
              placeholder={String(getDefaultBottlePrice(settings.currency))}
              placeholderTextColor={COLORS.gray400}
            />
            <Text style={styles.inputSuffix}>{priceSuffix}</Text>
          </View>

        </View>

        {/* Glass/Bottle Conversion */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: '#3B82F620' }]}>
              <Ionicons name="wine-outline" size={22} color="#3B82F6" />
            </View>
            <Text style={styles.sectionTitle}>{t.settings.glassConvert}</Text>
          </View>

          <Text style={styles.description}>{t.settings.glassConvertDesc}</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={gpbText}
              onChangeText={setGpbText}
              onEndEditing={autoSaveGpb}
              onBlur={autoSaveGpb}
              keyboardType="number-pad"
              placeholder="7"
              placeholderTextColor={COLORS.gray400}
            />
            <Text style={styles.inputSuffix}>{t.settings.glassesEquals}</Text>
          </View>

        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: COLORS.gray100 }]}>
              <Ionicons name="information-circle-outline" size={22} color={COLORS.gray500} />
            </View>
            <Text style={styles.sectionTitle}>{t.settings.appInfo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t.settings.version}</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING['2xl'],
    paddingBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: FONT_SIZE['5xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  scrollInner: {
    padding: SPACING['2xl'],
    paddingBottom: 120,
    gap: SPACING['2xl'],
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  sectionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray500,
    lineHeight: 22,
    marginBottom: SPACING['2xl'],
  },
  subLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.lg,
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '700',
    color: COLORS.gray800,
  },
  inputSuffix: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray500,
    fontWeight: '600',
    marginLeft: SPACING.lg,
  },
  presetRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING['2xl'],
  },
  presetButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  presetButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  presetText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  presetTextActive: {
    color: COLORS.white,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  infoLabel: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray600,
  },
  infoValue: {
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
    color: COLORS.gray800,
  },
});
