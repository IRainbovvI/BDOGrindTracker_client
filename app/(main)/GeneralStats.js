import axios from 'axios';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity
} from 'react-native';
import { Cell, Row, Table, TableWrapper } from 'react-native-reanimated-table';
import { useSession } from '../../components/AuthProvider';
import { COLORS } from '../../constants';
import { useStatsContext } from '../../components/StatsContext';
import { useEffect } from 'react';

const GeneralStats = () => {
  const { session } = useSession();
  const { sharedState, updateSharedState } = useStatsContext();
  const router = useRouter();

  useEffect(
    React.useCallback(() => {
      getData();
    }, []),
    []
  );

  const getData = async () => {
    try {
      const responseSessions = await axios.get(
        process.env.REACT_APP_API_URL + '/api/session',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: session
          }
        }
      );

      const responseLocations = await axios.get(
        process.env.REACT_APP_API_URL + '/api/location',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: session
          }
        }
      );

      if (responseSessions.data && responseLocations.data) {
        const tableHead = ['Item', 'Location', 'Hours', 'Silver/Hour'];
        const tableData = responseLocations.data.map((location) => {
          const locationLogo = () => {
            return (
              <Image
                style={styles.image}
                source={{
                  uri:
                    'data:image/octet-stream;base64,' + location.items[0].logo
                }}
              />
            );
          };
          const hours = responseSessions.data
            .filter((ses) => ses.location._id === location._id)
            .reduce((sum, val) => sum + val.hours, 0);
          const minutes = responseSessions.data
            .filter((ses) => ses.location._id === location._id)
            .reduce((sum, val) => sum + val.minutes, 0);
          const time = (hours + minutes / 60).toFixed(2);
          const silver_total = responseSessions.data
            .filter((ses) => ses.location._id === location._id)
            .reduce((sum, val) => sum + val.silver_total, 0);
          const silver = Math.floor(silver_total / time / 1000000);

          return [locationLogo(), location.name, time, silver || 0];
        });

        const sortedTableData = tableData
          .slice()
          .sort((a, b) => {
            return b[3] - a[3];
          })
          .map((val) => [val[0], val[1], val[2], val[3] + ' M']);

        updateSharedState({ tableHead, tableData: sortedTableData });
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!sharedState) {
    return (
      <>
        <Tabs.Screen options={{ href: '/GeneralStats' }} />
        <View style={styles.container}>
          <Text style={styles.text}>Loading...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Tabs.Screen options={{ href: '/GeneralStats' }} />
      <View style={styles.container}>
        <ScrollView>
          <View style={{ paddingTop: 20, marginBottom: 20 }}>
            <View style={styles.card}>
              <Text style={styles.header}>Global Statistics</Text>
              <View style={styles.filterButtons}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    router.push('/Filters');
                  }}
                >
                  <Text>Filters</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    getData();
                  }}
                >
                  <Text>Clear Filters</Text>
                </TouchableOpacity>
              </View>

              <Table>
                <Row
                  style={styles.headerRow}
                  textStyle={styles.headerRowText}
                  data={sharedState.tableHead}
                />

                {sharedState.tableData.map((rowData, indexR) => (
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
              </Table>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default GeneralStats;

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
    marginTop: 30,
    marginHorizontal: 10,
    width: '45%'
  },
  text: {
    color: COLORS.tertiary
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
  filterButtons: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
