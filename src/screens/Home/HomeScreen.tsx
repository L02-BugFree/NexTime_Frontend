import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getChecklists } from '../../services/checklistService';
import { getMonthlyCalendar } from '../../services/scheduleService';
import { getMe } from '../../services/authService';
import { CalendarEvent, Checklist, User } from '../../types';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Chào buổi sáng';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

const EVENT_COLORS = ['#0066FF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [u, ev, cl] = await Promise.allSettled([
        getMe(),
        getMonthlyCalendar(),
        getChecklists(),
      ]);
      if (u.status === 'fulfilled') setUser(u.value);
      if (ev.status === 'fulfilled') setEvents(ev.value);
      if (cl.status === 'fulfilled') setChecklists(cl.value);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const renderEventCard = ({ item, index }: { item: CalendarEvent; index: number }) => (
    <View style={[styles.eventCard, { borderTopColor: item.colorHex || EVENT_COLORS[index % EVENT_COLORS.length] }]}>
      <View style={[styles.eventDot, { backgroundColor: item.colorHex || EVENT_COLORS[index % EVENT_COLORS.length] }]} />
      <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.eventTime}>{item.startTime} – {item.endTime}</Text>
      <Text style={styles.eventTag}>{item.isWeekly ? 'Hàng tuần' : item.date || ''}</Text>
    </View>
  );

  const quickUtils = [
    { icon: 'person-circle-outline' as const, label: 'Cá nhân', color: '#EFF6FF', iconColor: '#0066FF', nav: 'Profile' },
    { icon: 'people-circle-outline' as const, label: 'Nhóm', color: '#F0FDF4', iconColor: '#10B981', nav: 'Chat' },
    { icon: 'hardware-chip-outline' as const, label: 'AI Trợ lý', color: '#FDF4FF', iconColor: '#8B5CF6', nav: 'Chat' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user?.displayName || user?.email?.split('@')[0] || 'bạn'} 👋</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color="#0F172A" />
          <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor="#0066FF" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Quick Utilities */}
        <View style={styles.utilsRow}>
          {quickUtils.map((u, i) => (
            <TouchableOpacity
              key={i}
              style={styles.utilBtn}
              onPress={() => navigation.navigate(u.nav)}
              activeOpacity={0.75}
            >
              <View style={[styles.utilIcon, { backgroundColor: u.color }]}>
                <Ionicons name={u.icon} size={28} color={u.iconColor} />
              </View>
              <Text style={styles.utilLabel}>{u.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch sắp tới</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#0066FF" style={{ marginVertical: 16 }} />
          ) : (
            <FlatList
              data={events.slice(0, 6)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={renderEventCard}
              contentContainerStyle={styles.eventsList}
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <Ionicons name="calendar-outline" size={32} color="#CBD5E1" />
                  <Text style={styles.emptyText}>Chưa có lịch trình nào</Text>
                </View>
              }
            />
          )}
        </View>

        {/* Active Checklists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Checklist đang mở</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Events')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {checklists.length === 0 ? (
            <View style={styles.checklistEmpty}>
              <Ionicons name="checkmark-circle-outline" size={32} color="#CBD5E1" />
              <Text style={styles.emptyText}>Chưa có checklist nào đang mở</Text>
            </View>
          ) : (
            checklists.slice(0, 3).map((cl, i) => {
              const total = cl.items?.length || 0;
              const done = cl.items?.filter((it) => it.isDone).length || 0;
              const pct = total > 0 ? done / total : 0;
              return (
                <View key={cl.id || i} style={styles.checklistCard}>
                  <View style={styles.checklistCardHeader}>
                    <Text style={styles.checklistName} numberOfLines={1}>{cl.title}</Text>
                    <Text style={styles.checklistPct}>{Math.round(pct * 100)}%</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${pct * 100}%` as any }]} />
                  </View>
                  <Text style={styles.progressLabel}>{done}/{total} hoàn thành</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  greeting: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  userName: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  notifBtn: { width: 44, height: 44, backgroundColor: '#F8FAFC', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  notifBadge: { width: 8, height: 8, backgroundColor: '#EF4444', borderRadius: 4, position: 'absolute', top: 8, right: 8 },
  content: { padding: 20, paddingBottom: 40 },
  utilsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  utilBtn: { alignItems: 'center', gap: 8 },
  utilIcon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  utilLabel: { fontSize: 12, fontWeight: '600', color: '#374151' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  seeAll: { fontSize: 13, fontWeight: '600', color: '#0066FF' },
  eventsList: { gap: 12, paddingRight: 8 },
  eventCard: {
    width: 140, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
    borderTopWidth: 3, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  eventDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
  eventTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 6, lineHeight: 18 },
  eventTime: { fontSize: 11, color: '#0066FF', fontWeight: '600', marginBottom: 4 },
  eventTag: { fontSize: 10, color: '#94A3B8', fontWeight: '500' },
  emptyCard: { width: 180, alignItems: 'center', padding: 24, gap: 8 },
  emptyText: { fontSize: 13, color: '#94A3B8', textAlign: 'center' },
  checklistEmpty: { alignItems: 'center', padding: 32, gap: 8, backgroundColor: '#FFFFFF', borderRadius: 16 },
  checklistCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
  },
  checklistCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  checklistName: { fontSize: 14, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 8 },
  checklistPct: { fontSize: 13, fontWeight: '700', color: '#0066FF' },
  progressBg: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#0066FF', borderRadius: 4 },
  progressLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
});
