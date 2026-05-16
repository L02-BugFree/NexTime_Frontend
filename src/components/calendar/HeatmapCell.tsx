import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';

interface HeatmapCellProps {
  busyCount: number;
  totalMembers: number;
  onPress?: () => void;
}

export const HeatmapCell: React.FC<HeatmapCellProps> = ({
  busyCount,
  totalMembers,
  onPress,
}) => {
  const getBackgroundColor = () => {
    if (totalMembers === 0 || busyCount === 0) return colors.heatmap.level0;
    
    const ratio = busyCount / totalMembers;
    if (ratio <= 0.25) return colors.heatmap.level1;
    if (ratio <= 0.5) return colors.heatmap.level2;
    if (ratio <= 0.75) return colors.heatmap.level3;
    return colors.heatmap.level4;
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress}
      style={[
        styles.cell, 
        { backgroundColor: getBackgroundColor() }
      ]}
    />
  );
};

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    height: 48, // Chiều cao của 1 block giờ
    borderWidth: 0.5,
    borderColor: colors.border,
  },
});
