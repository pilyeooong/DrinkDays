import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useDrinkRecords } from '../hooks/useDrinkRecords';
import { RecordForm } from '../components/RecordForm';
import { useT } from '../constants/i18n';

export function RecordScreen() {
  const insets = useSafeAreaInsets();
  const { saveRecord, todayKey, getRecordByDate, getCurrentSoberStreak } = useDrinkRecords();
  const t = useT();

  const existingRecord = getRecordByDate(todayKey);
  const streak = getCurrentSoberStreak();

  const getStreakMessage = () => {
    if (!existingRecord) return t.record.todayNotRecorded;
    if (existingRecord.drank) return t.record.todayDrank;
    return t.record.todaySober;
  };

  const handleSave = async (data: { drank: boolean; amount?: number; unit?: '잔' | '병'; note?: string }) => {
    await saveRecord({ date: todayKey, ...data });
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.lg }]}>
        <Text style={styles.headerTitle}>{t.record.title}</Text>
        <Text style={styles.headerSub}>{t.record.subtitle}</Text>
      </View>
      {streak > 0 && (
        <View style={styles.streakCard}>
          <View style={styles.streakRow}>
            <Ionicons name="flame" size={24} color="#F59E0B" />
            <Text style={styles.streakDays}>{t.record.streakDays(streak)}</Text>
            <Text style={styles.streakLabel}>{t.record.currentStreak}</Text>
          </View>
          <Text style={styles.streakMessage}>{getStreakMessage()}</Text>
        </View>
      )}
      <RecordForm
        dateLabel={t.record.question}
        existingRecord={existingRecord}
        onSave={handleSave}
      />
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
    paddingBottom: SPACING['3xl'],
  },
  headerTitle: {
    fontSize: FONT_SIZE['5xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerSub: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.gray400,
    marginTop: SPACING.xs,
    letterSpacing: 2,
  },
  streakCard: {
    marginHorizontal: SPACING['2xl'],
    marginBottom: SPACING.lg,
    backgroundColor: '#FFFBEB',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING['2xl'],
    borderWidth: 1,
    borderColor: '#F59E0B30',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  streakDays: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '800',
    color: '#F59E0B',
  },
  streakLabel: {
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  streakMessage: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginTop: SPACING.sm,
  },
});
