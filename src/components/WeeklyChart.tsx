import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useT } from '../constants/i18n';

interface WeeklyChartProps {
  data: { week: string; days: number }[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const t = useT();
  const maxDays = Math.max(...data.map((d) => d.days), 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="bar-chart-outline" size={22} color="#3B82F6" />
        </View>
        <Text style={styles.title}>{t.analysis.weeklyDrinkFreq}</Text>
      </View>

      <View style={styles.bars}>
        {data.map((item) => (
          <View key={item.week} style={styles.row}>
            <Text style={styles.label}>{item.week}</Text>
            <View style={styles.trackBg}>
              <View
                style={[
                  styles.bar,
                  { width: `${(item.days / maxDays) * 100}%` as unknown as number },
                ]}
              />
            </View>
            <Text style={styles.value}>{item.days}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(59,130,246,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  bars: {
    gap: SPACING.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  label: {
    width: 48,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  trackBg: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  value: {
    width: 32,
    textAlign: 'right',
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.gray900,
  },
});
