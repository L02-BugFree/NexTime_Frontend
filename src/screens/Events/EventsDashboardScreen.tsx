import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { PollCard } from '../../components/chat/PollCard';
import { ChecklistCard } from '../../components/chat/ChecklistCard';

// Mock Data
const ACTIVE_POLLS = [
  {
    id: 'p1',
    groupName: 'Nhóm Phát Triển Mobile App',
    question: 'Chiều mai 3h họp đc hết mà đúng ko?',
    totalVotes: 12,
    options: [
      { id: 'opt1', text: 'Oke', votes: 11, votedByMe: true },
      { id: 'opt2', text: 'Ko (nêu lý do)', votes: 1, votedByMe: false }
    ]
  },
  {
    id: 'p2',
    groupName: 'Team Design',
    question: 'Chốt màu chủ đạo mới?',
    totalVotes: 5,
    options: [
      { id: 'o1', text: 'Blue', votes: 3, votedByMe: true },
      { id: 'o2', text: 'Purple', votes: 2, votedByMe: false }
    ]
  }
];

const ACTIVE_CHECKLISTS = [
  {
    id: 'c1',
    groupName: 'Nhóm Phát Triển Mobile App',
    title: 'Chuẩn bị cho buổi họp',
    items: [
      { id: 'i1', text: 'Đọc trước tài liệu', completed: true },
      { id: 'i2', text: 'Chuẩn bị câu hỏi', completed: false }
    ]
  }
];

export const EventsDashboardScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'week'>('list');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Sự kiện & Công cụ</Text>
            <Text style={styles.headerSubtitle}>Quản lý các hoạt động nhóm</Text>
          </View>
          <View style={styles.viewToggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons name="list" size={18} color={viewMode === 'list' ? '#3B82F6' : '#94A3B8'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewMode === 'week' && styles.toggleBtnActive]}
              onPress={() => setViewMode('week')}
            >
              <Ionicons name="calendar-outline" size={18} color={viewMode === 'week' ? '#3B82F6' : '#94A3B8'} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {viewMode === 'week' ? (
            <View style={styles.weekViewContainer}>
              <View style={styles.emptyWeekState}>
                <View style={styles.emptyIconBox}>
                  <Ionicons name="calendar-outline" size={32} color="#94A3B8" />
                </View>
                <Text style={styles.emptyTitle}>Chế độ xem tuần</Text>
                <Text style={styles.emptyText}>Tính năng xem lịch sự kiện dạng tuần đang được hoàn thiện và sẽ sớm ra mắt.</Text>
              </View>
            </View>
          ) : (
            <>
              {/* Bình chọn đang mở */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Bình chọn đang mở</Text>
                  <TouchableOpacity>
                    <Text style={styles.seeAllText}>Xem tất cả</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                  {ACTIVE_POLLS.map(poll => (
                    <View key={poll.id} style={styles.cardWrapper}>
                      <View style={styles.groupBadge}>
                        <Ionicons name="people" size={14} color="#3B82F6" />
                        <Text style={styles.groupContext}>{poll.groupName}</Text>
                      </View>
                      <PollCard 
                        question={poll.question}
                        options={poll.options}
                        totalVotes={poll.totalVotes}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>

              {/* Checklist chung */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Checklist chung</Text>
                  <TouchableOpacity>
                    <Text style={styles.seeAllText}>Xem tất cả</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                  {ACTIVE_CHECKLISTS.map(checklist => (
                    <View key={checklist.id} style={styles.cardWrapper}>
                      <View style={styles.groupBadge}>
                        <Ionicons name="people" size={14} color="#10B981" />
                        <Text style={[styles.groupContext, { color: '#10B981' }]}>{checklist.groupName}</Text>
                      </View>
                      <ChecklistCard 
                        title={checklist.title}
                        items={checklist.items}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? 24 : 0 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20, backgroundColor: '#F8FAFC',
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 2, fontWeight: '500' },
  viewToggleContainer: {
    flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 12, padding: 4,
  },
  toggleBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  
  scrollContent: { paddingBottom: 100 },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  seeAllText: { fontSize: 14, fontWeight: '600', color: '#3B82F6' },
  horizontalScroll: { paddingHorizontal: 24, gap: 16 },
  cardWrapper: { gap: 8, width: 280 },
  groupBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  groupContext: { fontSize: 12, fontWeight: '700', color: '#3B82F6' },
  
  weekViewContainer: { padding: 24, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyWeekState: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 32, alignItems: 'center', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 4 },
  emptyIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
});
