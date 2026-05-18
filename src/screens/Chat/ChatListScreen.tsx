import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { getRooms } from '../../services/roomService';
import { Room } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Avatar } from '../../components/ui/Avatar';

type Nav = NativeStackNavigationProp<RootStackParamList>;

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

  const getFirstName = (name: string) => name.split(' ')[0];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.hTitle}>Trò chuyện</Text>
        <TouchableOpacity style={s.hBtn}>
          <Ionicons name="create-outline" size={22} color={colors.text} />
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
                <Avatar size={56} name={item.name} style={{ borderWidth: 2, borderColor: colors.primary }} />
                <Text style={s.storyName} numberOfLines={1}>{getFirstName(item.name)}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Conversations list */}
      <FlatList
        data={rooms}
        keyExtractor={r => r.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRooms} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={s.roomItem}
            onPress={() => navigation.navigate('ChatRoom', { roomId: item.id, roomName: item.name })}
            activeOpacity={0.7}
          >
            <Avatar size={52} name={item.name} style={{ marginRight: 14 }} />
            <View style={s.roomInfo}>
              <View style={s.roomInfoTop}>
                <Text style={s.roomName} numberOfLines={1}>{item.name}</Text>
                <Text style={s.roomTime}>vừa xong</Text>
              </View>
              <Text style={s.roomLast} numberOfLines={1}>
                {item.type === 'GROUP' ? 'Nhóm · Nhấn để mở chat' : 'Nhấn để mở chat'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={s.empty}>
              <Ionicons name="chatbubbles-outline" size={56} color={colors.border} />
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
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 52 : 30, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  hTitle: { ...typography.h1, color: colors.text },
  hBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center' },
  storiesBox: { borderBottomWidth: 1, borderBottomColor: colors.border },
  storyItem: { alignItems: 'center', gap: 6, width: 64 },
  storyName: { ...typography.caption, fontWeight: '600', color: colors.textSecondary, width: 64, textAlign: 'center' },
  roomItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  roomInfo: { flex: 1 },
  roomInfoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  roomName: { ...typography.body1, fontWeight: '700', color: colors.text, flex: 1, marginRight: 8 },
  roomTime: { ...typography.caption, color: colors.textSecondary },
  roomLast: { ...typography.body2, color: colors.textSecondary },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 32 },
  emptyTitle: { ...typography.h3, color: colors.text },
  emptySubtitle: { ...typography.body2, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
