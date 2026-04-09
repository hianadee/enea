import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DailyQuoteScreen } from '@/screens/main/DailyQuoteScreen';
import { JournalScreen } from '@/screens/main/JournalScreen';
import { SettingsScreen } from '@/screens/main/SettingsScreen';
import { TabBar } from '@/design-system/components/TabBar';
import { TabParamList } from '@/navigation/types';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Today" component={DailyQuoteScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};
