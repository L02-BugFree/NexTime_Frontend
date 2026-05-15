import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, ActivityIndicator, RefreshControl, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getChecklists } from '../../services/checklistService';
import { getMonthlyCalendar } from '../../services/scheduleService';
import { getMe } from '../../services/authService';
import { CalendarEvent, Checklist, User } from '../../types';

const { width } = Dimensions.get('window');

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Chào buổi sáng';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

const EVENT_COLORS = ['#0066FF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

// Core Action Grid Data
const CORE_ACTIONS = [
  { id: 'schedule', title: 'Lịch cá nhân', icon: 'calendar', colors: ['#4F46E5', '#3B82F6'], nav: 'Schedule' },
  { id: 'heatmap', title: 'Lịch chung', icon: 'map', colors: ['#EC4899', '#F43F5E'], nav: 'Schedule' },
  { id: 'chat', title: 'Chat nhóm', icon: 'chatbubbles', colors: ['#10B981', '#34D399'], nav: 'Chat' },
  { id: 'checklist', title: 'Checklist AI', icon: 'checkmark-done-circle', colors: ['#F59E0B', '#FBBF24'], nav: 'Events' },
  { id: 'poll', title: 'Bình chọn', icon: 'stats-chart', colors: ['#8B5CF6', '#A78BFA'], nav: 'Chat' },
  { id: 'add', title: 'Tạo sự kiện', icon: 'add-circle', colors: ['#0EA5E9', '#38BDF8'], nav: 'Schedule' },
] as const;

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

  const renderEventCard = ({ item, index }: { item: CalendarEvent; index: number }) => {
    const color = item.colorHex || EVENT_COLORS[index % EVENT_COLORS.length];
    return (
      <View style={[styles.eventCard, { borderTopColor: color }]}>
        <View style={[styles.eventDot, { backgroundColor: color }]} />
        <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.eventFooter}>
          <Ionicons name="time-outline" size={14} color={color} />
          <Text style={[styles.eventTime, { color }]}>{item.startTime} – {item.endTime}</Text>
        </View>
        <Text style={styles.eventTag}>{item.isWeekly ? '🔄 Hàng tuần' : `📅 ${item.date || ''}`}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarTxt}>
              {(user?.displayName || user?.email || 'N')[0].toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.displayName || user?.email?.split('@')[0] || 'bạn'} 👋
            </Text>
          </View>
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
        {/* Hero Banner: Nhấn mạnh tính năng Heatmap */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Schedule')}>
          <LinearGradient
            colors={['#0047CC', '#0066FF', '#3385FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Ionicons name="sparkles" size={14} color="#0066FF" />
                <Text style={styles.heroBadgeText}>Nổi bật</Text>
              </View>
              <Text style={styles.heroTitle}>Xem lịch rảnh chung</Text>
              <Text style={styles.heroSub}>Tự động so khớp lịch trình nhóm qua Heatmap, tìm giờ hẹn trong 1 giây!</Text>
            </View>
            <View style={styles.heroIconBox}>
              <Ionicons name="map" size={50} color="rgba(255,255,255,0.2)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Core Actions Grid */}
        <View style={styles.gridContainer}>
          {CORE_ACTIONS.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gridItem}
              onPress={() => navigation.navigate(action.nav)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={action.colors}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.gridIcon}
              >
                <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.gridText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch trình sắp tới</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#0066FF" style={{ marginVertical: 20 }} />
          ) : (
            <FlatList
              data={events.slice(0, 6)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, i) => item.id || String(i)}
              renderItem={renderEventCard}
              contentContainerStyle={styles.eventsList}
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <Ionicons name="calendar-clear-outline" size={36} color="#CBD5E1" />
                  <Text style={styles.emptyText}>Chưa có lịch trình nào sắp tới</Text>
                </View>
              }
            />
          )}
        </View>

        {/* Active Checklists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tiến độ công việc</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Events')}>
              <Text style={styles.seeAll}>Quản lý</Text>
            </TouchableOpacity>
          </View>
          {checklists.length === 0 ? (
            <View style={styles.checklistEmpty}>
              <Ionicons name="checkmark-done-circle-outline" size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>Bạn đã hoàn thành mọi thứ!</Text>
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
                  <Text style={styles.progressLabel}>{done} trên {total} tác vụ đã xong</Text>
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
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatarBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0066FF', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#EFF6FF' },
  avatarTxt: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  greeting: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  userName: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginTop: 2, paddingRight: 20 },
  notifBtn: { width: 44, height: 44, backgroundColor: '#F8FAFC', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  notifBadge: { width: 10, height: 10, backgroundColor: '#EF4444', borderRadius: 5, position: 'absolute', top: 10, right: 10, borderWidth: 2, borderColor: '#F8FAFC' },
  content: { padding: 20, paddingBottom: 40 },
  heroBanner: {
    borderRadius: 24, padding: 24, marginBottom: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden',
    shadowColor: '#0066FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
  },
  heroContent: { flex: 1, zIndex: 2 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 12, gap: 4 },
  heroBadgeText: { fontSize: 11, fontWeight: '700', color: '#0066FF' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 20, paddingRight: 10 },
  heroIconBox: { position: 'absolute', right: -10, bottom: -10, zIndex: 1, transform: [{ rotate: '-15deg' }] },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, marginBottom: 32 },
  gridItem: { width: (width > 400 ? 360 : width - 40 - 16 - 16) / 3, alignItems: 'center', gap: 8 },
  gridIcon: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  gridText: { fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center' },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  seeAll: { fontSize: 14, fontWeight: '600', color: '#0066FF' },
  eventsList: { gap: 16, paddingRight: 8 },
  eventCard: {
    width: 160, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    borderTopWidth: 4, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12,
  },
  eventDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 10 },
  eventTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 10, lineHeight: 20, height: 40 },
  eventFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  eventTime: { fontSize: 12, fontWeight: '700' },
  eventTag: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  emptyCard: { width: width - 40, alignItems: 'center', padding: 32, gap: 12, backgroundColor: '#FFFFFF', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1' },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', fontWeight: '500' },
  checklistEmpty: { alignItems: 'center', padding: 32, gap: 12, backgroundColor: '#FFFFFF', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1' },
  checklistCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginBottom: 12,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  checklistCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  checklistName: { fontSize: 15, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 12 },
  checklistPct: { fontSize: 15, fontWeight: '800', color: '#0066FF' },
  progressBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#0066FF', borderRadius: 4 },
  progressLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
});
