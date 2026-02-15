// 한국 공휴일 데이터
// 고정 공휴일 + 음력 기반 공휴일 (연도별 양력 변환)

/** 고정 공휴일 (월은 0-indexed) */
const FIXED_HOLIDAYS: { month: number; day: number; name: string }[] = [
  { month: 0, day: 1, name: '신정' },
  { month: 2, day: 1, name: '삼일절' },
  { month: 4, day: 5, name: '어린이날' },
  { month: 5, day: 6, name: '현충일' },
  { month: 7, day: 15, name: '광복절' },
  { month: 9, day: 3, name: '개천절' },
  { month: 9, day: 9, name: '한글날' },
  { month: 11, day: 25, name: '크리스마스' },
];

/** 음력 기반 공휴일 (양력 변환, 연도별) */
const LUNAR_HOLIDAYS: Record<number, { month: number; day: number; name: string }[]> = {
  2024: [
    { month: 1, day: 9, name: '설날 연휴' },
    { month: 1, day: 10, name: '설날' },
    { month: 1, day: 11, name: '설날 연휴' },
    { month: 1, day: 12, name: '대체공휴일' },
    { month: 3, day: 10, name: '국회의원선거일' },
    { month: 4, day: 6, name: '대체공휴일' },
    { month: 4, day: 15, name: '석가탄신일' },
    { month: 8, day: 16, name: '추석 연휴' },
    { month: 8, day: 17, name: '추석' },
    { month: 8, day: 18, name: '추석 연휴' },
  ],
  2025: [
    { month: 0, day: 28, name: '설날 연휴' },
    { month: 0, day: 29, name: '설날' },
    { month: 0, day: 30, name: '설날 연휴' },
    { month: 2, day: 3, name: '대체공휴일' },
    { month: 4, day: 5, name: '석가탄신일' },
    { month: 4, day: 6, name: '대체공휴일' },
    { month: 9, day: 5, name: '추석 연휴' },
    { month: 9, day: 6, name: '추석' },
    { month: 9, day: 7, name: '추석 연휴' },
    { month: 9, day: 8, name: '대체공휴일' },
  ],
  2026: [
    { month: 1, day: 16, name: '설날 연휴' },
    { month: 1, day: 17, name: '설날' },
    { month: 1, day: 18, name: '설날 연휴' },
    { month: 4, day: 24, name: '석가탄신일' },
    { month: 4, day: 25, name: '대체공휴일' },
    { month: 7, day: 17, name: '대체공휴일' },
    { month: 8, day: 24, name: '추석 연휴' },
    { month: 8, day: 25, name: '추석' },
    { month: 8, day: 26, name: '추석 연휴' },
  ],
  2027: [
    { month: 1, day: 5, name: '설날 연휴' },
    { month: 1, day: 6, name: '설날' },
    { month: 1, day: 7, name: '설날 연휴' },
    { month: 1, day: 8, name: '대체공휴일' },
    { month: 4, day: 13, name: '석가탄신일' },
    { month: 8, day: 14, name: '추석 연휴' },
    { month: 8, day: 15, name: '추석' },
    { month: 8, day: 16, name: '추석 연휴' },
  ],
  2028: [
    { month: 0, day: 26, name: '설날 연휴' },
    { month: 0, day: 27, name: '설날' },
    { month: 0, day: 28, name: '설날 연휴' },
    { month: 4, day: 2, name: '석가탄신일' },
    { month: 9, day: 2, name: '추석 연휴' },
    { month: 9, day: 3, name: '추석' },
    { month: 9, day: 4, name: '추석 연휴' },
  ],
};

/**
 * 특정 월의 공휴일 날짜 Set을 반환
 * @param year 연도
 * @param month 0-indexed 월
 */
export function getHolidaysForMonth(year: number, month: number): Set<number> {
  const days = new Set<number>();

  for (const h of FIXED_HOLIDAYS) {
    if (h.month === month) {
      days.add(h.day);
    }
  }

  const lunarForYear = LUNAR_HOLIDAYS[year];
  if (lunarForYear) {
    for (const h of lunarForYear) {
      if (h.month === month) {
        days.add(h.day);
      }
    }
  }

  return days;
}
