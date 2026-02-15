import { useSettings } from '../contexts/SettingsContext';

type Currency = 'KRW' | 'USD';
type Language = 'ko' | 'en';

const ko = {
  // Tabs
  tabs: {
    record: '기록',
    calendar: '캘린더',
    analysis: '분석',
    settings: '설정',
  },

  // Record Screen
  record: {
    title: '술마신날',
    subtitle: 'DrinkDays',
    question: '오늘 술 마셨나요?',
    currentStreak: '금주 연속',
    streakDays: (n: number) => `${n}일째`,
    todayNotRecorded: '오늘 아직 기록하지 않았어요',
    todaySober: '오늘은 술을 안 마셨어요!',
    todayDrank: '오늘 음주를 기록했어요',
  },

  // RecordForm
  form: {
    drank: '마셨다 🍷',
    didntDrink: '안 마셨다',
    howMuch: '얼마나 마셨나요?',
    glass: '잔',
    bottle: '병',
    memoOptional: '메모 (선택)',
    memoPlaceholder: '예: 회식, 친구 만남',
    save: '저장하기',
    saved: '저장되었습니다',
    recordDone: '기록 완료',
  },

  // Calendar Screen
  calendar: {
    title: '캘린더',
    drinkingDays: '이번 달 음주일',
    day: '일',
    edit: '수정',
    record: '기록',
    amount: '음주량',
    memo: '메모',
    didntDrink: '술을 마시지 않았습니다',
    noRecord: '기록이 없습니다',
    recordIt: '기록하기',
    cancel: '취소',
    drankQuestion: (label: string) => `${label} 술 마셨나요?`,
  },

  // Analysis Screen
  analysis: {
    title: '분석',
    weekly: '주간',
    monthly: '월간',
    yearly: '연간',
    weeklyDrink: '주간 음주',
    monthlyDrink: '월간 음주',
    totalDrinkDays: '총 음주일',
    estimatedCost: '예상 술값',
    yearlyEstimatedCost: '연간 예상 술값',
    vsLastWeek: '지난주 대비',
    vsLastMonth: '지난달 대비',
    vsLastYear: '전년',
    monthlyAvg: '월 평균',
    monthlyDrinkDays: '월별 음주일',
    noData: '데이터가 없습니다',
    weeklyDrinkFreq: '주간 음주 빈도',
    yearTotalDrink: (year: number) => `${year}년 총 음주`,
    currentStreak: '현재 금주 연속',
    longestStreak: '최장 금주 기록',
    soberRate: '금주율',
    favoriteDrinkDay: '주요 음주 요일',
    dayPattern: '요일별 음주 패턴',
    times: (n: number) => `${n}회`,
  },

  // Settings Screen
  settings: {
    title: '설정',
    priceSettings: '술값 설정',
    priceDesc: '1병당 예상 가격을 설정하면 분석 탭에서 예상 술값을 계산합니다.',
    perBottle: '원 / 병',
    save: '저장하기',
    saved: '저장됨!',
    glassConvert: '잔/병 환산',
    glassConvertDesc: '몇 잔을 1병으로 환산할지 설정합니다.',
    glassesEquals: '잔 = 1병',
    appInfo: '앱 정보',
    version: '버전',
    language: '언어',
    languageDesc: '앱 표시 언어를 변경합니다.',
    currency: '통화',
    currencyDesc: '술값 표시 통화를 변경합니다.',
  },

  // Units & formatting
  weekdays: ['일', '월', '화', '수', '목', '금', '토'] as readonly string[],
  weekdaysMon: ['월', '화', '수', '목', '금', '토', '일'] as readonly string[],
  months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'] as readonly string[],
  weekN: (n: number) => `${n}주차`,
  yearMonth: (year: number, month: number) => `${year}년 ${['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'][month]}`,
  monthDay: (month: number, day: number) => `${['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'][month]} ${day}일`,
  yearLabel: (year: number) => `${year}년`,
  bottles: (n: number) => `${n}병`,
  glasses: (n: number) => `${n}잔`,
  zeroGlasses: '0잔',
  dayUnit: '일',

  // Display labels for units (data keys '잔'/'병' stay the same)
  unitDisplay: { '잔': '잔', '병': '병' } as Record<string, string>,

  // Cost diff labels
  costDiffLabel: {
    weekly: '지난주',
    monthly: '지난달',
    yearly: '전년',
  },
};

