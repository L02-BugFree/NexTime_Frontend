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
          <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month - 1, 1))} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
          <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month + 1, 1))} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={20} color="#0F172A" />
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
      <View style={[styles.eventColorBar, { backgroundColor: item.colorHex || '#3B82F6' }]} />
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <View style={styles.eventTimeRow}>
          <Ionicons name="time-outline" size={14} color="#64748B" />
          <Text style={styles.eventTime}>{item.startTime} - {item.endTime}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-vertical" size={20} color="#94A3B8" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Lịch của tôi</Text>
            <Text style={styles.headerSubtitle}>Quản lý lịch trình cá nhân</Text>
          </View>
          <TouchableOpacity style={styles.searchBtn} activeOpacity={0.8}>
            <Ionicons name="search-outline" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {renderCalendar()}

        <View style={styles.eventsListContainer}>
          <Text style={styles.sectionTitle}>Lịch trình ngày {selectedDate.split('-').reverse().join('/')}</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
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
                  <View style={styles.emptyIconBox}>
                    <Ionicons name="calendar-clear-outline" size={36} color="#94A3B8" />
                  </View>
                  <Text style={styles.emptyTitle}>Không có sự kiện</Text>
                  <Text style={styles.emptyText}>Bạn không có lịch trình nào vào ngày này.</Text>
                  <TouchableOpacity style={styles.emptyAddButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.emptyAddButtonText}>Tạo sự kiện mới</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          )}
        </View>

        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <CreateEventModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={loadEvents}
        defaultDate={selectedDate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? 24 : 0 },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: '#F8FAFC' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 2, fontWeight: '500' },
  searchBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  
  calendarContainer: { backgroundColor: '#FFFFFF', marginHorizontal: 20, paddingBottom: 16, paddingHorizontal: 16, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 4, marginBottom: 24 },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  monthTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  navBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 12 },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  weekDayText: { flex: 1, textAlign: 'center', fontSize: 13, color: '#64748B', fontWeight: '700' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  selectedDayCell: { backgroundColor: '#3B82F6', borderRadius: 14 },
  dayText: { fontSize: 15, color: '#374151', fontWeight: '500' },
  selectedDayText: { color: '#FFFFFF', fontWeight: '700' },
  todayText: { color: '#3B82F6', fontWeight: '700' },
  eventDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#3B82F6', position: 'absolute', bottom: 6 },
  selectedEventDot: { backgroundColor: '#FFFFFF' },
  
  eventsListContainer: { flex: 1, paddingHorizontal: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  listContent: { paddingBottom: 100, gap: 12 },
  eventCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12 },
  eventColorBar: { width: 6 },
  eventContent: { flex: 1, padding: 16 },
  eventTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  eventTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventTime: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  moreButton: { padding: 16, justifyContent: 'center' },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyIconBox: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 20 },
  emptyAddButton: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 14, backgroundColor: '#EFF6FF', borderRadius: 14 },
  emptyAddButtonText: { color: '#3B82F6', fontWeight: '700', fontSize: 15 },
  
  fab: { position: 'absolute', bottom: Platform.OS === 'ios' ? 100 : 90, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
});
