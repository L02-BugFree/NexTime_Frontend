import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChatStackParamList } from '../../navigation/AppNavigator';
import { getRooms } from '../../services/roomService';
import { Room } from '../../types';

type Nav = NativeStackNavigationProp<ChatStackParamList, 'ChatList'>;

const AVATAR_COLORS = ['#0066FF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

export const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setRooms(await getRooms());
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { loadRooms(); }, []);

  const initials = (name: string) =>
    name.split(' ').slice(-2).map(w => w[0]?.toUpperCase()).join('');

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.hTitle}>NexTime</Text>
        <TouchableOpacity style={s.hBtn}>
          <Ionicons name="create-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Stories row */}
      {rooms.length > 0 && (
        <View style={s.storiesBox}>
          <FlatList
            data={rooms.slice(0, 8)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={r => r.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 16 }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={s.storyItem}
                onPress={() => navigation.navigate('ChatRoom', { roomId: item.id, roomName: item.name })}
              >
                <View style={[s.storyAvatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
                  <Text style={s.storyInitials}>{initials(item.name)}</Text>
                </View>
                <Text style={s.storyName} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Conversations list */}
      <FlatList
        data={rooms}
        keyExtractor={r => r.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRooms} tintColor="#0066FF" />}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={s.roomItem}
            onPress={() => navigation.navigate('ChatRoom', { roomId: item.id, roomName: item.name })}
            activeOpacity={0.7}
          >
            <View style={[s.roomAvatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
              <Text style={s.roomInitials}>{initials(item.name)}</Text>
            </View>
            <View style={s.roomInfo}>
              <View style={s.roomInfoTop}>
                <Text style={s.roomName} numberOfLines={1}>{item.name}</Text>
                <Text style={s.roomTime}>vừa xong</Text>
              </View>
              <Text style={s.roomLast} numberOfLines={1}>
                {item.type === 'GROUP' ? '👥 Nhóm' : '💬 Cá nhân'} · Nhấn để mở chat
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={s.empty}>
              <Ionicons name="chatbubbles-outline" size={56} color="#CBD5E1" />
              <Text style={s.emptyTitle}>Chưa có cuộc hội thoại nào</Text>
              <Text style={s.emptySubtitle}>Bắt đầu chat với bạn bè hoặc tạo nhóm mới</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  hTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  hBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  storiesBox: { borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  storyItem: { alignItems: 'center', gap: 4, width: 60 },
  storyAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  storyInitials: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  storyName: { fontSize: 10, fontWeight: '600', color: '#374151', width: 60, textAlign: 'center' },
  roomItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  roomAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  roomInitials: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  roomInfo: { flex: 1 },
  roomInfoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  roomName: { fontSize: 15, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 8 },
  roomTime: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  roomLast: { fontSize: 13, color: '#64748B' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151' },
  emptySubtitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },
});
