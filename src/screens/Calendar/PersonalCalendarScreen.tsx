import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { getMonthlyCalendar } from '../../services/scheduleService';
import { CalendarEvent } from '../../types';

import { CreateEventModal } from '../../components/calendar/CreateEventModal';

const MONTH_NAMES = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const PersonalCalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await getMonthlyCalendar();
      setEvents(data);
    } catch (e) {
      console.log('Error loading events:', e);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = dateStr === selectedDate;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const hasEvent = events.some(e => e.date === dateStr);

      days.push(
        <TouchableOpacity
          key={dateStr}
          style={[styles.dayCell, isSelected && styles.selectedDayCell]}
          onPress={() => setSelectedDate(dateStr)}
        >
          <Text style={[styles.dayText, isSelected && styles.selectedDayText, isToday && !isSelected && styles.todayText]}>
            {d}
          </Text>
          {hasEvent && (
            <View style={[styles.eventDot, isSelected && styles.selectedEventDot]} />
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month - 1, 1))}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
          <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month + 1, 1))}>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysRow}>
          {DAY_NAMES.map(day => (
            <Text key={day} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {days}
        </View>
      </View>
    );
  };

  const selectedEvents = events.filter(e => e.date === selectedDate || e.isWeekly);

  const renderEvent = ({ item }: { item: CalendarEvent }) => (
    <View style={styles.eventCard}>
      <View style={[styles.eventColorBar, { backgroundColor: item.colorHex || colors.primary }]} />
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <View style={styles.eventTimeRow}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.eventTime}>{item.startTime} - {item.endTime}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch cá nhân</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {renderCalendar()}

      <View style={styles.eventsListContainer}>
        <Text style={styles.sectionTitle}>Lịch trình ngày {selectedDate.split('-').reverse().join('/')}</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={selectedEvents}
            keyExtractor={item => item.id || Math.random().toString()}
            renderItem={renderEvent}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-clear-outline" size={48} color={colors.border} />
                <Text style={styles.emptyText}>Không có sự kiện nào trong ngày này</Text>
                <TouchableOpacity style={styles.emptyAddButton} onPress={() => setModalVisible(true)}>
                  <Text style={styles.emptyAddButtonText}>Tạo sự kiện mới</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      <CreateEventModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          loadEvents();
        }}
        defaultDate={selectedDate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? 24 : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, backgroundColor: colors.white },
  headerTitle: { ...typography.h1, fontSize: 24, color: colors.text },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  calendarContainer: { backgroundColor: colors.white, paddingBottom: 16, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, marginBottom: 16 },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  monthTitle: { ...typography.h2, fontSize: 18, color: colors.text },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  weekDayText: { flex: 1, textAlign: 'center', ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  selectedDayCell: { backgroundColor: colors.primary, borderRadius: 20 },
  dayText: { ...typography.body1, color: colors.text, fontWeight: '500' },
  selectedDayText: { color: colors.white, fontWeight: '700' },
  todayText: { color: colors.primary, fontWeight: '700' },
  eventDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary, position: 'absolute', bottom: 4 },
  selectedEventDot: { backgroundColor: colors.white },
  eventsListContainer: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: 16 },
  listContent: { paddingBottom: 40, gap: 12 },
  eventCard: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  eventColorBar: { width: 6 },
  eventContent: { flex: 1, padding: 16 },
  eventTitle: { ...typography.body1, fontWeight: '700', color: colors.text, marginBottom: 8 },
  eventTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventTime: { ...typography.caption, color: colors.textSecondary },
  moreButton: { padding: 16, justifyContent: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { ...typography.body2, color: colors.textSecondary },
  emptyAddButton: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.surfaceHighlight, borderRadius: 20 },
  emptyAddButtonText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});
