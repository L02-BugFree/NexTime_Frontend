import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LandingScreen } from '../screens/Auth/LandingScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { ChatRoomScreen } from '../screens/Chat/ChatRoomScreen';
import { BottomTabNavigator } from './BottomTabNavigator';

// ─── Types ────────────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Landing: undefined;
  Auth: undefined;
  Main: undefined;
  ChatRoom: { roomId: string; roomName: string };
};

export type AuthStackParamList = {
  Login: undefined;
};

// ─── Stacks ────────────────────────────────────────────────────────────
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

export const AppNavigator = () => (
  <NavigationContainer>
    <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Main">
      <RootStack.Screen name="Landing" component={LandingScreen} />
      <RootStack.Screen name="Auth" component={AuthNavigator} />
      <RootStack.Screen name="Main" component={BottomTabNavigator} />
      <RootStack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </RootStack.Navigator>
  </NavigationContainer>
);
