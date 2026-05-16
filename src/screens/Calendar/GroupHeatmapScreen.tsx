import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { WeeklyGrid } from '../../components/calendar/WeeklyGrid';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { getGroupHeatmap } from '../../services/groupService';

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
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const TOTAL_MEMBERS = 10; // Hardcoded cho demo, thực tế lấy từ chi tiết Group
  const dummyGroupId = 'group_123';

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        setLoading(true);
        const res = await getGroupHeatmap(dummyGroupId);
        // Chuyển đổi res nếu cần, tạm thời assume res match format Grid
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
    fetchHeatmap();
  }, []);

  const handleCellPress = (day: number, hour: number) => {
    const busy = heatmapData[day]?.[hour]?.busyCount || 0;
    // Có thể mở 1 BottomSheet để xem chi tiết ai đang bận ở khung giờ này
    console.log(`Day: ${day}, Hour: ${hour}, Busy: ${busy}/${TOTAL_MEMBERS}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={typography.h2}>Lịch rảnh chung</Text>
          <Text style={[typography.body2, { color: colors.textSecondary, marginTop: 4 }]}>
            Nhóm Phát Triển Mobile App ({TOTAL_MEMBERS} tv)
          </Text>
        </View>

        {/* Chú giải (Legend) */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: colors.heatmap.level0 }]} />
            <Text style={styles.legendText}>Rảnh tất cả</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: colors.heatmap.level2 }]} />
            <Text style={styles.legendText}>Có người bận</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: colors.heatmap.level4 }]} />
            <Text style={styles.legendText}>Bận tất cả</Text>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  gridWrapper: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
