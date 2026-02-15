import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import { Calendar } from '../components/Calendar';
import { RecordForm, RecordFormRef } from '../components/RecordForm';
import { useDrinkRecords } from '../hooks/useDrinkRecords';
import { useT } from '../constants/i18n';

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const t = useT();
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const [editingDay, setEditingDay] = useState<number | null>(null);

  const {
    getDrinkingDatesForMonth,
    getSoberDatesForMonth,
    getMonthlyDrinkingDays,
    getRecordByDate,
    saveRecord,
  } = useDrinkRecords();

  const drinkingDays = getDrinkingDatesForMonth(currentYear, currentMonth);
  const soberDays = getSoberDatesForMonth(currentYear, currentMonth);
  const drinkingCount = getMonthlyDrinkingDays(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const selectedDateKey = selectedDay
    ? toDateKey(currentYear, currentMonth, selectedDay)
    : null;
  const selectedRecord = selectedDateKey ? getRecordByDate(selectedDateKey) : undefined;

  const editingDateKey = editingDay
    ? toDateKey(currentYear, currentMonth, editingDay)
    : null;
  const editingRecord = editingDateKey ? getRecordByDate(editingDateKey) : undefined;

  const formRef = useRef<RecordFormRef>(null);

  const handleEditSave = async (data: { drank: boolean; amount?: number; unit?: '잔' | '병'; note?: string }) => {
    if (!editingDateKey) return;
    const savedDay = editingDay;
    await saveRecord({ date: editingDateKey, ...data });
    setEditingDay(null);
    setSelectedDay(savedDay);
  };

  const handleModalSave = async () => {
    const data = formRef.current?.getFormData();
    if (!data || !editingDateKey) return;
    const savedDay = editingDay;
    await saveRecord({ date: editingDateKey, ...data });
    setEditingDay(null);
    setSelectedDay(savedDay);
  };

  const editingLabel = editingDay
    ? t.monthDay(currentMonth, editingDay)
    : '';

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.lg }]}>
        <Text style={styles.headerTitle}>{t.calendar.title}</Text>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {t.calendar.drinkingDays}:{' '}
          <Text style={styles.summaryCount}>{drinkingCount}{t.calendar.day}</Text>
        </Text>
      </View>

      {/* Calendar + Detail */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        <Calendar
          year={currentYear}
          month={currentMonth}
          drinkingDays={drinkingDays}
          soberDays={soberDays}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {/* Selected Day Detail */}
        {selectedDay !== null && (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>
                {t.monthDay(currentMonth, selectedDay)}
              </Text>
              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setEditingDay(selectedDay)}
                >
                  <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.editText}>
                    {selectedRecord ? t.calendar.edit : t.calendar.record}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedDay(null)}
                >
                  <Ionicons name="close" size={20} color={COLORS.gray600} />
                </TouchableOpacity>
              </View>
            </View>

            {selectedRecord && selectedRecord.drank ? (
              <View>
                <View style={styles.drinkInfo}>
                  <View style={styles.drinkIcon}>
                    <Ionicons name="wine-outline" size={28} color={COLORS.white} />
                  </View>
                  <View style={styles.drinkDetail}>
                    <Text style={styles.drinkLabel}>{t.calendar.amount}</Text>
                    <Text style={styles.drinkAmount}>
                      {selectedRecord.amount}{t.unitDisplay[selectedRecord.unit ?? '잔'] ?? selectedRecord.unit}
                    </Text>
                  </View>
                </View>
                {selectedRecord.note ? (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteLabel}>{t.calendar.memo}</Text>
                    <Text style={styles.noteText}>{selectedRecord.note}</Text>
                  </View>
                ) : null}
              </View>
            ) : selectedRecord && !selectedRecord.drank ? (
              <View style={styles.emptyDetail}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="checkmark-circle" size={32} color="#34D399" />
                </View>
                <Text style={styles.emptyText}>{t.calendar.didntDrink}</Text>
              </View>
            ) : (
              <View style={styles.emptyDetail}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="add-circle-outline" size={32} color={COLORS.gray400} />
                </View>
                <Text style={styles.emptyText}>{t.calendar.noRecord}</Text>
                <TouchableOpacity
                  style={styles.addRecordButton}
                  onPress={() => setEditingDay(selectedDay)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addRecordText}>{t.calendar.recordIt}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Record/Edit Modal */}
      <Modal visible={editingDay !== null} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditingDay(null)}>
              <Text style={styles.modalCancel}>{t.calendar.cancel}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingLabel}</Text>
            <TouchableOpacity onPress={handleModalSave}>
              <Text style={styles.modalSave}>{t.form.save}</Text>
            </TouchableOpacity>
          </View>
          <RecordForm
            ref={formRef}
            autoSave={false}
            dateLabel={t.calendar.drankQuestion(editingLabel)}
            existingRecord={editingRecord}
            onSave={handleEditSave}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING['2xl'],
    paddingBottom: SPACING['3xl'],
  },
  headerTitle: {
    fontSize: FONT_SIZE['5xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  summary: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.xl,
  },
  summaryText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray700,
  },
  summaryCount: {
    fontWeight: '700',
    color: COLORS.primary,
    fontSize: FONT_SIZE.lg,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: SPACING['2xl'],
    paddingBottom: 120,
    gap: SPACING.xl,
  },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  detailTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  detailActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS.md,
  },
  editText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drinkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    padding: SPACING.xl,
    backgroundColor: COLORS.primary + '0D',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.primary + '1A',
  },
  drinkIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drinkDetail: { flex: 1 },
  drinkLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  drinkAmount: {
    fontSize: FONT_SIZE['4xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  noteBox: {
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  noteLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
  },
  noteText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray800,
    fontWeight: '500',
  },
  emptyDetail: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray500,
  },
  addRecordButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
  },
  addRecordText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalCancel: {
    fontSize: FONT_SIZE.base,
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalSave: {
    fontSize: FONT_SIZE.base,
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.gray800,
  },
});
