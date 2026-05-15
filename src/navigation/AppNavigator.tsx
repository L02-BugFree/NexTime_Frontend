import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';

import { LandingScreen } from '../screens/Auth/LandingScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { ScheduleScreen } from '../screens/Schedule/ScheduleScreen';
import { ChecklistScreen } from '../screens/Checklist/ChecklistScreen';
import { ChatListScreen } from '../screens/Chat/ChatListScreen';
import { ChatRoomScreen } from '../screens/Chat/ChatRoomScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { COLORS } from '../constants/colors';

// ─── Types ────────────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Landing: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Schedule: undefined;
  Events: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { roomId: string; roomName: string };
};

// ─── Stacks & Tabs ────────────────────────────────────────────────────────────
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const ChatStack = createNativeStackNavigator<ChatStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

const ChatNavigator = () => (
  <ChatStack.Navigator screenOptions={{ headerShown: false }}>
    <ChatStack.Screen name="ChatList" component={ChatListScreen} />
    <ChatStack.Screen name="ChatRoom" component={ChatRoomScreen} />
  </ChatStack.Navigator>
);

const MainNavigator = () => (
  <MainTab.Navigator
    screenOptions={({ route }) => ({
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: '#94A3B8',
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        backgroundColor: '#FFFFFF',
        height: Platform.OS === 'ios' ? 84 : 64,
        paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        paddingTop: 8,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
      },
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home';
        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Schedule') iconName = focused ? 'calendar' : 'calendar-outline';
        else if (route.name === 'Events') iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
        else if (route.name === 'Chat') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            ...(focused ? {
              backgroundColor: '#EFF6FF',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 4,
            } : {}),
          }}>
            <Ionicons name={iconName} size={22} color={color} />
          </View>
        );
      },
    })}
  >
    <MainTab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
    <MainTab.Screen name="Schedule" component={ScheduleScreen} options={{ title: 'Lịch' }} />
    <MainTab.Screen name="Events" component={ChecklistScreen} options={{ title: 'Sự kiện' }} />
    <MainTab.Screen name="Chat" component={ChatNavigator} options={{ title: 'Chat' }} />
    <MainTab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ sơ' }} />
  </MainTab.Navigator>
);

export const AppNavigator = () => (
  <NavigationContainer>
    <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Main">
      <RootStack.Screen name="Landing" component={LandingScreen} />
      <RootStack.Screen name="Auth" component={AuthNavigator} />
      <RootStack.Screen name="Main" component={MainNavigator} />
    </RootStack.Navigator>
  </NavigationContainer>
);
