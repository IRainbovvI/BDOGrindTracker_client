import { Redirect, Stack, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../components/AuthProvider';
import { COLORS } from '../../constants';

export default function AppLayout() {
  const { session, isLoading } = useSession();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    return <Redirect href='/' />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarInactiveBackgroundColor: COLORS.primary,
        tabBarActiveBackgroundColor: COLORS.gray,
        tabBarStyle: {
          borderColor: COLORS.tertiary,
          borderTopWidth: 1
        }
      }}
    >
      <Tabs.Screen
        options={{
          tabBarIcon: () => (
            <Ionicons name='person' size={24} color={COLORS.tertiary} />
          ),
          tabBarShowLabel: false
        }}
        name='MyStats'
      />
      <Tabs.Screen
        options={{
          tabBarIcon: () => (
            <Ionicons name='globe-outline' size={24} color={COLORS.tertiary} />
          ),
          tabBarShowLabel: false
        }}
        name='GeneralStats'
      />
    </Tabs>
  );
}
