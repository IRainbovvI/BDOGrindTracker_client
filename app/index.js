import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { COLORS, images } from '../constants';
import { LogBox } from 'react-native';
import { useSession } from '../components/AuthProvider';

LogBox.ignoreLogs(['new NativeEventEmitter']);

SplashScreen.preventAutoHideAsync();
const Home = () => {
  const router = useRouter();
  ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
  const { session } = useSession();

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);
    if (session) {
      router.replace('/MyStats');
    }
  }, []);

  return (
    <>
      <Stack.Screen options={{}} />
      <View style={styles.container}>
        <View>
          <Image source={images.logo_small} />
          <Text style={styles.h}>BDO</Text>
          <Text style={styles.h}>Grind Tracker</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              router.push('/SignIn');
            }}
          >
            <Text style={styles.text}>SignIn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              router.push('/SignUp');
            }}
          >
            <Text style={styles.text}>SignUp</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: COLORS.tertiary,
    marginTop: 30
  },
  text: {},
  h: {
    color: COLORS.tertiary,
    alignSelf: 'center',
    fontSize: 25,
    fontWeight: 'bold',
    letterSpacing: 1
  }
});
