import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { createOneshotEvent, createWeeklyEvent } from '../../services/scheduleService';

const PRESET_COLORS = ['#0066FF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
const DAYS_OF_WEEK = [
  { label: 'T2', value: 1 },
  { label: 'T3', value: 2 },
  { label: 'T4', value: 3 },
  { label: 'T5', value: 4 },
  { label: 'T6', value: 5 },
  { label: 'T7', value: 6 },
  { label: 'CN', value: 7 },
];

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultDate?: string; // YYYY-MM-DD
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  visible,
  onClose,
  onSuccess,
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [colorHex, setColorHex] = useState(PRESET_COLORS[0]);
  const [isWeekly, setIsWeekly] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề sự kiện');
      return;
    }
    if (!startTime.trim() || !endTime.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ giờ bắt đầu và kết thúc');
      return;
    }

    try {
      setLoading(true);
      if (isWeekly) {
        await createWeeklyEvent({
          title: title.trim(),
          description: desc.trim() || undefined,
          startTime,
          endTime,
          dayOfWeek,
          colorHex,
        });
      } else {
        await createOneshotEvent({
          title: title.trim(),
          description: desc.trim() || undefined,
          date,
          startTime,
          endTime,
          colorHex,
        });
      }
      
      Alert.alert('Thành công', 'Đã thêm lịch trình mới thành công!');
      onSuccess();
      handleClose();
    } catch (e: any) {
      console.log(e);
      Alert.alert('Thất bại', e?.response?.data?.message || 'Có lỗi xảy ra khi tạo sự kiện.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDesc('');
    setIsWeekly(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.modalContainer}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.headerTitle}>Thêm lịch trình mới</Text>
            <TouchableOpacity onPress={handleClose} style={s.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={s.form} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
            {/* Title */}
            <View style={s.inputGroup}>
              <Text style={s.label}>Tiêu đề sự kiện</Text>
              <TextInput
                style={s.input}
                placeholder="Ví dụ: Họp nhóm dự án"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Description */}
            <View style={s.inputGroup}>
              <Text style={s.label}>Mô tả (Không bắt buộc)</Text>
              <TextInput
                style={[s.input, s.textArea]}
                placeholder="Nhập chi tiết về buổi họp, địa điểm..."
                placeholderTextColor={colors.textSecondary}
                value={desc}
                onChangeText={setDesc}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Toggle Is Weekly */}
            <View style={s.switchGroup}>
              <View>
                <Text style={s.switchLabel}>Lặp lại hàng tuần</Text>
                <Text style={s.switchSub}>Lịch cố định lặp lại mỗi tuần</Text>
              </View>
              <Switch
                value={isWeekly}
                onValueChange={setIsWeekly}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={Platform.OS === 'ios' ? undefined : colors.white}
              />
            </View>

            {/* Date Picker or Day of Week */}
            {isWeekly ? (
              <View style={s.inputGroup}>
                <Text style={s.label}>Chọn ngày trong tuần</Text>
                <View style={s.daysRow}>
                  {DAYS_OF_WEEK.map((d) => {
                    const isSelected = dayOfWeek === d.value;
                    return (
                      <TouchableOpacity
                        key={d.value}
                        style={[s.dayBtn, isSelected && s.selectedDayBtn]}
                        onPress={() => setDayOfWeek(d.value)}
                      >
                        <Text style={[s.dayBtnText, isSelected && s.selectedDayBtnText]}>
                          {d.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={s.inputGroup}>
                <Text style={s.label}>Ngày diễn ra (YYYY-MM-DD)</Text>
                <TextInput
                  style={s.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                  value={date}
                  onChangeText={setDate}
                />
              </View>
            )}

            {/* Time Slots */}
            <View style={s.timeRow}>
              <View style={[s.inputGroup, { flex: 1 }]}>
                <Text style={s.label}>Giờ bắt đầu</Text>
                <TextInput
                  style={s.input}
                  placeholder="Giờ bắt đầu (09:00)"
                  placeholderTextColor={colors.textSecondary}
                  value={startTime}
                  onChangeText={setStartTime}
                />
              </View>
              <View style={[s.inputGroup, { flex: 1 }]}>
                <Text style={s.label}>Giờ kết thúc</Text>
                <TextInput
                  style={s.input}
                  placeholder="Giờ kết thúc (10:00)"
                  placeholderTextColor={colors.textSecondary}
                  value={endTime}
                  onChangeText={setEndTime}
                />
              </View>
            </View>

            {/* Color Palette */}
            <View style={s.inputGroup}>
              <Text style={s.label}>Nhãn màu hiển thị</Text>
              <View style={s.colorsRow}>
                {PRESET_COLORS.map((c) => {
                  const isSelected = colorHex === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[s.colorCircle, { backgroundColor: c }, isSelected && s.selectedColorCircle]}
                      onPress={() => setColorHex(c)}
                    >
                      {isSelected && <Ionicons name="checkmark" size={16} color={colors.white} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={s.submitBtn} onPress={handleSave} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={s.submitBtnText}>Xác nhận & Thêm</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, height: '85%', overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { ...typography.h2, fontSize: 18, color: colors.text },
  closeBtn: { padding: 4 },
  form: { flex: 1 },
  scrollContent: { padding: 24, gap: 20 },
  inputGroup: { gap: 8 },
  label: { ...typography.caption, fontWeight: '700', color: colors.textSecondary },
  input: { borderHeight: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: colors.text, backgroundColor: '#F8FAFC' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  switchGroup: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  switchLabel: { ...typography.body1, fontWeight: '700', color: colors.text },
  switchSub: { ...typography.caption, color: colors.textSecondary },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  selectedDayBtn: { backgroundColor: colors.primary },
  dayBtnText: { fontSize: 14, fontWeight: '600', color: colors.text },
  selectedDayBtnText: { color: colors.white },
  timeRow: { flexDirection: 'row', gap: 16 },
  colorsRow: { flexDirection: 'row', gap: 16 },
  colorCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  selectedColorCircle: { borderWidth: 3, borderColor: '#E2E8F0' },
  submitBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
});
