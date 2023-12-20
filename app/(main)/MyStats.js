import axios from 'axios';
import { Tabs, useFocusEffect, useNavigation, useRouter } from 'expo-router';
import React from 'react';
import { useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView
} from 'react-native';
import { Row, Rows, Table } from 'react-native-reanimated-table';
import { useSession } from '../../components/AuthProvider';
import { COLORS } from '../../constants';

const MyStats = () => {
  const { session, signOut } = useSession();
  const router = useRouter();
  const [mutatedSessions, setMutatedSessions] = useState();
  const [totalSilver, setTotalSilver] = useState(0);
  const [averageSilver, setAverageSilver] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      getData();
    }, [])
  );

  const getData = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API_URL + '/api/session/user',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: session
          }
        }
      );

      if (response.data) {
        setMutatedSessions({
          tableHead: ['Item', 'Location', 'Hours', 'Silver/Hour'],
          tableData: response.data.map((item) => {
            const locationLogo = () => {
              return (
                <Image
                  style={styles.image}
                  source={{
                    uri:
                      'data:image/octet-stream;base64,' +
                      item.location.items[0].logo
                  }}
                />
              );
            };
            const location = item.location.name;
            const time = (item.hours + item.minutes / 60).toFixed(2);
            const silverPerHour =
              Math.floor(item.silver_total / time / 1000000) + ' M';
            return [locationLogo(), location, time, silverPerHour];
          })
        });
        const tSilver = response.data.reduce((sum, val) => {
          return sum + val.silver_total;
        }, 0);
        const tHours = response.data.reduce((sum, val) => {
          return sum + (val.hours + val.minutes / 60);
        }, 0);
        setTotalSilver(tSilver);
        setTotalHours(tHours);
        setAverageSilver(tSilver / tHours);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!mutatedSessions) {
    return (
      <>
        <Tabs.Screen options={{ href: '/MyStats' }} />
        <View style={styles.container}>
          <Text style={styles.text}>Loading...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Tabs.Screen options={{ href: '/MyStats' }} />
      <View style={styles.container}>
        <ScrollView>
          <View style={{ paddingTop: 40, marginBottom: 20 }}>
            <Pressable
              style={styles.button}
              onPress={() => {
                router.push('/SearchLocation');
              }}
            >
              <Text>New Session</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => signOut()}>
              <Text>Log Out</Text>
            </Pressable>
            <View style={styles.card}>
              <Text style={styles.header}>Total Silver Earned</Text>
              <Text style={styles.header2}>{totalSilver.toLocaleString()}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.header}>Average Silver/Hour</Text>
              <Text style={styles.header2}>
                {averageSilver.toLocaleString()}
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.header}>Total Hours Grinded</Text>
              <Text style={styles.header2}>{totalHours.toFixed(2)}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.header}>My Sessions</Text>
              <Table>
                <Row
                  style={styles.headerRow}
                  textStyle={styles.headerRowText}
                  data={mutatedSessions.tableHead}
                />

                <Rows
                  style={styles.row}
                  textStyle={styles.rowText}
                  data={mutatedSessions.tableData}
                />
              </Table>
            </View>
          </View>
        </ScrollView>
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
    marginBottom: 10,
    marginHorizontal: 10
  },
  text: {
    color: COLORS.tertiary
  },
  h: {
    color: COLORS.tertiary,
    alignSelf: 'center',
    fontSize: 25,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  image: {
    width: 30,
    height: 30,
    alignSelf: 'center'
  },
  card: {
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
    padding: 20,
    width: Dimensions.get('window').width - 40,
    margin: 10
  },
  headerRowText: {
    color: COLORS.tertiary,
    fontSize: 18,
    alignSelf: 'center'
  },
  rowText: {
    color: COLORS.tertiary,
    marginHorizontal: 2,
    alignSelf: 'center'
  },
  headerRow: {
    paddingVertical: 5
  },
  row: {
    borderTopWidth: 1,
    borderColor: COLORS.tertiary,
    paddingVertical: 5
  },
  header: {
    color: COLORS.tertiary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tertiary,
    marginBottom: 10,
    fontSize: 20
  },
  header2: {
    color: COLORS.tertiary,
    fontSize: 18
  }
});
