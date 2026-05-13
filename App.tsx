import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const content = (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </SafeAreaProvider>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webDesktopBackground}>
        <View style={styles.webMobileFrame}>
          {content}
        </View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  webDesktopBackground: {
    flex: 1,
    backgroundColor: '#0F172A', // Sleek dark desktop background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  webMobileFrame: {
    width: 400,
    height: 820,
    backgroundColor: '#F5F6FA',
    borderRadius: 40,
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    borderWidth: 10,
    borderColor: '#1E293B',
  },
});
