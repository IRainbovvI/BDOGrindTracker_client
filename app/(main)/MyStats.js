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
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import {
  Cell,
  Row,
  Rows,
  Table,
  TableWrapper
} from 'react-native-reanimated-table';
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryContainer,
  VictoryLabel,
  VictoryTheme
} from 'victory-native';
import { useSession } from '../../components/AuthProvider';
import { COLORS } from '../../constants';

const MyStats = () => {
  const { session, signOut } = useSession();
  const router = useRouter();
  const [mutatedSessions, setMutatedSessions] = useState();
  const [totalSilver, setTotalSilver] = useState(0);
  const [averageSilver, setAverageSilver] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [chartsData, setChartsData] = useState([]);

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
        const sortedData = response.data
          .slice()
          .sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          })
          .map((item) => {
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
          });

        setMutatedSessions({
          tableHead: ['Item', 'Location', 'Hours', 'Silver/Hour'],
          tableData: sortedData
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

        const sessionsByLocation = response.data.reduce((acc, session) => {
          const locationName = session.location.name;
          if (!acc[locationName]) {
            acc[locationName] = [];
          }
          acc[locationName].push(session);
          return acc;
        }, {});
        setChartsData(
          Object.keys(sessionsByLocation).map((locationName) => {
            const locationSessions = sessionsByLocation[locationName];
            const totalSilver =
              locationSessions.reduce(
                (sum, session) => sum + session.silver_total,
                0
              ) / 1000000;
            const totalHours = locationSessions.reduce(
              (sum, session) => sum + session.hours + session.minutes / 60,
              0
            );
            const silverPerHour = totalSilver / totalHours;

            return {
              locationName,
              silverPerHour,
              totalSilver,
              totalHours
            };
          })
        );
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
        <ScrollView nestedScrollEnabled={true}>
          <View style={{ paddingTop: 40, marginBottom: 20 }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                router.push('/SearchLocation');
              }}
            >
              <Text>New Session</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => signOut()}>
              <Text>Log Out</Text>
            </TouchableOpacity>
            <View style={styles.card}>
              <Text style={styles.header}>Total Silver Earned</Text>
              <Text style={styles.header2}>{totalSilver.toLocaleString()}</Text>
              <ScrollView horizontal>
                <VictoryChart
                  height={600}
                  padding={{
                    bottom: 220,
                    left: 30,
                    right: 30,
                    top: 50
                  }}
                  theme={VictoryTheme.material}
                >
                  <VictoryAxis
                    style={styles.chartAxis}
                    tickLabelComponent={
                      <VictoryLabel
                        angle={270}
                        textAnchor={'end'}
                        verticalAnchor={'middle'}
                      />
                    }
                  />

                  <VictoryBar
                    style={styles.chartBar}
                    data={chartsData
                      .sort((a, b) => b.totalSilver - a.totalSilver)
                      .map((item) => {
                        return {
                          x: item.locationName,
                          y: item.totalSilver,
                          label: Math.floor(item.totalSilver) + 'M'
                        };
                      })}
                    labels={({ datum }) => datum.label}
                    labelComponent={
                      <VictoryLabel style={styles.chartLabel} dy={-10} />
                    }
                    domainPadding={{ x: 0 }}
                  />
                </VictoryChart>
              </ScrollView>
            </View>
            <View style={styles.card}>
              <Text style={styles.header}>Average Silver/Hour</Text>
              <Text style={styles.header2}>
                {averageSilver.toLocaleString()}
              </Text>
              <ScrollView horizontal>
                <VictoryChart
                  height={600}
                  padding={{
                    bottom: 220,
                    left: 30,
                    right: 30,
                    top: 50
                  }}
                  theme={VictoryTheme.material}
                >
                  <VictoryAxis
                    style={styles.chartAxis}
                    tickLabelComponent={
                      <VictoryLabel
                        angle={270}
                        textAnchor={'end'}
                        verticalAnchor={'middle'}
                      />
                    }
                  />

                  <VictoryBar
                    style={styles.chartBar}
                    data={chartsData
                      .sort((a, b) => b.silverPerHour - a.silverPerHour)
                      .map((item) => {
                        return {
                          x: item.locationName,
                          y: item.silverPerHour,
                          label: Math.floor(item.silverPerHour) + 'M'
                        };
                      })}
                    labels={({ datum }) => datum.label}
                    labelComponent={
                      <VictoryLabel style={styles.chartLabel} dy={-10} />
                    }
                    domainPadding={{ x: 0 }}
                  />
                </VictoryChart>
              </ScrollView>
            </View>
            <View style={styles.card}>
              <Text style={styles.header}>Total Hours Grinded</Text>
              <Text style={styles.header2}>{totalHours.toFixed(2)}</Text>
              <ScrollView horizontal>
                <VictoryChart
                  height={600}
                  padding={{
                    bottom: 220,
                    left: 30,
                    right: 30,
                    top: 50
                  }}
                  theme={VictoryTheme.material}
                >
                  <VictoryAxis
                    style={styles.chartAxis}
                    tickLabelComponent={
                      <VictoryLabel
                        angle={270}
                        textAnchor={'end'}
                        verticalAnchor={'middle'}
                      />
                    }
                  />

                  <VictoryBar
                    style={styles.chartBar}
                    data={chartsData
                      .sort((a, b) => b.totalHours - a.totalHours)
                      .map((item) => {
                        return {
                          x: item.locationName,
                          y: item.totalHours,
                          label: item.totalHours.toFixed(2) + ' H'
                        };
                      })}
                    labels={({ datum }) => datum.label}
                    labelComponent={
                      <VictoryLabel style={styles.chartLabel} dy={-10} />
                    }
                    barWidth={20}
                    domainPadding={{ x: 0 }}
                  />
                </VictoryChart>
              </ScrollView>
            </View>

            <View style={styles.card}>
              <Text style={styles.header}>My Sessions</Text>
              <Table>
                <Row
                  style={styles.headerRow}
                  textStyle={styles.headerRowText}
                  data={mutatedSessions.tableHead}
                />
                <ScrollView
                  style={{ maxHeight: 400 }}
                  nestedScrollEnabled={true}
                >
                  {mutatedSessions.tableData.map((rowData, indexR) => (
                    <TableWrapper key={indexR} style={styles.row}>
                      {rowData.map((item, indexC) => (
                        <Cell
                          key={indexC}
                          data={item}
                          textStyle={
                            indexC === 1 ? styles.rowText2 : styles.rowText
                          }
                        ></Cell>
                      ))}
                    </TableWrapper>
                  ))}
                </ScrollView>
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
    marginHorizontal: 1,
    alignSelf: 'center'
  },
  rowText2: {
    color: COLORS.tertiary,
    marginHorizontal: 1,
    alignSelf: 'flex-start'
  },
  headerRow: {
    paddingVertical: 5
  },
  row: {
    flexDirection: 'row',
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
  },
  chart: {
    data: { fill: 'black' }
  },
  chartLabel: {
    fill: 'orange',
    fontSize: 10
  },
  chartAxis: {
    tickLabels: { fill: COLORS.tertiary },
    grid: { stroke: 'none' }
  },
  chartBar: {
    data: { fill: COLORS.tertiary }
  }
});