const en: typeof ko = {
  tabs: {
    record: 'Record',
    calendar: 'Calendar',
    analysis: 'Analysis',
    settings: 'Settings',
  },

  record: {
    title: 'DrinkDays',
    subtitle: 'DrinkDays',
    question: 'Did you drink today?',
    currentStreak: 'Sober Streak',
    streakDays: (n: number) => `${n} days`,
    todayNotRecorded: "You haven't recorded today yet",
    todaySober: "You didn't drink today!",
    todayDrank: "Today's drink recorded",
  },

  form: {
    drank: 'Drank 🍷',
    didntDrink: "Didn't drink",
    howMuch: 'How much did you drink?',
    glass: 'Glass',
    bottle: 'Bottle',
    memoOptional: 'Memo (optional)',
    memoPlaceholder: 'e.g. company dinner, met friends',
    save: 'Save',
    saved: 'Saved!',
    recordDone: 'Recorded',
  },

  calendar: {
    title: 'Calendar',
    drinkingDays: 'Drinking days this month',
    day: 'days',
    edit: 'Edit',
    record: 'Record',
    amount: 'Amount',
    memo: 'Memo',
    didntDrink: "Didn't drink",
    noRecord: 'No record',
    recordIt: 'Record',
    cancel: 'Cancel',
    drankQuestion: (label: string) => `Did you drink on ${label}?`,
  },

  analysis: {
    title: 'Analysis',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    weeklyDrink: 'Weekly Drinks',
    monthlyDrink: 'Monthly Drinks',
    totalDrinkDays: 'Total Drink Days',
    estimatedCost: 'Est. Cost',
    yearlyEstimatedCost: 'Yearly Est. Cost',
    vsLastWeek: 'vs Last Week',
    vsLastMonth: 'vs Last Month',
    vsLastYear: 'vs Last Year',
    monthlyAvg: 'Monthly Avg',
    monthlyDrinkDays: 'Monthly Drink Days',
    noData: 'No data available',
    weeklyDrinkFreq: 'Weekly Drink Frequency',
    yearTotalDrink: (year: number) => `${year} Total Drinks`,
    currentStreak: 'Current Sober Streak',
    longestStreak: 'Longest Streak',
    soberRate: 'Sober Rate',
    favoriteDrinkDay: 'Top Drink Day',
    dayPattern: 'Day-of-Week Pattern',
    times: (n: number) => `${n} times`,
  },

  settings: {
    title: 'Settings',
    priceSettings: 'Price Settings',
    priceDesc: 'Set the estimated price per bottle to calculate costs in the analysis tab.',
    perBottle: '$ / bottle',
    save: 'Save',
    saved: 'Saved!',
    glassConvert: 'Glass/Bottle Conversion',
    glassConvertDesc: 'Set how many glasses equal 1 bottle.',
    glassesEquals: 'glasses = 1 bottle',
    appInfo: 'App Info',
    version: 'Version',
    language: 'Language',
    languageDesc: 'Change the app display language.',
    currency: 'Currency',
    currencyDesc: 'Change the currency for cost display.',
  },

  weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as readonly string[],
  weekdaysMon: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as readonly string[],
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as readonly string[],
  weekN: (n: number) => `Week ${n}`,
  yearMonth: (year: number, month: number) => `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month]} ${year}`,
  monthDay: (month: number, day: number) => `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month]} ${day}`,
  yearLabel: (year: number) => `${year}`,
  bottles: (n: number) => `${n} bottles`,
  glasses: (n: number) => `${n} glasses`,
  zeroGlasses: '0 glasses',
  dayUnit: 'days',

  unitDisplay: { '잔': 'glass', '병': 'bottle' } as Record<string, string>,

  costDiffLabel: {
    weekly: 'vs last week',
    monthly: 'vs last month',
    yearly: 'vs last year',
  },
};

const translations = { ko, en };

export type Translations = typeof ko;

export function useT(): Translations {
  const { settings } = useSettings();
  return translations[settings.language] ?? translations.ko;
}

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === 'USD') {
    return `$${amount.toLocaleString()}`;
  }
  return `${amount.toLocaleString()}원`;
}

export function formatCostDiffWithCurrency(
  diff: number,
  label: string,
  currency: Currency,
): { text: string; color: string } {
  if (diff === 0) return { text: '', color: '' };
  const sign = diff > 0 ? '+' : '';
  const costStr = currency === 'USD'
    ? `$${Math.abs(diff).toLocaleString()}`
    : `${Math.abs(diff).toLocaleString()}원`;
  const signedCost = diff > 0 ? `+${costStr}` : `-${costStr}`;
  return {
    text: `${label} ${signedCost}`,
    color: diff <= 0 ? '#34D399' : '#EF4444',
  };
}

export function formatDrinkAmountI18n(
  amount: { bottles: number; glasses: number },
  gpb: number,
  t: Translations,
): string {
  const totalBottles = amount.bottles + Math.floor(amount.glasses / gpb);
  const remainGlasses = amount.glasses % gpb;
  const parts: string[] = [];
  if (totalBottles > 0) parts.push(t.bottles(totalBottles));
  if (remainGlasses > 0) parts.push(t.glasses(remainGlasses));
  return parts.length > 0 ? parts.join(' ') : t.zeroGlasses;
}

export function getCurrencySymbol(currency: Currency): string {
  return currency === 'USD' ? '$' : '₩';
}

export function getPresetPrices(currency: Currency): number[] {
  return currency === 'USD' ? [3, 5, 8, 10] : [2000, 3000, 4000, 5000];
}

export function getDefaultBottlePrice(currency: Currency): number {
  return currency === 'USD' ? 2 : 2000;
}
