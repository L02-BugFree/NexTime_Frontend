import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ChatStackParamList } from '../../navigation/AppNavigator';
import { getRoomMessages, sendMessage } from '../../services/roomService';
import { Message } from '../../types';

type Route = RouteProp<ChatStackParamList, 'ChatRoom'>;

export const ChatRoomScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const { roomId, roomName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setMessages(await getRoomMessages(roomId));
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
      setMessages(prev => [...prev, msg]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch { } finally { setSending(false); }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.isOwn ?? false;
    return (
      <View style={[s.msgRow, isMine && s.msgRowMine]}>
        {!isMine && (
          <View style={s.msgAvatar}>
            <Text style={s.msgAvatarTxt}>{(item.senderName || 'U')[0].toUpperCase()}</Text>
          </View>
        )}
        <View style={[s.msgBubble, isMine ? s.msgBubbleMine : s.msgBubbleOther]}>
          {!isMine && <Text style={s.msgSender}>{item.senderName || 'Người dùng'}</Text>}
          <Text style={[s.msgText, isMine && s.msgTextMine]}>{item.content}</Text>
          <Text style={[s.msgTime, isMine && s.msgTimeMine]}>
            {item.createdAt ? new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
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
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.headerAvatar}>
            <Ionicons name="people" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={s.hName} numberOfLines={1}>{roomName}</Text>
            <Text style={s.hStatus}>Đang hoạt động</Text>
          </View>
        </View>
        <TouchableOpacity style={s.hBtn}>
          <Ionicons name="ellipsis-vertical" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color="#0066FF" /></View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m, i) => m.id || String(i)}
          renderItem={renderMessage}
          contentContainerStyle={s.msgList}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="chatbubbles-outline" size={48} color="#CBD5E1" />
              <Text style={s.emptyTxt}>Hãy bắt đầu cuộc trò chuyện!</Text>
            </View>
          }
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {/* Input */}
      <View style={s.inputBar}>
        <TouchableOpacity style={s.inputBtn}>
          <Ionicons name="add-circle-outline" size={26} color="#0066FF" />
        </TouchableOpacity>
        <TextInput
          style={s.input}
          placeholder="Type message..."
          placeholderTextColor="#CBD5E1"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={s.inputBtn}>
          <Ionicons name="happy-outline" size={24} color="#94A3B8" />
        </TouchableOpacity>
        {text.trim() ? (
          <TouchableOpacity style={s.sendBtn} onPress={handleSend} disabled={sending}>
            {sending ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="send" size={18} color="#FFFFFF" />}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.inputBtn}>
            <Ionicons name="mic-outline" size={24} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingTop: 52, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0066FF', alignItems: 'center', justifyContent: 'center' },
  hName: { fontSize: 15, fontWeight: '700', color: '#0F172A', maxWidth: 180 },
  hStatus: { fontSize: 11, color: '#10B981', fontWeight: '600' },
  hBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  msgList: { padding: 16, gap: 12, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowMine: { justifyContent: 'flex-end' },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  msgAvatarTxt: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  msgBubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  msgBubbleOther: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  msgBubbleMine: { backgroundColor: '#0066FF', borderBottomRightRadius: 4 },
  msgSender: { fontSize: 11, fontWeight: '700', color: '#0066FF', marginBottom: 4 },
  msgText: { fontSize: 14, color: '#0F172A', lineHeight: 20 },
  msgTextMine: { color: '#FFFFFF' },
  msgTime: { fontSize: 10, color: '#94A3B8', marginTop: 4, textAlign: 'right' },
  msgTimeMine: { color: 'rgba(255,255,255,0.7)' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  emptyTxt: { fontSize: 15, color: '#94A3B8', textAlign: 'center' },
  inputBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 4 },
  inputBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#0F172A', maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0066FF', alignItems: 'center', justifyContent: 'center' },
});
