import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { MyPlantsScreen } from '@/screens/MyPlantsScreen';
import { StatsScreen } from '@/screens/StatsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import type { TabParamList } from './types';
import { TabBar } from './TabBar';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Timing-based cross-fade between tabs — no spring, no snap.
        animation: 'fade',
      }}
    >
      <Tab.Screen name="MyPlants" component={MyPlantsScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
