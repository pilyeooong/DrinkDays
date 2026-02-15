import { useCallback } from 'react';
import { useRecords } from '../contexts/RecordsContext';
import { useSettings } from '../contexts/SettingsContext';
import { useT } from '../constants/i18n';

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function useDrinkRecords() {
  const { records, loading, saveRecord } = useRecords();
  const { settings } = useSettings();
  const bottlePrice = settings.bottlePrice;
  const glassesPerBottle = settings.glassesPerBottle;
  const t = useT();

  const getRecordByDate = useCallback(
    (date: string) => records.find((r) => r.date === date),
    [records],
  );

  const getRecordsForMonth = useCallback(
    (year: number, month: number) =>
      records.filter((r) => {
        const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        return r.date.startsWith(prefix);
      }),
    [records],
  );

  const getDrinkingDatesForMonth = useCallback(
    (year: number, month: number): Set<number> => {
      const monthRecords = getRecordsForMonth(year, month);
      const days = new Set<number>();
      for (const r of monthRecords) {
        if (r.drank) {
          days.add(parseInt(r.date.split('-')[2], 10));
        }
      }
      return days;
    },
    [getRecordsForMonth],
  );

  const getSoberDatesForMonth = useCallback(
    (year: number, month: number): Set<number> => {
      const monthRecords = getRecordsForMonth(year, month);
      const days = new Set<number>();
      for (const r of monthRecords) {
        if (!r.drank) {
          days.add(parseInt(r.date.split('-')[2], 10));
        }
      }
      return days;
    },
    [getRecordsForMonth],
  );

  const getMonthlyDrinkingDays = useCallback(
    (year: number, month: number): number => getDrinkingDatesForMonth(year, month).size,
    [getDrinkingDatesForMonth],
  );

  const getMonthlyEstimatedCost = useCallback(
    (year: number, month: number): number => {
      const monthRecords = getRecordsForMonth(year, month);
      let totalBottles = 0;
      for (const r of monthRecords) {
        if (!r.drank || !r.amount) continue;
        if (r.unit === '병') {
          totalBottles += r.amount;
        } else {
          totalBottles += r.amount / glassesPerBottle;
        }
      }
      return Math.round(totalBottles * bottlePrice);
    },
    [getRecordsForMonth, bottlePrice, glassesPerBottle],
  );

  const getMonthlyDrinkAmount = useCallback(
    (year: number, month: number): { bottles: number; glasses: number } => {
      const monthRecords = getRecordsForMonth(year, month);
      let bottles = 0;
      let glasses = 0;
      for (const r of monthRecords) {
        if (!r.drank || !r.amount) continue;
        if (r.unit === '병') bottles += r.amount;
        else glasses += r.amount;
      }
      return { bottles, glasses };
    },
    [getRecordsForMonth],
  );

  const getMonthlyCostComparison = useCallback(
    (year: number, month: number): number => {
      let prevYear = year;
      let prevMonth = month - 1;
      if (prevMonth < 0) { prevMonth = 11; prevYear -= 1; }
      return getMonthlyEstimatedCost(year, month) - getMonthlyEstimatedCost(prevYear, prevMonth);
    },
    [getMonthlyEstimatedCost],
  );

  const getMonthComparison = useCallback(
    (year: number, month: number): number => {
      let prevYear = year;
      let prevMonth = month - 1;
      if (prevMonth < 0) {
        prevMonth = 11;
        prevYear -= 1;
      }
      const current = getMonthlyDrinkingDays(year, month);
      const previous = getMonthlyDrinkingDays(prevYear, prevMonth);
      return current - previous;
    },
    [getMonthlyDrinkingDays],
  );

  const getWeeklyBreakdown = useCallback(
    (year: number, month: number): { week: string; days: number }[] => {
      const drinkingDates = getDrinkingDatesForMonth(year, month);
      const weeks: { week: string; days: number }[] = [];

      for (let w = 0; w < 4; w++) {
        const start = w * 7 + 1;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const end = w === 3 ? daysInMonth : (w + 1) * 7;
        let count = 0;
        for (let d = start; d <= end; d++) {
          if (drinkingDates.has(d)) count++;
        }
        weeks.push({ week: t.weekN(w + 1), days: count });
      }
      return weeks;
    },
    [getDrinkingDatesForMonth, t],
  );

  const getYearlyBreakdown = useCallback(
    (year: number): { month: string; days: number }[] => {
      const result: { month: string; days: number }[] = [];
      const now = new Date();
      const maxMonth = year === now.getFullYear() ? now.getMonth() : 11;
      for (let m = 0; m <= maxMonth; m++) {
        result.push({
          month: t.months[m],
          days: getMonthlyDrinkingDays(year, m),
        });
      }
      return result;
    },
    [getMonthlyDrinkingDays, t],
  );

  const getWeekBreakdownByOffset = useCallback((offset: number): { day: string; drank: boolean; date: string }[] => {
    const today = new Date();
    const mondayOffset = (today.getDay() + 6) % 7; // Mon=0, Tue=1, ..., Sun=6
    const result: { day: string; drank: boolean; date: string }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - mondayOffset + i + offset * 7);
      const key = toDateKey(d);
      const record = records.find((r) => r.date === key);
      result.push({
        day: t.weekdaysMon[i],
        drank: record?.drank === true,
        date: key,
      });
    }
    return result;
  }, [records, t]);

  const getWeekLabel = useCallback((offset: number): string => {
    const today = new Date();
    const mondayOffset = (today.getDay() + 6) % 7;
    const start = new Date(today);
    start.setDate(today.getDate() - mondayOffset + offset * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
    return `${fmt(start)} ~ ${fmt(end)}`;
  }, []);

  const getWeekDrinkingDaysByOffset = useCallback((offset: number): number => {
    return getWeekBreakdownByOffset(offset).filter((d) => d.drank).length;
  }, [getWeekBreakdownByOffset]);

  const getWeeklyEstimatedCost = useCallback((offset: number): number => {
    const today = new Date();
    const mondayOffset = (today.getDay() + 6) % 7;
    let totalBottles = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - mondayOffset + i + offset * 7);
      const key = toDateKey(d);
      const record = records.find((r) => r.date === key);
      if (!record?.drank || !record.amount) continue;
      if (record.unit === '병') {
        totalBottles += record.amount;
      } else {
        totalBottles += record.amount / glassesPerBottle;
      }
    }
    return Math.round(totalBottles * bottlePrice);
  }, [records, bottlePrice, glassesPerBottle]);

  const getWeeklyDrinkAmount = useCallback((offset: number): { bottles: number; glasses: number } => {
    const today = new Date();
    const mondayOffset = (today.getDay() + 6) % 7;
    let bottles = 0;
    let glasses = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - mondayOffset + i + offset * 7);
      const key = toDateKey(d);
      const record = records.find((r) => r.date === key);
      if (!record?.drank || !record.amount) continue;
      if (record.unit === '병') bottles += record.amount;
      else glasses += record.amount;
    }
    return { bottles, glasses };
  }, [records]);

  const getWeekComparison = useCallback((offset: number): number => {
    const current = getWeekDrinkingDaysByOffset(offset);
    const previous = getWeekDrinkingDaysByOffset(offset - 1);
    return current - previous;
  }, [getWeekDrinkingDaysByOffset]);

  const getWeeklyCostComparison = useCallback((offset: number): number => {
    return getWeeklyEstimatedCost(offset) - getWeeklyEstimatedCost(offset - 1);
  }, [getWeeklyEstimatedCost]);

  const getThisWeekBreakdown = useCallback(() => getWeekBreakdownByOffset(0), [getWeekBreakdownByOffset]);
  const getThisWeekDrinkingDays = useCallback(() => getWeekDrinkingDaysByOffset(0), [getWeekDrinkingDaysByOffset]);

  const getYearlyDrinkingDays = useCallback(
    (year: number): number => {
      return records.filter((r) => r.date.startsWith(`${year}`) && r.drank).length;
    },
    [records],
  );

  const getYearlyEstimatedCost = useCallback(
    (year: number): number => {
      const yearRecords = records.filter((r) => r.date.startsWith(`${year}`) && r.drank);
      let totalBottles = 0;
      for (const r of yearRecords) {
        if (!r.amount) continue;
        if (r.unit === '병') {
          totalBottles += r.amount;
        } else {
          totalBottles += r.amount / glassesPerBottle;
        }
      }
      return Math.round(totalBottles * bottlePrice);
    },
    [records, bottlePrice, glassesPerBottle],
  );

  const getYearlyCostComparison = useCallback(
    (year: number): number => {
      return getYearlyEstimatedCost(year) - getYearlyEstimatedCost(year - 1);
    },
    [getYearlyEstimatedCost],
  );

  const getYearlyDrinkAmount = useCallback(
    (year: number): { bottles: number; glasses: number } => {
      const yearRecords = records.filter((r) => r.date.startsWith(`${year}`) && r.drank);
      let bottles = 0;
      let glasses = 0;
      for (const r of yearRecords) {
        if (!r.amount) continue;
        if (r.unit === '병') bottles += r.amount;
        else glasses += r.amount;
      }
      return { bottles, glasses };
    },
    [records],
  );

  const getCurrentSoberStreak = useCallback((): number => {
    const today = new Date();
    let streak = 0;
    for (let i = 0; ; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = toDateKey(d);
      const record = records.find((r) => r.date === key);
      if (!record) {
        if (i === 0) continue; // 오늘 미기록은 skip
        break; // 기록 없는 날은 break
      }
      if (record.drank) break;
      streak++;
    }
    return streak;
  }, [records]);

  const getLongestSoberStreak = useCallback((): number => {
    const soberDates = records
      .filter((r) => !r.drank)
      .map((r) => parseDate(r.date).getTime())
      .sort((a, b) => a - b);
    if (soberDates.length === 0) return 0;
    let max = 1;
    let current = 1;
    for (let i = 1; i < soberDates.length; i++) {
      if (Math.round((soberDates[i] - soberDates[i - 1]) / 86400000) === 1) {
        current++;
        if (current > max) max = current;
      } else {
        current = 1;
      }
    }
    return max;
  }, [records]);

  const getFavoriteDrinkingDay = useCallback((): { dayIndex: number; count: number } | null => {
    const drinkRecords = records.filter((r) => r.drank);
    if (drinkRecords.length === 0) return null;
    const counts = [0, 0, 0, 0, 0, 0, 0]; // Sun~Sat
    for (const r of drinkRecords) {
      const dayOfWeek = parseDate(r.date).getDay();
      counts[dayOfWeek]++;
    }
    let maxIdx = 0;
    for (let i = 1; i < 7; i++) {
      if (counts[i] > counts[maxIdx]) maxIdx = i;
    }
    if (counts[maxIdx] === 0) return null;
    return { dayIndex: maxIdx, count: counts[maxIdx] };
  }, [records]);

  const getWeeklySoberRate = useCallback((offset: number): number => {
    const today = new Date();
    const mondayOffset = (today.getDay() + 6) % 7;
    let total = 0;
    let sober = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - mondayOffset + i + offset * 7);
      const key = toDateKey(d);
      const record = records.find((r) => r.date === key);
      if (!record) continue;
      total++;
      if (!record.drank) sober++;
    }
    return total === 0 ? 0 : Math.round((sober / total) * 100);
  }, [records]);

  const getMonthlySoberRate = useCallback((year: number, month: number): number => {
    const monthRecords = getRecordsForMonth(year, month);
    if (monthRecords.length === 0) return 0;
    const sober = monthRecords.filter((r) => !r.drank).length;
    return Math.round((sober / monthRecords.length) * 100);
  }, [getRecordsForMonth]);

  const getYearlySoberRate = useCallback((year: number): number => {
    const yearRecords = records.filter((r) => r.date.startsWith(`${year}`));
    if (yearRecords.length === 0) return 0;
    const sober = yearRecords.filter((r) => !r.drank).length;
    return Math.round((sober / yearRecords.length) * 100);
  }, [records]);

  const getDayOfWeekPattern = useCallback((): number[] => {
    // Returns [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const drinkRecords = records.filter((r) => r.drank);
    for (const r of drinkRecords) {
      const dayOfWeek = parseDate(r.date).getDay(); // 0=Sun
      // Convert to Mon-based: Mon=0, Tue=1, ..., Sun=6
      const monBased = (dayOfWeek + 6) % 7;
      counts[monBased]++;
    }
    return counts;
  }, [records]);

  const todayKey = toDateKey(new Date());

  return {
    records,
    loading,
    saveRecord,
    getRecordByDate,
    getRecordsForMonth,
    getDrinkingDatesForMonth,
    getSoberDatesForMonth,
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
    getThisWeekBreakdown,
    getThisWeekDrinkingDays,
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
    todayKey,
  };
}
