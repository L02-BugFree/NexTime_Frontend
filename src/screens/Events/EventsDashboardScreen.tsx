import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
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
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sự kiện & Công cụ</Text>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Bình chọn đang mở */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bình chọn đang mở</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {ACTIVE_POLLS.map(poll => (
                <View key={poll.id} style={styles.cardWrapper}>
                  <Text style={styles.groupContext}>{poll.groupName}</Text>
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
            <Text style={styles.sectionTitle}>Checklist chung</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {ACTIVE_CHECKLISTS.map(checklist => (
                <View key={checklist.id} style={styles.cardWrapper}>
                  <Text style={styles.groupContext}>{checklist.groupName}</Text>
                  <ChecklistCard 
                    title={checklist.title}
                    items={checklist.items}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  cardWrapper: {
    gap: 8,
  },
  groupContext: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
});
