import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import { getHolidaysForMonth } from '../constants/holidays';
import { useT } from '../constants/i18n';

interface CalendarProps {
  year: number;
  month: number; // 0-indexed
  drinkingDays: Set<number>;
  soberDays: Set<number>;
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function Calendar({
  year,
  month,
  drinkingDays,
  soberDays,
  selectedDay,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
}: CalendarProps) {
  const t = useT();
  const holidays = getHolidaysForMonth(year, month);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <View style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onPrevMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{t.yearMonth(year, month)}</Text>
        <TouchableOpacity onPress={onNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekRow}>
        {t.weekdays.map((day, i) => (
          <View key={`${day}-${i}`} style={styles.weekCell}>
            <Text style={[styles.weekText, i === 0 && styles.sundayText]}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Day Grid */}
      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) {
            return <View key={`empty-${i}`} style={styles.dayCell} />;
          }

          const isSelected = day === selectedDay;
          const isDrinking = drinkingDays.has(day);
          const isSober = soberDays.has(day);
          const hasRecord = isDrinking || isSober;
          const isSunday = (firstDayOfWeek + day - 1) % 7 === 0;
          const isHoliday = holidays.has(day);

          return (
            <TouchableOpacity
              key={day}
              style={styles.dayCell}
              onPress={() => onSelectDay(day)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.dayCircle,
                  isSelected && styles.selectedCircle,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    (isSunday || isHoliday) && !isSelected && styles.holidayText,
                    isSelected && styles.dayTextActive,
                  ]}
                >
                  {day}
                </Text>
              </View>
              {hasRecord && (
                <View
                  style={[
                    styles.dot,
                    isDrinking ? styles.dotDrank : styles.dotSober,
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const CELL_SIZE = `${100 / 7}%` as unknown as number;

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
    justifyContent: 'space-between',
    marginBottom: SPACING['3xl'],
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  weekText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
  },
  sundayText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: SPACING.sm,
  },
  dayCell: {
    width: '14.28%' as unknown as number,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCircle: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dayText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray800,
  },
  dayTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  holidayText: {
    color: '#EF4444',
  },
  dot: {
    position: 'absolute',
    bottom: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotDrank: {
    backgroundColor: COLORS.primary,
  },
  dotSober: {
    backgroundColor: '#34D399',
  },
});
