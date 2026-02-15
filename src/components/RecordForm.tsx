import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import { DrinkRecord } from '../types/drink';
import { useT } from '../constants/i18n';

export interface RecordFormRef {
  getFormData: () => { drank: boolean; amount?: number; unit?: '잔' | '병'; note?: string } | null;
}

interface RecordFormProps {
  dateLabel: string;
  existingRecord?: DrinkRecord;
  onSave: (data: { drank: boolean; amount?: number; unit?: '잔' | '병'; note?: string }) => Promise<void>;
  autoSave?: boolean;
}

function Toast({ visible, message }: { visible: boolean; message: string }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true }),
          ]).start();
        }, 1200);
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]}>
      <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

export const RecordForm = forwardRef<RecordFormRef, RecordFormProps>(
  ({ dateLabel, existingRecord, onSave, autoSave = true }, ref) => {
  const t = useT();
  const [selectedDrink, setSelectedDrink] = useState<boolean | null>(null);
  const [amount, setAmount] = useState(1);
  const [unit, setUnit] = useState<'잔' | '병'>('잔');
  const [note, setNote] = useState('');
  const [toastKey, setToastKey] = useState(0);

  const userInteractedRef = useRef(false);
  const prevDateRef = useRef(dateLabel);

  useImperativeHandle(ref, () => ({
    getFormData: () => {
      if (selectedDrink === null) return null;
      return {
        drank: selectedDrink,
        ...(selectedDrink ? { amount, unit } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      };
    },
  }));

  // Restore existing record
  useEffect(() => {
    userInteractedRef.current = false;
    if (prevDateRef.current !== dateLabel) {
      prevDateRef.current = dateLabel;
    }
    if (existingRecord) {
      setSelectedDrink(existingRecord.drank);
      if (existingRecord.drank) {
        setAmount(existingRecord.amount ?? 1);
        setUnit(existingRecord.unit ?? '잔');
      }
      setNote(existingRecord.note ?? '');
    } else {
      setSelectedDrink(null);
      setAmount(1);
      setUnit('잔');
      setNote('');
    }
  }, [dateLabel, existingRecord]);

  const showToast = useCallback(() => {
    setToastKey((k) => k + 1);
  }, []);

  const doSave = useCallback(async (
    drank: boolean,
    saveAmount: number,
    saveUnit: '잔' | '병',
    saveNote: string,
  ) => {
    await onSave({
      drank,
      ...(drank ? { amount: saveAmount, unit: saveUnit } : {}),
      ...(saveNote.trim() ? { note: saveNote.trim() } : {}),
    });
    showToast();
  }, [onSave, showToast]);

  const handleSelectDrink = async (drank: boolean) => {
    userInteractedRef.current = true;
    setSelectedDrink(drank);
    if (autoSave && !drank) {
      await doSave(false, amount, unit, note);
    }
  };

  const handleSelectAmount = async (num: number) => {
    userInteractedRef.current = true;
    setAmount(num);
    if (autoSave && selectedDrink) {
      await doSave(true, num, unit, note);
    }
  };

  const handleSelectUnit = async (u: '잔' | '병') => {
    userInteractedRef.current = true;
    setUnit(u);
    if (autoSave && selectedDrink) {
      await doSave(true, amount, u, note);
    }
  };

  const handleMemoBlur = async () => {
    if (!autoSave) return;
    if (!userInteractedRef.current && !note.trim()) return;
    if (selectedDrink === null) return;
    userInteractedRef.current = true;
    await doSave(selectedDrink, amount, unit, note);
  };

  const unitLabels: { key: '잔' | '병'; label: string }[] = [
    { key: '잔', label: t.form.glass },
    { key: '병', label: t.form.bottle },
  ];

  return (
    <View style={{ flex: 1 }}>
      <Toast key={toastKey} visible={toastKey > 0} message={t.form.saved} />

      <ScrollView
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.question}>{dateLabel}</Text>

        {existingRecord && (
          <View style={styles.existingBadge}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.existingText}>{t.form.recordDone}</Text>
          </View>
        )}

        {/* Yes / No */}
        <View style={styles.choiceGroup}>
          <TouchableOpacity
            style={[styles.choiceButton, selectedDrink === true && styles.choiceButtonActive]}
            onPress={() => handleSelectDrink(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.choiceText, selectedDrink === true && styles.choiceTextActive]}>
              {t.form.drank}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.choiceButton, selectedDrink === false && styles.choiceButtonNo]}
            onPress={() => handleSelectDrink(false)}
            activeOpacity={0.8}
          >
            <Text style={[styles.choiceText, selectedDrink === false && styles.choiceTextNo]}>
              {t.form.didntDrink}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Detail */}
        {selectedDrink === true && (
          <View style={styles.detailSection}>
            <Text style={styles.subLabel}>{t.form.howMuch}</Text>

            <View style={styles.unitRow}>
              {unitLabels.map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.unitButton, unit === key && styles.unitButtonActive]}
                  onPress={() => handleSelectUnit(key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.unitText, unit === key && styles.unitTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.numberGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.numberButton, amount === num && styles.numberButtonActive]}
                  onPress={() => handleSelectAmount(num)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.numberText, amount === num && styles.numberTextActive]}>{num}</Text>
                  <Text style={[styles.numberUnit, amount === num && styles.numberUnitActive]}>
                    {t.unitDisplay[unit] ?? unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.memoLabel}>{t.form.memoOptional}</Text>
            <TextInput
              style={styles.memoInput}
              value={note}
              onChangeText={setNote}
              onEndEditing={handleMemoBlur}
              placeholder={t.form.memoPlaceholder}
              placeholderTextColor={COLORS.gray400}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.sm,
    zIndex: 100,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  toastText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  scrollInner: {
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
    paddingTop: SPACING['3xl'],
    paddingBottom: 40,
  },
  question: {
    fontSize: FONT_SIZE['4xl'],
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: SPACING['5xl'],
    textAlign: 'center',
  },
  existingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING['2xl'],
  },
  existingText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  choiceGroup: {
    width: '100%',
    gap: SPACING.lg,
    marginBottom: SPACING['3xl'],
  },
  choiceButton: {
    width: '100%',
    paddingVertical: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  choiceButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  choiceButtonNo: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  choiceText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  choiceTextActive: { color: COLORS.white },
  choiceTextNo: { color: COLORS.primary },
  detailSection: {
    width: '100%',
    marginTop: SPACING['3xl'],
  },
  subLabel: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
  },
  unitRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING['2xl'],
  },
  unitButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  unitButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  unitText: {
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  unitTextActive: { color: COLORS.white },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING['3xl'],
  },
  numberButton: {
    width: '17.5%',
    marginHorizontal: '1.25%',
    marginVertical: SPACING.xs,
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  numberButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  numberText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.gray700,
  },
  numberTextActive: { color: COLORS.white },
  numberUnit: {
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
    color: COLORS.gray500,
  },
  numberUnitActive: { color: COLORS.white + 'B3' },
  memoLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray600,
    marginBottom: SPACING.md,
    paddingLeft: SPACING.xs,
  },
  memoInput: {
    width: '100%',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.lg,
    fontSize: FONT_SIZE.base,
    color: COLORS.gray800,
    marginBottom: SPACING['3xl'],
  },
});
