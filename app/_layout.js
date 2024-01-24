import { Stack } from 'expo-router';
import { SessionProvider } from '../components/AuthProvider';
import { StatsProvider } from '../components/StatsContext';

export default Layout = () => {
  return (
    <SessionProvider>
      <StatsProvider>
        <Stack
          screenOptions={{
            headerShown: false
          }}
        />
      </StatsProvider>
    </SessionProvider>
  );
};
