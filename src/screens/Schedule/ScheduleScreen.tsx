import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMonthlyCalendar, createWeeklyEvent, createOneshotEvent } from '../../services/scheduleService';
import { CalendarEvent } from '../../types';

const DAYS = ['T.2', 'T.3', 'T.4', 'T.5', 'T.6', 'T.7', 'CN'];
const HOURS = Array.from({ length: 18 }, (_, i) => i + 5);
const CELL_HEIGHT = 56;
const TIME_COL = 52;

const getEventTop = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return ((h - 5) + m / 60) * CELL_HEIGHT;
};
const getEventHeight = (start: string, end: string) => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.max(((eh - sh) + (em - sm) / 60) * CELL_HEIGHT, CELL_HEIGHT * 0.5);
};
const EVENT_COLORS = ['#0066FF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export const ScheduleScreen: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 7);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'weekly' | 'oneshot'>('oneshot');
  const [form, setForm] = useState({ title: '', date: '', startTime: '09:00', endTime: '10:00', colorHex: '#0066FF' });
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const weekDates = DAYS.map((_, i) => {
    const d = new Date(today);
    const dow = today.getDay() || 7;
    d.setDate(today.getDate() - dow + 1 + i);
    return d.getDate();
  });

  const loadEvents = async () => {
    try { setLoading(true); setEvents(await getMonthlyCalendar()); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { loadEvents(); }, []);

  const todayEvents = events.filter(ev => {
    if (ev.isWeekly) return ev.dayOfWeek === selectedDay;
    if (ev.date) return new Date(ev.date).getDay() === (selectedDay === 7 ? 0 : selectedDay);
    return false;
  });

  const handleSave = async () => {
    if (!form.title || !form.startTime || !form.endTime) {
      Alert.alert('Thiếu thông tin', 'Nhập đủ tiêu đề và thời gian'); return;
    }
    try {
      setSaving(true);
      if (addType === 'weekly') await createWeeklyEvent({ title: form.title, dayOfWeek: selectedDay, startTime: form.startTime, endTime: form.endTime, colorHex: form.colorHex });
      else await createOneshotEvent({ title: form.title, date: form.date || today.toISOString().slice(0, 10), startTime: form.startTime, endTime: form.endTime, colorHex: form.colorHex });
      setShowAddModal(false);
      loadEvents();
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.message || 'Không thể tạo sự kiện');
    } finally { setSaving(false); }
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.hBtn}><Ionicons name="menu" size={24} color="#0F172A" /></TouchableOpacity>
        <Text style={s.hTitle}>THÁNG {today.getMonth() + 1} / {today.getFullYear()}</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <TouchableOpacity style={s.hBtn}><Ionicons name="search-outline" size={22} color="#0F172A" /></TouchableOpacity>
          <TouchableOpacity style={s.hBtn}><Ionicons name="notifications-outline" size={22} color="#0F172A" /></TouchableOpacity>
        </View>
      </View>

      <View style={s.dayStrip}>
        {DAYS.map((d, i) => {
          const sel = i + 1 === selectedDay;
          const isToday = weekDates[i] === today.getDate();
          return (
            <TouchableOpacity key={i} style={s.dayCell} onPress={() => setSelectedDay(i + 1)}>
              <Text style={[s.dayLabel, sel && s.dayLabelSel]}>{d}</Text>
              <View style={[s.dayNum, sel && s.dayNumSel, isToday && !sel && s.dayNumToday]}>
                <Text style={[s.dayNumTxt, sel && s.dayNumTxtSel]}>{weekDates[i]}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color="#0066FF" /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ marginLeft: TIME_COL, minHeight: HOURS.length * CELL_HEIGHT, position: 'relative', marginRight: 12, marginTop: 8 }}>
            {HOURS.map((h, idx) => (
              <View key={h} style={[s.hourRow, { top: idx * CELL_HEIGHT, left: -TIME_COL }]}>
                <Text style={s.hourLabel}>{String(h).padStart(2, '0')}:00</Text>
                <View style={s.hourLine} />
              </View>
            ))}
            {todayEvents.map((ev, i) => {
              if (!ev.startTime || !ev.endTime) return null;
              const top = getEventTop(ev.startTime);
              const height = getEventHeight(ev.startTime, ev.endTime);
              const color = ev.colorHex || EVENT_COLORS[i % EVENT_COLORS.length];
              return (
                <View key={ev.id || i} style={[s.evBlock, { top, height, backgroundColor: color + '22', borderLeftColor: color }]}>
                  <Text style={[s.evTitle, { color }]} numberOfLines={1}>{ev.title}</Text>
                  <Text style={[s.evTime, { color }]}>{ev.startTime} – {ev.endTime}</Text>
                </View>
              );
            })}
            {todayEvents.length === 0 && (
              <View style={s.emptyBox}>
                <Ionicons name="calendar-outline" size={48} color="#CBD5E1" />
                <Text style={s.emptyTxt}>Không có lịch trong ngày này</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <TouchableOpacity style={s.fab} onPress={() => setShowAddModal(true)}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={s.mOverlay}>
          <View style={s.mCard}>
            <View style={s.mHeader}>
              <Text style={s.mTitle}>Thêm sự kiện</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}><Ionicons name="close" size={24} color="#64748B" /></TouchableOpacity>
            </View>
            <View style={s.typeRow}>
              {(['oneshot', 'weekly'] as const).map(t => (
                <TouchableOpacity key={t} style={[s.typeBtn, addType === t && s.typeBtnA]} onPress={() => setAddType(t)}>
                  <Text style={[s.typeTxt, addType === t && s.typeTxtA]}>{t === 'oneshot' ? 'Một lần' : 'Hàng tuần'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={s.mInput} placeholder="Tiêu đề sự kiện" value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} />
            {addType === 'oneshot' && <TextInput style={s.mInput} placeholder="Ngày (YYYY-MM-DD)" value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} />}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput style={[s.mInput, { flex: 1 }]} placeholder="HH:MM" value={form.startTime} onChangeText={v => setForm(f => ({ ...f, startTime: v }))} />
              <Text style={{ alignSelf: 'center', color: '#94A3B8', fontSize: 18 }}>–</Text>
              <TextInput style={[s.mInput, { flex: 1 }]} placeholder="HH:MM" value={form.endTime} onChangeText={v => setForm(f => ({ ...f, endTime: v }))} />
            </View>
            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={s.saveTxt}>Lưu sự kiện</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  hBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  hTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', letterSpacing: 0.5 },
  dayStrip: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 4, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dayCell: { flex: 1, alignItems: 'center', gap: 4 },
  dayLabel: { fontSize: 10, fontWeight: '600', color: '#94A3B8' },
  dayLabelSel: { color: '#0066FF' },
  dayNum: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dayNumSel: { backgroundColor: '#0066FF' },
  dayNumToday: { borderWidth: 1.5, borderColor: '#0066FF' },
  dayNumTxt: { fontSize: 13, fontWeight: '700', color: '#374151' },
  dayNumTxtSel: { color: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hourRow: { position: 'absolute', right: 0, flexDirection: 'row', alignItems: 'flex-start', paddingTop: 4, height: CELL_HEIGHT },
  hourLabel: { width: TIME_COL, fontSize: 10, color: '#94A3B8', fontWeight: '600', paddingLeft: 12 },
  hourLine: { flex: 1, height: 1, backgroundColor: '#F1F5F9' },
  evBlock: { position: 'absolute', left: 4, right: 0, borderRadius: 8, borderLeftWidth: 3, paddingHorizontal: 8, paddingVertical: 4 },
  evTitle: { fontSize: 11, fontWeight: '700' },
  evTime: { fontSize: 10, fontWeight: '500', marginTop: 2 },
  emptyBox: { position: 'absolute', top: CELL_HEIGHT * 4, left: 0, right: 0, alignItems: 'center', gap: 8, padding: 24 },
  emptyTxt: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0066FF', alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#0066FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  mOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  mCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 },
  mHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  mTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center' },
  typeBtnA: { backgroundColor: '#0066FF', borderColor: '#0066FF' },
  typeTxt: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  typeTxtA: { color: '#FFFFFF' },
  mInput: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0F172A', marginBottom: 12 },
  saveBtn: { backgroundColor: '#0066FF', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveTxt: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
