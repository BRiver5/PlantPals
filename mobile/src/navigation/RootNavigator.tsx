import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { AddEditPlantScreen } from '@/screens/AddEditPlantScreen';
import { PlantDetailScreen } from '@/screens/PlantDetailScreen';
import { colors } from '@/theme';
import type { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator({ onboarded }: { onboarded: boolean }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
        animationDuration: 260,
      }}
    >
      {!onboarded && <Stack.Screen name="Onboarding" component={OnboardingScreen} />}
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="AddEditPlant"
        component={AddEditPlantScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
    </Stack.Navigator>
  );
}
