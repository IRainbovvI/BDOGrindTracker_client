import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../components/AuthProvider';
import { COLORS } from '../../constants';

export default function AppLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Redirect href='/' />;
  }

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
