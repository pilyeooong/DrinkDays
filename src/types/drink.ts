export interface DrinkRecord {
  id: string;           // UUID — DB PK 대응
  date: string;         // 'YYYY-MM-DD' — indexed
  drank: boolean;
  amount?: number;
  unit?: '잔' | '병';
  note?: string;
  createdAt: string;    // ISO string
  updatedAt: string;    // ISO string
}

export interface StorageSchema {
  version: number;
  records: DrinkRecord[];
}
