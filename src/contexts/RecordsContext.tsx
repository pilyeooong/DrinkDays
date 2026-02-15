import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DrinkRecord } from '../types/drink';
import { loadRecords, saveRecords, generateId } from '../services/storage';

interface RecordsContextValue {
  records: DrinkRecord[];
  loading: boolean;
  saveRecord: (record: Omit<DrinkRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const RecordsContext = createContext<RecordsContextValue>({
  records: [],
  loading: true,
  saveRecord: async () => {},
});

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<DrinkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    loadRecords()
      .then(setRecords)
      .finally(() => setLoading(false));
  }, []);

  const saveRecord = useCallback(
    async (record: Omit<DrinkRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      setRecords((prev) => {
        const existing = prev.find((r) => r.date === record.date);
        const newRecord: DrinkRecord = {
          id: existing?.id ?? generateId(),
          ...record,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };
        const updated = prev.filter((r) => r.date !== record.date);
        updated.push(newRecord);
        saveRecords(updated);
        return updated;
      });
    },
    [],
  );

  return (
    <RecordsContext.Provider value={{ records, loading, saveRecord }}>
      {children}
    </RecordsContext.Provider>
  );
}

export function useRecords() {
  return useContext(RecordsContext);
}
