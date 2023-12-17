import { Tabs, useNavigation } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSession } from '../../components/AuthProvider';
import { COLORS } from '../../constants';

const MyStats = () => {
  const { session } = useSession();
  return (
    <>
      <Tabs.Screen options={{ href: '/MyStats' }} />
      <View style={styles.container}>
        <Text>{session}</Text>
      </View>
    </>
  );
};

export default MyStats;

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
