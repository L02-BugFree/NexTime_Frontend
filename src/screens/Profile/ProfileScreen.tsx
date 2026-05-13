import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { getMe } from '../../services/authService';
import { logout } from '../../services/authService';
import { User } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MENU_ITEMS = [
  { icon: 'calendar-outline' as const, label: 'Lập lịch thường xuyên', desc: 'Quản lý lịch trình cố định', color: '#0066FF' },
  { icon: 'add-circle-outline' as const, label: 'Thêm sự kiện mới', desc: 'Tạo sự kiện một lần hoặc hàng tuần', color: '#10B981' },
  { icon: 'color-palette-outline' as const, label: 'Giao diện và ngôn ngữ', desc: 'Tùy chỉnh giao diện & ngôn ngữ', color: '#F59E0B' },
  { icon: 'shield-checkmark-outline' as const, label: 'Bảo mật', desc: 'Cài đặt quyền riêng tư & bảo mật', color: '#8B5CF6' },
  { icon: 'people-outline' as const, label: 'Bạn bè & Kết nối', desc: 'Quản lý danh sách bạn bè', color: '#EC4899' },
  { icon: 'qr-code-outline' as const, label: 'Mã QR cá nhân', desc: 'Chia sẻ QR để kết bạn nhanh', color: '#0EA5E9' },
];

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    getMe().then(setUser).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn chắc chắn muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đăng xuất', style: 'destructive', onPress: async () => {
          try {
            setLoggingOut(true);
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
          } catch {
            navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
          }
        }
      }
    ]);
  };

  const initials = (name: string) =>
    (name || 'U').split(' ').slice(-2).map(w => w[0]?.toUpperCase()).join('');

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.hTitle}>Cài đặt và hồ sơ</Text>
        <TouchableOpacity style={s.hBtn}>
          <Ionicons name="notifications-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={s.profileCard}>
          {loading ? (
            <ActivityIndicator color="#0066FF" />
          ) : (
            <>
              <View style={s.avatarBox}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{initials(user?.displayName || user?.email || 'U')}</Text>
                </View>
                <View style={s.onlineIndicator} />
              </View>
              <View style={s.profileInfo}>
                <Text style={s.profileName}>{user?.displayName || 'Người dùng'}</Text>
                <Text style={s.profileEmail}>{user?.email || ''}</Text>
              </View>
              <View style={s.profileActions}>
                <TouchableOpacity style={s.editBtn}>
                  <Ionicons name="pencil-outline" size={16} color="#0066FF" />
                  <Text style={s.editBtnText}>Chỉnh sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.qrBtn}>
                  <Ionicons name="qr-code-outline" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Menu Items */}
        <View style={s.menuSection}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity key={i} style={s.menuItem} activeOpacity={0.7}>
              <View style={[s.menuIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={s.menuInfo}>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Text style={s.menuDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <View style={s.logoutSection}>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} disabled={loggingOut}>
            {loggingOut ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text style={s.logoutText}>Đăng xuất</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  hTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  hBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  profileCard: { backgroundColor: '#FFFFFF', margin: 16, borderRadius: 20, padding: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  avatarBox: { position: 'relative', alignSelf: 'center', marginBottom: 16 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#0066FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  onlineIndicator: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFFFFF', position: 'absolute', bottom: 2, right: 2 },
  profileInfo: { alignItems: 'center', marginBottom: 16 },
  profileName: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  profileEmail: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  profileActions: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: '#0066FF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  editBtnText: { fontSize: 13, fontWeight: '700', color: '#0066FF' },
  qrBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  menuSection: { backgroundColor: '#FFFFFF', margin: 16, marginTop: 0, borderRadius: 20, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC', gap: 14 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  menuDesc: { fontSize: 12, color: '#94A3B8' },
  logoutSection: { paddingHorizontal: 16, paddingBottom: 40 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FEF2F2', borderRadius: 14, paddingVertical: 16, borderWidth: 1, borderColor: '#FCA5A5' },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});
