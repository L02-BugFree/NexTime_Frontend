import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getChecklists, previewChecklist, confirmChecklist } from '../../services/checklistService';
import { Checklist } from '../../types';

export const ChecklistScreen: React.FC = () => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<Checklist | null>(null);
  const [confirming, setConfirming] = useState(false);

  const loadData = async () => {
    try { setLoading(true); setChecklists(await getChecklists()); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handlePreview = async () => {
    if (!prompt.trim()) return;
    try {
      setPreviewing(true);
      const data = await previewChecklist(prompt.trim());
      setPreviewData(data);
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.message || 'AI không thể xử lý nội dung này');
    } finally { setPreviewing(false); }
  };

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      await confirmChecklist();
      setShowAIModal(false);
      setPrompt('');
      setPreviewData(null);
      loadData();
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.message || 'Không thể lưu checklist');
    } finally { setConfirming(false); }
  };

  const renderItem = ({ item }: { item: Checklist }) => {
    const total = item.items?.length || 0;
    const done = item.items?.filter(i => i.isDone).length || 0;
    const pct = total > 0 ? done / total : 0;
    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={s.badge}>
            <Text style={s.badgeText}>{total} task</Text>
          </View>
        </View>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${pct * 100}%` as any }]} />
        </View>
        <Text style={s.progressLabel}>{done}/{total} hoàn thành · {Math.round(pct * 100)}%</Text>
        {item.items?.slice(0, 3).map((task, i) => (
          <View key={i} style={s.taskRow}>
            <Ionicons
              name={task.isDone ? 'checkmark-circle' : 'ellipse-outline'}
              size={18}
              color={task.isDone ? '#10B981' : '#CBD5E1'}
            />
            <Text style={[s.taskText, task.isDone && s.taskDone]} numberOfLines={1}>{task.title}</Text>
          </View>
        ))}
        {total > 3 && <Text style={s.moreText}>+{total - 3} task khác</Text>}
      </View>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.hTitle}>Checklist</Text>
        <TouchableOpacity style={s.aiBtn} onPress={() => setShowAIModal(true)}>
          <Ionicons name="hardware-chip-outline" size={18} color="#FFFFFF" />
          <Text style={s.aiBtnText}>AI Tạo mới</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={checklists}
        keyExtractor={(item, i) => item.id || String(i)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor="#0066FF" />}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          !loading ? (
            <View style={s.empty}>
              <Ionicons name="checkmark-circle-outline" size={64} color="#CBD5E1" />
              <Text style={s.emptyTitle}>Chưa có checklist nào</Text>
              <Text style={s.emptySub}>Nhấn "AI Tạo mới" để để AI phân tích hội thoại và tự động tạo checklist cho bạn!</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => setShowAIModal(true)}>
                <Ionicons name="hardware-chip-outline" size={18} color="#FFFFFF" />
                <Text style={s.emptyBtnText}>Dùng AI Tạo ngay</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {/* AI Modal */}
      <Modal visible={showAIModal} animationType="slide" transparent>
        <View style={s.mOverlay}>
          <View style={s.mCard}>
            <View style={s.mHeader}>
              <View style={s.mTitleRow}>
                <Ionicons name="hardware-chip-outline" size={20} color="#8B5CF6" />
                <Text style={s.mTitle}>Tạo Checklist bằng AI</Text>
              </View>
              <TouchableOpacity onPress={() => { setShowAIModal(false); setPreviewData(null); setPrompt(''); }}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {!previewData ? (
              <>
                <Text style={s.mDesc}>Dán nội dung đoạn hội thoại nhóm hoặc mô tả kế hoạch. AI sẽ tự động trích xuất checklist:</Text>
                <TextInput
                  style={s.mTextarea}
                  placeholder="Ví dụ: 'Mình cần chuẩn bị slide cho buổi họp thứ 6, Linh lo phần thiết kế, Nam làm nội dung, deadline thứ 5...'"
                  placeholderTextColor="#CBD5E1"
                  multiline
                  numberOfLines={6}
                  value={prompt}
                  onChangeText={setPrompt}
                  textAlignVertical="top"
                />
                <TouchableOpacity style={[s.mBtn, { backgroundColor: '#8B5CF6' }]} onPress={handlePreview} disabled={previewing}>
                  {previewing ? <ActivityIndicator color="#FFF" /> : <>
                    <Ionicons name="flash-outline" size={18} color="#FFFFFF" />
                    <Text style={s.mBtnText}>Phân tích & Xem trước</Text>
                  </>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={s.previewTitle}>✅ AI đề xuất checklist:</Text>
                <Text style={s.previewChecklistTitle}>{previewData.title}</Text>
                {previewData.items?.map((item, i) => (
                  <View key={i} style={s.previewTask}>
                    <Ionicons name="ellipse-outline" size={16} color="#8B5CF6" />
                    <Text style={s.previewTaskText}>{item.title}</Text>
                  </View>
                ))}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                  <TouchableOpacity style={[s.mBtn, { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' }]} onPress={() => setPreviewData(null)}>
                    <Text style={[s.mBtnText, { color: '#64748B' }]}>Làm lại</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.mBtn, { flex: 1, backgroundColor: '#0066FF' }]} onPress={handleConfirm} disabled={confirming}>
                    {confirming ? <ActivityIndicator color="#FFF" /> : <Text style={s.mBtnText}>Lưu checklist</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  hTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  aiBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, gap: 6 },
  aiBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 8 },
  badge: { backgroundColor: '#EFF6FF', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#0066FF' },
  progressBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#0066FF', borderRadius: 4 },
  progressLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500', marginBottom: 12 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  taskText: { fontSize: 13, color: '#374151', flex: 1 },
  taskDone: { textDecorationLine: 'line-through', color: '#94A3B8' },
  moreText: { fontSize: 12, color: '#0066FF', fontWeight: '600', marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151' },
  emptySub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, gap: 8, marginTop: 8 },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  mOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  mCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 },
  mHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  mTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  mDesc: { fontSize: 13, color: '#64748B', lineHeight: 20, marginBottom: 16 },
  mTextarea: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 14, color: '#0F172A', minHeight: 120, marginBottom: 16 },
  mBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 14, gap: 8 },
  mBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  previewTitle: { fontSize: 13, color: '#64748B', fontWeight: '600', marginBottom: 8 },
  previewChecklistTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  previewTask: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  previewTaskText: { fontSize: 14, color: '#374151', flex: 1 },
});
