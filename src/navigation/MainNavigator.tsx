import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from '@/navigation/TabNavigator';
import { QuoteDetailScreen } from '@/screens/main/QuoteDetailScreen';
import { PaywallScreen } from '@/screens/main/PaywallScreen';
import { MainStackParamList } from '@/navigation/types';
import { useQuoteSync } from '@/hooks/useQuoteSync';
import { useSettingsSync } from '@/hooks/useSettingsSync';
import { DailyQuoteBanner } from '@/components/DailyQuoteBanner';
import { useInAppNotification } from '@/notifications/useInAppNotification';
import { navigateToToday } from '@/navigation/navigationRef';

const Stack = createNativeStackNavigator<MainStackParamList>();

// Componente interno para poder usar hooks dentro del navigator
const MainContent: React.FC = () => {
  useQuoteSync();    // sincroniza historial y favoritos con Supabase
  useSettingsSync(); // sincroniza ajustes con Supabase

  const { visible, dismiss } = useInAppNotification();

  const handleBannerPress = () => {
    dismiss();
    navigateToToday();
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0A0F' },
        }}
      >
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen
          name="QuoteDetail"
          component={QuoteDetailScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
        />
      </Stack.Navigator>

      {/* Banner in-app — posicionado absolutamente sobre toda la UI */}
      <DailyQuoteBanner
        visible={visible}
        onPress={handleBannerPress}
        onDismiss={dismiss}
      />
    </View>
  );
};

export const MainNavigator: React.FC = () => <MainContent />;
