import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  ScrollView, SafeAreaView, Switch, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

const slides = [
  {
    icon: 'calendar' as const,
    title: 'Schedule Overlay',
    subtitle: 'Xếp chồng lịch trình, tìm giờ\nrảnh nhóm nhanh chóng.',
  },
  {
    icon: 'checkmark-done-circle' as const,
    title: 'Prompt-to-checklist',
    subtitle: 'Tạo checklist quản lý tác vụ\nnhóm thuận tiện, an toàn.',
  },
];

export const LandingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const scrollRef = useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');

  const handleScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveSlide(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0047CC', '#0066FF', '#3385FF']} style={styles.gradient}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Ionicons name="time" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.logoText}>NexTime</Text>
        </View>

        {/* Slides */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.slideScroll}
        >
          {slides.map((slide, i) => (
            <View key={i} style={[styles.slide, { width }]}>
              <View style={styles.slideIconBox}>
                <Ionicons name={slide.icon} size={80} color="rgba(255,255,255,0.9)" />
              </View>
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Dots */}
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeSlide ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.btnLogin}
            onPress={() => navigation.navigate('Auth')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnLoginText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnRegister}
            onPress={() => navigation.navigate('Auth')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnRegisterText}>Tạo tài khoản mới</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.langSwitch}>
            <TouchableOpacity onPress={() => setLang('vi')}>
              <Text style={[styles.langText, lang === 'vi' && styles.langActive]}>TIẾNG VIỆT</Text>
            </TouchableOpacity>
            <Text style={styles.langDivider}> / </Text>
            <TouchableOpacity onPress={() => setLang('en')}>
              <Text style={[styles.langText, lang === 'en' && styles.langActive]}>ENGLISH</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.darkModeRow}>
            <Ionicons name="moon-outline" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.darkModeText}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={setIsDark}
              thumbColor="#FFFFFF"
              trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#FFFFFF' }}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0066FF' },
  gradient: { flex: 1, alignItems: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 48, marginBottom: 8, gap: 10 },
  logoBox: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  slideScroll: { flex: 1, flexGrow: 0, height: 280 },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  slideIconBox: {
    width: 140, height: 140, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  slideTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 12, textAlign: 'center' },
  slideSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 22 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 24, backgroundColor: '#FFFFFF' },
  dotInactive: { width: 6, backgroundColor: 'rgba(255,255,255,0.4)' },
  buttons: { width: '100%', paddingHorizontal: 24, gap: 12, marginBottom: 32 },
  btnLogin: {
    backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8,
  },
  btnLoginText: { fontSize: 16, fontWeight: '700', color: '#0066FF' },
  btnRegister: {
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  btnRegisterText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  footer: { paddingBottom: 32, alignItems: 'center', gap: 12 },
  langSwitch: { flexDirection: 'row', alignItems: 'center' },
  langText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  langActive: { color: '#FFFFFF', textDecorationLine: 'underline' },
  langDivider: { color: 'rgba(255,255,255,0.4)', marginHorizontal: 4 },
  darkModeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  darkModeText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
});
