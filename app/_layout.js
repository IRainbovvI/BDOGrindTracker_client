import { Stack } from 'expo-router';
import { SessionProvider } from '../components/AuthProvider';
import { COLORS } from '../constants';

export default Layout = () => {
    return (
        <SessionProvider>
            <Stack
                screenOptions={{
                    headerShown: false
                }}
            />
        </SessionProvider>
    );
};
