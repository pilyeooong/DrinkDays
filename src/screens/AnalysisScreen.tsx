import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useSettings } from '../contexts/SettingsContext';
import { StatCard } from '../components/StatCard';
import { WeeklyChart } from '../components/WeeklyChart';
import { useDrinkRecords } from '../hooks/useDrinkRecords';
import {
  useT,
  formatCurrency,
  formatCostDiffWithCurrency,
  formatDrinkAmountI18n,
} from '../constants/i18n';

type PeriodKey = 'weekly' | 'monthly' | 'yearly';

// ─── 기간 네비게이터 ───
function PeriodNav({ label, onPrev, onNext }: { label: string; onPrev: () => void; onNext: () => void }) {
  return (
    <View style={styles.periodNav}>
      <TouchableOpacity onPress={onPrev} style={styles.periodNavBtn} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
      </TouchableOpacity>
      <Text style={styles.periodNavLabel}>{label}</Text>
      <TouchableOpacity onPress={onNext} style={styles.periodNavBtn} activeOpacity={0.7}>
        <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
}

export function AnalysisScreen() {
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const gpb = settings.glassesPerBottle;
  const currency = settings.currency;
  const t = useT();
  const now = new Date();
  const [period, setPeriod] = useState<PeriodKey>('monthly');

  const periodTabs: { key: PeriodKey; label: string }[] = [
    { key: 'weekly', label: t.analysis.weekly },
    { key: 'monthly', label: t.analysis.monthly },
    { key: 'yearly', label: t.analysis.yearly },
  ];

  // 월간 상태
  const [mYear, setMYear] = useState(now.getFullYear());
  const [mMonth, setMMonth] = useState(now.getMonth());

  // 주간 상태 (offset: 0=이번주, -1=지난주)
  const [weekOffset, setWeekOffset] = useState(0);

  // 연간 상태
  const [aYear, setAYear] = useState(now.getFullYear());

  const {
    getMonthlyDrinkingDays,
    getMonthlyEstimatedCost,
    getMonthlyDrinkAmount,
    getMonthlyCostComparison,
    getMonthComparison,
    getWeeklyBreakdown,
    getYearlyBreakdown,
    getWeekBreakdownByOffset,
    getWeekLabel,
    getWeekDrinkingDaysByOffset,
    getWeeklyEstimatedCost,
    getWeeklyDrinkAmount,
    getWeekComparison,
    getWeeklyCostComparison,
    getYearlyDrinkingDays,
    getYearlyEstimatedCost,
    getYearlyCostComparison,
    getYearlyDrinkAmount,
    getCurrentSoberStreak,
    getLongestSoberStreak,
    getFavoriteDrinkingDay,
    getWeeklySoberRate,
    getMonthlySoberRate,
    getYearlySoberRate,
    getDayOfWeekPattern,
  } = useDrinkRecords();

  const currentStreak = getCurrentSoberStreak();
  const longestStreak = getLongestSoberStreak();
  const favDay = getFavoriteDrinkingDay();
  const dayPattern = getDayOfWeekPattern();

  // 월간 네비게이션
  const prevMonth = () => {
    if (mMonth === 0) { setMMonth(11); setMYear((y) => y - 1); }
    else setMMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (mMonth === 11) { setMMonth(0); setMYear((y) => y + 1); }
    else setMMonth((m) => m + 1);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.lg }]}>
        <Text style={styles.headerTitle}>{t.analysis.title}</Text>
      </View>

      {/* Period Tabs */}
      <View style={styles.tabRow}>
        {periodTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, period === tab.key && styles.tabActive]}
            onPress={() => setPeriod(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, period === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {period === 'weekly' && (
          <>
            <PeriodNav
              label={getWeekLabel(weekOffset)}
              onPrev={() => setWeekOffset((o) => o - 1)}
              onNext={() => setWeekOffset((o) => o + 1)}
            />
            <WeeklyView
              data={getWeekBreakdownByOffset(weekOffset)}
              drinkingDays={getWeekDrinkingDaysByOffset(weekOffset)}
              estimatedCost={getWeeklyEstimatedCost(weekOffset)}
              costComparison={getWeeklyCostComparison(weekOffset)}
              drinkAmount={getWeeklyDrinkAmount(weekOffset)}
              comparison={getWeekComparison(weekOffset)}
              weekOffset={weekOffset}
              gpb={gpb}
              currency={currency}
              t={t}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              soberRate={getWeeklySoberRate(weekOffset)}
              favDay={favDay}
              dayPattern={dayPattern}
            />
          </>
        )}
        {period === 'monthly' && (
          <>
            <PeriodNav
              label={t.yearMonth(mYear, mMonth)}
              onPrev={prevMonth}
              onNext={nextMonth}
            />
            <MonthlyView
              drinkingDays={getMonthlyDrinkingDays(mYear, mMonth)}
              estimatedCost={getMonthlyEstimatedCost(mYear, mMonth)}
              costComparison={getMonthlyCostComparison(mYear, mMonth)}
              drinkAmount={getMonthlyDrinkAmount(mYear, mMonth)}
              comparison={getMonthComparison(mYear, mMonth)}
              weeklyData={getWeeklyBreakdown(mYear, mMonth)}
              gpb={gpb}
              currency={currency}
              t={t}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              soberRate={getMonthlySoberRate(mYear, mMonth)}
              favDay={favDay}
            />
          </>
        )}
        {period === 'yearly' && (
          <>
            <PeriodNav
              label={t.yearLabel(aYear)}
              onPrev={() => setAYear((y) => y - 1)}
              onNext={() => setAYear((y) => y + 1)}
            />
            <YearlyView
              year={aYear}
              yearlyData={getYearlyBreakdown(aYear)}
              totalDays={getYearlyDrinkingDays(aYear)}
              totalCost={getYearlyEstimatedCost(aYear)}
              costComparison={getYearlyCostComparison(aYear)}
              drinkAmount={getYearlyDrinkAmount(aYear)}
              gpb={gpb}
              currency={currency}
              t={t}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              soberRate={getYearlySoberRate(aYear)}
              favDay={favDay}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── 주간 뷰 ───
function WeeklyView({ data, drinkingDays, estimatedCost, costComparison, drinkAmount, comparison, weekOffset, gpb, currency, t, currentStreak, longestStreak, soberRate, favDay, dayPattern }: {
  data: { day: string; drank: boolean; date: string }[];
  drinkingDays: number;
  estimatedCost: number;
  costComparison: number;
  drinkAmount: { bottles: number; glasses: number };
  comparison: number;
  weekOffset: number;
  gpb: number;
  currency: 'KRW' | 'USD';
  t: ReturnType<typeof useT>;
  currentStreak: number;
  longestStreak: number;
  soberRate: number;
  favDay: { dayIndex: number; count: number } | null;
  dayPattern: number[];
}) {
  const today = new Date();
  const todayLabel = weekOffset === 0 ? t.weekdays[today.getDay()] : '';
  const comparisonText = comparison >= 0 ? `+${comparison}` : `${comparison}`;
  const costDiff = formatCostDiffWithCurrency(costComparison, t.costDiffLabel.weekly, currency);

  return (
    <>
      <View style={styles.mainStatCard}>
        <Text style={styles.mainStatLabel}>{t.analysis.weeklyDrink}</Text>
        <Text style={styles.mainStatValue}>{drinkingDays}</Text>
        <Text style={styles.mainStatUnit}>{t.dayUnit}</Text>
        <Text style={styles.drinkAmountText}>{formatDrinkAmountI18n(drinkAmount, gpb, t)}</Text>
      </View>

      <View style={styles.statRow}>
        <StatCard
          icon="cash-outline"
          iconColor={COLORS.accent}
          iconBg={COLORS.accent + '20'}
          label={t.analysis.estimatedCost}
          value={formatCurrency(estimatedCost, currency)}
          sub={costDiff.text}
          subColor={costDiff.color}
        />
        <StatCard
          icon={comparison <= 0 ? 'trending-down-outline' : 'trending-up-outline'}
          iconColor={comparison <= 0 ? '#34D399' : COLORS.primary}
          iconBg={comparison <= 0 ? '#34D39920' : COLORS.primary + '20'}
          label={t.analysis.vsLastWeek}
          value={comparisonText}
          suffix={t.dayUnit}
          valueColor={comparison <= 0 ? '#34D399' : COLORS.primary}
        />
      </View>

      <View style={styles.weekDayRow}>
        {data.map((item) => {
          const isToday = item.day === todayLabel;
          return (
            <View key={item.date} style={styles.weekDayItem}>
              <Text style={[styles.weekDayLabel, isToday && styles.weekDayLabelToday]}>{item.day}</Text>
              <View style={[
                styles.weekDayCircle,
                item.drank && styles.weekDayDrank,
                !item.drank && styles.weekDaySober,
                isToday && !item.drank && styles.weekDayToday,
              ]}>
                {item.drank ? (
                  <Ionicons name="wine" size={18} color={COLORS.white} />
                ) : (
                  <Ionicons name="checkmark" size={18} color="#34D399" />
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.statRow}>
        <StatCard
          icon="flame-outline"
          iconColor="#F59E0B"
          iconBg="#F59E0B20"
          label={t.analysis.currentStreak}
          value={`${currentStreak}`}
          suffix={t.dayUnit}
          valueColor="#F59E0B"
        />
        <StatCard
          icon="trophy-outline"
          iconColor="#8B5CF6"
          iconBg="#8B5CF620"
          label={t.analysis.longestStreak}
          value={`${longestStreak}`}
          suffix={t.dayUnit}
          valueColor="#8B5CF6"
        />
      </View>

      <View style={styles.statRow}>
        <StatCard
          icon="shield-checkmark-outline"
          iconColor="#34D399"
          iconBg="#34D39920"
          label={t.analysis.soberRate}
          value={`${soberRate}%`}
          valueColor="#34D399"
        />
        <StatCard
          icon="calendar-outline"
          iconColor={COLORS.accent}
          iconBg={COLORS.accent + '20'}
          label={t.analysis.favoriteDrinkDay}
          value={favDay ? t.weekdays[favDay.dayIndex] : '-'}
          sub={favDay ? t.analysis.times(favDay.count) : ''}
        />
      </View>

      {/* 요일별 음주 패턴 바차트 */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={[styles.chartIconWrap, { backgroundColor: COLORS.accent + '15' }]}>
            <Ionicons name="stats-chart-outline" size={22} color={COLORS.accent} />
          </View>
          <Text style={styles.chartTitle}>{t.analysis.dayPattern}</Text>
        </View>
        <View style={styles.dayPatternBars}>
          {dayPattern.map((count, i) => {
            const max = Math.max(...dayPattern, 1);
            return (
              <View key={i} style={styles.dayPatternCol}>
                <Text style={styles.dayPatternValue}>{count}</Text>
                <View style={styles.dayPatternTrack}>
                  <View
                    style={[
                      styles.dayPatternBar,
                      { height: Math.round((count / max) * 80) },
                    ]}
                  />
                </View>
                <Text style={styles.dayPatternLabel}>{t.weekdaysMon[i]}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </>
  );
}

// ─── 월간 뷰 ───
function MonthlyView({ drinkingDays, estimatedCost, costComparison, drinkAmount, comparison, weeklyData, gpb, currency, t, currentStreak, longestStreak, soberRate, favDay }: {
  drinkingDays: number;
  estimatedCost: number;
  costComparison: number;
  drinkAmount: { bottles: number; glasses: number };
  comparison: number;
  weeklyData: { week: string; days: number }[];
  gpb: number;
  currency: 'KRW' | 'USD';
  t: ReturnType<typeof useT>;
  currentStreak: number;
  longestStreak: number;
  soberRate: number;
  favDay: { dayIndex: number; count: number } | null;
}) {
  const comparisonText = comparison >= 0 ? `+${comparison}` : `${comparison}`;
  const costDiff = formatCostDiffWithCurrency(costComparison, t.costDiffLabel.monthly, currency);

  return (
    <>
      <View style={styles.mainStatCard}>
        <Text style={styles.mainStatLabel}>{t.analysis.monthlyDrink}</Text>
        <Text style={styles.mainStatValue}>{drinkingDays}</Text>
        <Text style={styles.mainStatUnit}>{t.analysis.totalDrinkDays}</Text>
        <Text style={styles.drinkAmountText}>{formatDrinkAmountI18n(drinkAmount, gpb, t)}</Text>
      </View>

      <View style={styles.statRow}>
        <StatCard
          icon="cash-outline"
          iconColor={COLORS.accent}
          iconBg={COLORS.accent + '20'}
          label={t.analysis.estimatedCost}
          value={formatCurrency(estimatedCost, currency)}
          sub={costDiff.text}
          subColor={costDiff.color}
        />
        <StatCard
          icon={comparison <= 0 ? 'trending-down-outline' : 'trending-up-outline'}
          iconColor={comparison <= 0 ? '#34D399' : COLORS.primary}
          iconBg={comparison <= 0 ? '#34D39920' : COLORS.primary + '20'}
          label={t.analysis.vsLastMonth}
          value={comparisonText}
          suffix={t.dayUnit}
          valueColor={comparison <= 0 ? '#34D399' : COLORS.primary}
        />
      </View>

      <WeeklyChart data={weeklyData} />

      <View style={styles.statRow}>
        <StatCard
          icon="flame-outline"
          iconColor="#F59E0B"
          iconBg="#F59E0B20"
          label={t.analysis.currentStreak}
          value={`${currentStreak}`}
          suffix={t.dayUnit}
          valueColor="#F59E0B"
        />
        <StatCard
          icon="trophy-outline"
          iconColor="#8B5CF6"
          iconBg="#8B5CF620"
          label={t.analysis.longestStreak}
          value={`${longestStreak}`}
          suffix={t.dayUnit}
          valueColor="#8B5CF6"
        />
      </View>

      <View style={styles.statRow}>
        <StatCard
          icon="shield-checkmark-outline"
          iconColor="#34D399"
          iconBg="#34D39920"
          label={t.analysis.soberRate}
          value={`${soberRate}%`}
          valueColor="#34D399"
        />
        <StatCard
          icon="calendar-outline"
          iconColor={COLORS.accent}
          iconBg={COLORS.accent + '20'}
          label={t.analysis.favoriteDrinkDay}
          value={favDay ? t.weekdays[favDay.dayIndex] : '-'}
          sub={favDay ? t.analysis.times(favDay.count) : ''}
        />
      </View>
    </>
  );
}

// ─── 연간 뷰 ───
function YearlyView({ year, yearlyData, totalDays, totalCost, costComparison, drinkAmount, gpb, currency, t, currentStreak, longestStreak, soberRate, favDay }: {
  year: number;
  yearlyData: { month: string; days: number }[];
  totalDays: number;
  totalCost: number;
  costComparison: number;
  drinkAmount: { bottles: number; glasses: number };
  gpb: number;
  currency: 'KRW' | 'USD';
  t: ReturnType<typeof useT>;
  currentStreak: number;
  longestStreak: number;
  soberRate: number;
  favDay: { dayIndex: number; count: number } | null;
}) {
  const maxDays = Math.max(...yearlyData.map((d) => d.days), 1);
  const costDiff = formatCostDiffWithCurrency(costComparison, t.costDiffLabel.yearly, currency);

  return (
    <>
      <View style={styles.mainStatCard}>
        <Text style={styles.mainStatLabel}>{t.analysis.yearTotalDrink(year)}</Text>
        <Text style={styles.mainStatValue}>{totalDays}</Text>
        <Text style={styles.mainStatUnit}>{t.analysis.totalDrinkDays}</Text>
        <Text style={styles.drinkAmountText}>{formatDrinkAmountI18n(drinkAmount, gpb, t)}</Text>
      </View>

      <View style={styles.statRow}>
        <StatCard
          icon="cash-outline"
          iconColor={COLORS.accent}
          iconBg={COLORS.accent + '20'}
          label={t.analysis.yearlyEstimatedCost}
          value={formatCurrency(totalCost, currency)}
          sub={costDiff.text}
          subColor={costDiff.color}
        />
        <StatCard
          icon="calendar-outline"
          iconColor="#3B82F6"
          iconBg="rgba(59,130,246,0.1)"
          label={t.analysis.monthlyAvg}
          value={yearlyData.length > 0 ? (totalDays / yearlyData.length).toFixed(1) : '0'}
          suffix={t.dayUnit}
          valueColor="#3B82F6"
        />
      </View>

      {/* 월별 바 차트 */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={styles.chartIconWrap}>
            <Ionicons name="bar-chart-outline" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.chartTitle}>{t.analysis.monthlyDrinkDays}</Text>
        </View>
        {yearlyData.length > 0 ? (
          <View style={styles.yearlyBars}>
            {yearlyData.map((item) => (
              <View key={item.month} style={styles.yearlyBarCol}>
                <Text style={styles.yearlyBarValue}>{item.days}</Text>
                <View style={styles.yearlyBarTrack}>
                  <View
                    style={[
                      styles.yearlyBar,
                      { height: Math.round((item.days / maxDays) * 110) },
                    ]}
                  />
                </View>
                <Text style={styles.yearlyBarLabel}>{item.month}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>{t.analysis.noData}</Text>
        )}
      </View>

      <View style={styles.statRow}>
        <StatCard
          icon="flame-outline"
          iconColor="#F59E0B"
          iconBg="#F59E0B20"
          label={t.analysis.currentStreak}
          value={`${currentStreak}`}
          suffix={t.dayUnit}
          valueColor="#F59E0B"
        />
        <StatCard
          icon="trophy-outline"
          iconColor="#8B5CF6"
          iconBg="#8B5CF620"
          label={t.analysis.longestStreak}
          value={`${longestStreak}`}
          suffix={t.dayUnit}
          valueColor="#8B5CF6"
        />
      </View>

      <View style={styles.statRow}>
        <StatCard
          icon="shield-checkmark-outline"
          iconColor="#34D399"
          iconBg="#34D39920"
          label={t.analysis.soberRate}
          value={`${soberRate}%`}
          valueColor="#34D399"
        />
        <StatCard
          icon="calendar-outline"
          iconColor={COLORS.accent}
          iconBg={COLORS.accent + '20'}
          label={t.analysis.favoriteDrinkDay}
          value={favDay ? t.weekdays[favDay.dayIndex] : '-'}
          sub={favDay ? t.analysis.times(favDay.count) : ''}
        />
      </View>
    </>
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
  // Period nav
  periodNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  periodNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodNavLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING['2xl'],
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
    color: COLORS.gray500,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  // Scroll
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: SPACING['2xl'],
    paddingBottom: 120,
    gap: SPACING['2xl'],
  },
  // Main stat
  mainStatCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING['3xl'],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  mainStatLabel: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray600,
    marginBottom: SPACING.md,
  },
  mainStatValue: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '900',
    color: COLORS.primary,
    lineHeight: FONT_SIZE.hero * 1.1,
    marginBottom: SPACING.xs,
  },
  mainStatUnit: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '500',
    color: COLORS.gray700,
  },
  drinkAmountText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.accent,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  statRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  // Weekly view
  weekDayRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING['2xl'],
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  weekDayItem: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  weekDayLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  weekDayLabelToday: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  weekDayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayDrank: {
    backgroundColor: COLORS.primary,
  },
  weekDaySober: {
    backgroundColor: '#34D39920',
  },
  weekDayToday: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  // Yearly chart
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  chartIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  chartTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  yearlyBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  yearlyBarCol: {
    flex: 1,
    alignItems: 'center',
    height: 160,
    justifyContent: 'flex-end',
  },
  yearlyBarValue: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
  },
  yearlyBarTrack: {
    width: '60%' as unknown as number,
    height: 110,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  yearlyBar: {
    width: '100%' as unknown as number,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  yearlyBarLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: FONT_SIZE.base,
    color: COLORS.gray400,
    paddingVertical: SPACING['3xl'],
  },
  // Day-of-week pattern chart
  dayPatternBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 130,
  },
  dayPatternCol: {
    flex: 1,
    alignItems: 'center',
    height: 130,
    justifyContent: 'flex-end',
  },
  dayPatternValue: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
  },
  dayPatternTrack: {
    width: '60%' as unknown as number,
    height: 80,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  dayPatternBar: {
    width: '100%' as unknown as number,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.sm,
  },
  dayPatternLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
});
