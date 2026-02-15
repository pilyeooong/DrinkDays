import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  suffix?: string;
  valueColor?: string;
  sub?: string;
  subColor?: string;
}

export function StatCard({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  suffix,
  valueColor = COLORS.gray900,
  sub,
  subColor,
}: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>
        {value}
        <Text style={styles.suffix}>{suffix}</Text>
      </Text>
      {sub ? <Text style={[styles.sub, subColor ? { color: subColor } : undefined]}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.sm,
  },
  value: {
    fontSize: FONT_SIZE['3xl'],
    fontWeight: '700',
  },
  suffix: {
    fontSize: FONT_SIZE.lg,
    marginLeft: 2,
  },
  sub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray400,
    marginTop: SPACING.xs,
  },
});
