import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WeeklyGrid } from '../../components/calendar/WeeklyGrid';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { getGroupHeatmap } from '../../services/groupService';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';

import { CreateEventModal } from '../../components/calendar/CreateEventModal';

type Route = RouteProp<RootStackParamList, 'GroupHeatmap'>;

// Fallback logic in case API is empty or failing
const generateMockHeatmapData = () => {
  const data: any = {};
  for (let day = 0; day < 7; day++) {
    data[day] = {};
    for (let hour = 6; hour < 24; hour++) {
      const busyCount = Math.floor(Math.random() * 11);
      if (hour >= 22 || hour <= 7) data[day][hour] = { busyCount: 0 }; 
      else data[day][hour] = { busyCount: Math.random() > 0.4 ? busyCount : 0 };
    }
  }
  return data;
};

export const GroupHeatmapScreen = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<any>();
  // params might be undefined if opened somehow else, but it shouldn't be based on AppNavigator.
  const { roomId, roomName } = route.params || { roomId: 'group_123', roomName: 'Nhóm Phát Triển Mobile App' };

  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const TOTAL_MEMBERS = 10; // Hardcoded cho demo, thực tế lấy từ chi tiết Group

  const fetchHeatmap = async () => {
    try {
      setLoading(true);
      const res = await getGroupHeatmap(roomId);
      if (Object.keys(res).length > 0) {
         setHeatmapData(res);
      } else {
         setHeatmapData(generateMockHeatmapData());
      }
    } catch (err) {
      console.log('Heatmap API failed, using mock data');
      setHeatmapData(generateMockHeatmapData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();
  }, []);

  const handleCellPress = (day: number, hour: number) => {
    const busy = heatmapData[day]?.[hour]?.busyCount || 0;
    console.log(`Day: ${day}, Hour: ${hour}, Busy: ${busy}/${TOTAL_MEMBERS}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <View>
                <Text style={styles.headerTitle}>Lịch rảnh chung</Text>
                <Text style={styles.headerSubtitle}>
                  {roomName} ({TOTAL_MEMBERS} tv)
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
              <Ionicons name="add" size={20} color={colors.white} style={{ marginRight: 4 }} />
              <Text style={styles.addBtnText}>Lịch rảnh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chú giải (Legend) */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#F1F5F9' }]} />
            <Text style={styles.legendText}>Rảnh</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#BAE6FD' }]} />
            <Text style={styles.legendText}>Ít bận</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Bận nhiều</Text>
          </View>
        </View>

        {/* Heatmap Grid */}
        <View style={styles.gridWrapper}>
          {loading ? (
             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
               <ActivityIndicator size="large" color={colors.primary} />
             </View>
          ) : (
            <WeeklyGrid 
              data={heatmapData} 
              totalMembers={TOTAL_MEMBERS} 
              onCellPress={handleCellPress} 
            />
          )}
        </View>
      </View>

      <CreateEventModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          fetchHeatmap();
        }}
      />
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
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 18,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  gridWrapper: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
});
