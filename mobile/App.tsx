import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';

import { colors } from '@/theme';
import { AppProvider, useApp } from '@/state/AppContext';
import { SettingsProvider } from '@/state/SettingsContext';
import { PlantsProvider } from '@/state/PlantsContext';
import { RootNavigator } from '@/navigation/RootNavigator';

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    primary: colors.water,
    text: colors.text,
    border: colors.border,
  },
};

function Root() {
  const { ready, onboarded } = useApp();

  // Hold on a plain background until identity + preferences are loaded, so the
  // first painted frame is already correct (no flash of the wrong screen).
  if (!ready) {
    return <View style={styles.boot} />;
  }

  return (
    <SettingsProvider>
      <PlantsProvider>
        <NavigationContainer theme={navTheme}>
          <RootNavigator onboarded={onboarded} />
        </NavigationContainer>
      </PlantsProvider>
    </SettingsProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor={colors.background} />
        <AppProvider>
          <Root />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  boot: { flex: 1, backgroundColor: colors.background },
});
