import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RecordScreen } from '../screens/RecordScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { AnalysisScreen } from '../screens/AnalysisScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AdBanner } from '../components/AdBanner';
import { AD_UNIT_IDS } from '../services/ads';
import { COLORS } from '../constants/theme';
import { useT } from '../constants/i18n';

export type RootTabParamList = {
  Record: undefined;
  Calendar: undefined;
  Analysis: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function TabBarWithAd(props: BottomTabBarProps) {
  return (
    <View style={styles.bottomContainer}>
      <AdBanner unitId={AD_UNIT_IDS.BANNER} />
      <BottomTabBar {...props} />
    </View>
  );
}

export function RootNavigator() {
  const t = useT();

  return (
    <Tab.Navigator
      tabBar={(props) => <TabBarWithAd {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Record"
        component={RecordScreen}
        options={{
          tabBarLabel: t.tabs.record,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: t.tabs.calendar,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{
          tabBarLabel: t.tabs.analysis,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t.tabs.settings,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bottomContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: COLORS.primary + '1A',
  },
});
