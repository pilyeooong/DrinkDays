import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrinkRecord, StorageSchema } from '../types/drink';
import { STORAGE_KEY } from '../constants/theme';

const CURRENT_VERSION = 1;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// v0(배열) → v1(스키마) 마이그레이션
function migrateV0toV1(raw: any[]): StorageSchema {
  const records: DrinkRecord[] = raw.map((r) => ({
    id: r.id ?? generateId(),
    date: r.date,
    drank: r.drank,
    amount: r.amount,
    unit: r.unit,
    note: r.note,
    createdAt: r.createdAt ?? new Date().toISOString(),
    updatedAt: r.updatedAt ?? r.createdAt ?? new Date().toISOString(),
  }));
  return { version: 1, records };
}

export async function loadRecords(): Promise<DrinkRecord[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) return [];

  const parsed = JSON.parse(json);

  // v0: 이전 배열 형태 → 마이그레이션
  if (Array.isArray(parsed)) {
    const migrated = migrateV0toV1(parsed);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated.records;
  }

  const schema = parsed as StorageSchema;
  // 향후 버전 마이그레이션 체인 추가 지점
  // if (schema.version < 2) schema = migrateV1toV2(schema);
  return schema.records;
}

export async function saveRecords(records: DrinkRecord[]): Promise<void> {
  const schema: StorageSchema = { version: CURRENT_VERSION, records };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(schema));
}

export { generateId };

// ── 설정 저장/로드 ──
const SETTINGS_KEY = '@drinkdays_settings';

export interface AppSettings {
  bottlePrice: number;
  glassesPerBottle: number;
  language: 'ko' | 'en';
  currency: 'KRW' | 'USD';
}

const DEFAULT_SETTINGS: AppSettings = {
  bottlePrice: 2000,
  glassesPerBottle: 7,
  language: 'ko',
  currency: 'KRW',
};

export async function loadSettings(): Promise<AppSettings> {
  const json = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!json) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

