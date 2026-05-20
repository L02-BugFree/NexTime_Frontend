import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { WeeklyGrid } from '../../components/calendar/WeeklyGrid';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { getGroupHeatmap } from '../../services/groupService';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { CreateEventModal } from '../../components/calendar/CreateEventModal';

type Route = RouteProp<RootStackParamList, 'GroupHeatmap'>;

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
  const { roomId, roomName } = route.params || { roomId: 'group_123', roomName: 'Nhóm Phát Triển Mobile App' };

  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const TOTAL_MEMBERS = 10;

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

  useEffect(() => { fetchHeatmap(); }, []);

  const handleCellPress = (day: number, hour: number) => {
    const busy = heatmapData[day]?.[hour]?.busyCount || 0;
    console.log(`Day: ${day}, Hour: ${hour}, Busy: ${busy}/${TOTAL_MEMBERS}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Lịch rảnh chung</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {roomName} ({TOTAL_MEMBERS} tv)
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
            <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.addBtnText}>Lịch rảnh</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Legend */}
          <View style={styles.legendWrapper}>
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
                <View style={[styles.legendBox, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.legendText}>Bận nhiều</Text>
              </View>
            </View>
          </View>

          {/* Grid */}
          <View style={styles.gridWrapper}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Đang tổng hợp lịch nhóm...</Text>
              </View>
            ) : (
              <View style={styles.gridCard}>
                <WeeklyGrid 
                  data={heatmapData} 
                  totalMembers={TOTAL_MEMBERS} 
                  onCellPress={handleCellPress} 
                />
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <CreateEventModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchHeatmap}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? 24 : 0 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  headerTextContainer: { flex: 1, marginLeft: 16, marginRight: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2, fontWeight: '500' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6',
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  
  scrollContent: { paddingBottom: 40 },
  legendWrapper: { paddingHorizontal: 20, marginBottom: 16 },
  legendContainer: {
    flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#FFFFFF',
    paddingVertical: 16, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendBox: { width: 14, height: 14, borderRadius: 4 },
  legendText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  
  gridWrapper: { paddingHorizontal: 20 },
  gridCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 4,
  },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, backgroundColor: '#FFFFFF', borderRadius: 24, marginHorizontal: 20 },
  loadingText: { marginTop: 16, fontSize: 14, color: '#64748B', fontWeight: '500' },
});
