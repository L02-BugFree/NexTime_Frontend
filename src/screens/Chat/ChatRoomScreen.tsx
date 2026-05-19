import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { getRoomMessages, sendMessage } from '../../services/roomService';
import { Message } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Avatar } from '../../components/ui/Avatar';
import { PollCard } from '../../components/chat/PollCard';
import { ChecklistCard } from '../../components/chat/ChecklistCard';

type Route = RouteProp<RootStackParamList, 'ChatRoom'>;

// Bổ sung type mở rộng cho UI demo
interface ExtendedMessage extends Message {
  uiType?: 'text' | 'poll' | 'checklist';
  pollData?: any;
  checklistData?: any;
}

export const ChatRoomScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const { roomId, roomName } = route.params;
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getRoomMessages(roomId);
      
      // Inject Mock Data cho Poll và Checklist để xem UI
      const mockMessages: ExtendedMessage[] = [
        { id: 'm1', roomId, senderId: 's1', senderName: 'Quốc Việt', content: 'Tuần sau tụi mình họp nha', isOwn: false, uiType: 'text', createdAt: new Date().toISOString() },
        { id: 'm2', roomId, senderId: 's2', senderName: 'Bạn', content: 'Khi meet vậy ô?', isOwn: true, uiType: 'text', createdAt: new Date().toISOString() },
        { id: 'm3', roomId, senderId: 's1', senderName: 'Quốc Việt', content: 'Để t check lịch của mng cái rồi chốt nhe', isOwn: false, uiType: 'text', createdAt: new Date().toISOString() },
        { 
          id: 'm4', roomId, senderId: 's1', senderName: 'Quốc Việt', content: '', isOwn: false, 
          uiType: 'poll', 
          createdAt: new Date().toISOString(),
          pollData: {
            question: 'Chiều mai 3h họp đc hết mà đúng ko?',
            totalVotes: 12,
            options: [
              { id: 'opt1', text: 'Oke', votes: 11, votedByMe: true },
              { id: 'opt2', text: 'Ko (nêu lý do)', votes: 1, votedByMe: false }
            ]
          }
        },
        { 
          id: 'm5', roomId, senderId: 's3', senderName: 'Harry', content: '', isOwn: false, 
          uiType: 'checklist', 
          createdAt: new Date().toISOString(),
          checklistData: {
            title: 'Chuẩn bị cho buổi họp',
            items: [
              { id: 'i1', text: 'Đọc trước tài liệu', completed: true },
              { id: 'i2', text: 'Chuẩn bị câu hỏi', completed: false }
            ]
          }
        },
      ];
      
      setMessages([...data, ...mockMessages]);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { loadMessages(); }, [roomId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    setText('');
    try {
      setSending(true);
      const msg = await sendMessage(roomId, content);
      setMessages(prev => [...prev, { ...msg, uiType: 'text' }]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch { } finally { setSending(false); }
  };

  const renderMessage = ({ item }: { item: ExtendedMessage }) => {
    const isMine = item.isOwn ?? false;
    
    // Render Custom Cards
    let customContent = null;
    if (item.uiType === 'poll' && item.pollData) {
      customContent = <PollCard {...item.pollData} />;
    } else if (item.uiType === 'checklist' && item.checklistData) {
      customContent = <ChecklistCard {...item.checklistData} />;
    }

    return (
      <View style={[s.msgRow, isMine && s.msgRowMine]}>
        {!isMine && (
          <Avatar size={28} name={item.senderName || 'U'} style={{ marginBottom: 4 }} />
        )}
        <View style={s.msgContentArea}>
          {!isMine && <Text style={s.msgSender}>{item.senderName || 'Người dùng'}</Text>}
          
          {customContent ? (
            customContent
          ) : (
            <View style={[s.msgBubble, isMine ? s.msgBubbleMine : s.msgBubbleOther]}>
              <Text style={[s.msgText, isMine && s.msgTextMine]}>{item.content}</Text>
            </View>
          )}

          <Text style={[s.msgTime, isMine && s.msgTimeMine]}>
            {item.createdAt ? new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '16:50'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Avatar size={36} name={roomName} />
          <View>
            <Text style={s.hName} numberOfLines={1}>{roomName}</Text>
            <Text style={s.hStatus}>Đang hoạt động</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={s.hBtn} onPress={() => navigation.navigate('GroupHeatmap', { roomId, roomName })}>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={s.hBtn}>
            <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m, i) => m.id || String(i)}
          renderItem={renderMessage}
          contentContainerStyle={s.msgList}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.border} />
              <Text style={s.emptyTxt}>Hãy bắt đầu cuộc trò chuyện!</Text>
            </View>
          }
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {/* Input */}
      <View style={s.inputBar}>
        <TouchableOpacity style={s.inputBtn}>
          <Ionicons name="add-circle-outline" size={26} color={colors.textSecondary} />
        </TouchableOpacity>
        <TextInput
          style={s.input}
          placeholder="Type message..."
          placeholderTextColor={colors.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />
        {text.trim() ? (
          <TouchableOpacity style={s.sendBtn} onPress={handleSend} disabled={sending}>
            {sending ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="send" size={18} color={colors.white} />}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.inputBtn}>
            <Ionicons name="mic-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, paddingHorizontal: 12, paddingTop: Platform.OS === 'ios' ? 52 : 30, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  hName: { ...typography.body1, fontWeight: '700', color: colors.text, maxWidth: 180 },
  hStatus: { ...typography.caption, color: colors.success, fontWeight: '600' },
  hBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  msgList: { padding: 16, gap: 16, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowMine: { justifyContent: 'flex-end' },
  msgContentArea: { alignItems: 'flex-start', maxWidth: '85%' },
  msgBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  msgBubbleOther: { backgroundColor: colors.surfaceHighlight, borderBottomLeftRadius: 4 },
  msgBubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  msgSender: { ...typography.caption, fontWeight: '600', color: colors.textSecondary, marginBottom: 4, marginLeft: 4 },
  msgText: { ...typography.body1, color: colors.text },
  msgTextMine: { color: colors.white },
  msgTime: { ...typography.caption, fontSize: 10, color: colors.textSecondary, marginTop: 4, alignSelf: 'flex-start', marginLeft: 4 },
  msgTimeMine: { alignSelf: 'flex-end', marginRight: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  emptyTxt: { ...typography.body2, color: colors.textSecondary, textAlign: 'center' },
  inputBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, paddingHorizontal: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border, gap: 4 },
  inputBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, ...typography.body1, color: colors.text, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
});
