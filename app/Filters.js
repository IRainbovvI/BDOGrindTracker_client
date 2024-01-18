import axios from 'axios';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Pressable,
  TextInput,
  Image,
  ScrollView
} from 'react-native';
import { useSession } from '../components/AuthProvider';

import { COLORS } from '../constants';
import { useStatsContext } from '../components/StatsContext';

const filterSchema = Yup.object().shape({
  class: Yup.string(),
  buffs: Yup.object(),
  dateStart: Yup.string().matches(
    /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/,
    'Invalid date format'
  ),
  dateEnd: Yup.string().matches(
    /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/,
    'Invalid date format'
  )
});

const Filters = () => {
  const router = useRouter();
  const { session } = useSession();
  const [buffs, setBuffs] = useState([]);
  const [buffGroups, setBuffGroups] = useState(null);
  const [classes, setClasses] = useState([]);
  const { updateSharedState } = useStatsContext();

  useEffect(() => {
    const getData = async () => {
      try {
        const responseBuffs = await axios.get(
          process.env.REACT_APP_API_URL + '/api/buff/',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: session
            }
          }
        );
        const responseClasses = await axios.get(
          process.env.REACT_APP_API_URL + '/api/char_class/',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: session
            }
          }
        );
        if (responseBuffs.data && responseClasses.data) {
          setBuffs(responseBuffs.data);
          setClasses(responseClasses.data);
          setBuffGroups(
            [
              ...new Set(responseBuffs.data.map((item) => item.buff_group))
            ].reduce((result, value) => {
              result[value] = '';
              return result;
            }, {})
          );
        }
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, []);

  const submitFilteredRequest = async (values) => {
    try {
      const responseSessions = await axios.post(
        process.env.REACT_APP_API_URL + '/api/session/filtered',
        {
          char_class: values.class,
          startDate: values.dateStart,
          endDate: values.dateEnd,
          buffs: Object.values(values.buffs)
        },
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

        const tableBody = {
          tableHead,
          tableData: sortedTableData
        };
        router.back();
        updateSharedState(tableBody);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!buffs || !buffGroups || !classes) {
    return (
      <Pressable
        style={{
          flex: 1
        }}
        onPress={(event) => {
          if (event.target === event.currentTarget) {
            router.back();
          }
        }}
      >
        <>
          <Stack.Screen options={{ presentation: 'transparentModal' }} />
          <View style={styles.container}>
            <Text style={styles.text}>Loading...</Text>
          </View>
        </>
      </Pressable>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom'
        }}
      />
      <Pressable
        style={{ flex: 1, alignItems: 'center' }}
        onPress={(event) => {
          if (event.target === event.currentTarget) {
            router.back();
          }
        }}
      >
        <>
          <View style={styles.container}>
            <ScrollView style={{ width: '100%' }}>
              <Pressable>
                <Formik
                  initialValues={{
                    class: '',
                    buffs: buffGroups,
                    dateStart: '',
                    dateEnd: ''
                  }}
                  validationSchema={filterSchema}
                  onSubmit={(values) => submitFilteredRequest(values)}
                >
                  {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    setFieldValue,
                    touched,
                    errors,
                    values
                  }) => (
                    <View>
                      <View style={styles.card}>
                        <Text style={styles.header}>Classes</Text>
                        {classes.map((item) => (
                          <Pressable
                            style={styles.innerCard}
                            key={item._id}
                            onPress={() => {
                              setFieldValue('class', item._id);
                            }}
                          >
                            {values.class === item._id ? (
                              <Image
                                style={styles.selectedImage}
                                source={{
                                  uri:
                                    'data:image/octet-stream;base64,' +
                                    item.logo
                                }}
                              />
                            ) : (
                              <Image
                                style={styles.image}
                                source={{
                                  uri:
                                    'data:image/octet-stream;base64,' +
                                    item.logo
                                }}
                              />
                            )}
                            <Text style={styles.text}>{item.name}</Text>
                          </Pressable>
                        ))}
                      </View>

                      <View style={styles.card}>
                        <Text style={styles.header}>Buffs</Text>
                        {Object.keys(buffGroups).map((group, index) => (
                          <View style={styles.buffCard} key={index}>
                            <Text style={styles.buffGroup}>{group}</Text>
                            {buffs
                              .filter((buff) => buff.buff_group === group)
                              .map((buff) => (
                                <Pressable
                                  style={styles.innerCard}
                                  key={buff._id}
                                  onPress={() => {
                                    if (values.buffs[group] === buff._id) {
                                      setFieldValue('buffs.' + group, '');
                                    } else {
                                      setFieldValue('buffs.' + group, buff._id);
                                    }
                                  }}
                                >
                                  {values.buffs[group] === buff._id ? (
                                    <Image
                                      style={styles.selectedImage}
                                      source={{
                                        uri:
                                          'data:image/octet-stream;base64,' +
                                          buff.logo
                                      }}
                                    />
                                  ) : (
                                    <Image
                                      style={styles.image}
                                      source={{
                                        uri:
                                          'data:image/octet-stream;base64,' +
                                          buff.logo
                                      }}
                                    />
                                  )}
                                  <Text style={styles.text}>{buff.name}</Text>
                                </Pressable>
                              ))}
                          </View>
                        ))}
                      </View>

                      <View style={styles.card}>
                        <Text style={styles.header}>Date Range</Text>
                        <TextInput
                          name='dateStart'
                          style={styles.input}
                          placeholder='Start Date (dd.mm.yyyy)'
                          placeholderTextColor={COLORS.tertiary}
                          onChangeText={handleChange('dateStart')}
                          onBlur={handleBlur('dateStart')}
                          value={values.dateStart}
                        />
                        {touched.dateStart && errors.dateStart && (
                          <Text style={styles.errorText}>
                            {errors.dateStart}
                          </Text>
                        )}

                        <TextInput
                          name='dateEnd'
                          style={styles.input}
                          placeholder='End Date (dd.mm.yyyy)'
                          placeholderTextColor={COLORS.tertiary}
                          onChangeText={handleChange('dateEnd')}
                          onBlur={handleBlur('dateEnd')}
                          value={values.dateEnd}
                        />
                        {touched.dateEnd && errors.dateEnd && (
                          <Text style={styles.errorText}>{errors.dateEnd}</Text>
                        )}
                      </View>
                      <View style={styles.buttonGroup}>
                        <TouchableOpacity
                          style={styles.button}
                          onPress={handleSubmit}
                        >
                          <Text>Apply Filters</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.button}
                          onPress={() => {
                            router.back();
                          }}
                        >
                          <Text>Go Back</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </Formik>
              </Pressable>
            </ScrollView>
          </View>
        </>
      </Pressable>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    opacity: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width * 0.8,
    marginVertical: 70,
    borderRadius: 5,
    padding: 10
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
    color: COLORS.tertiary,
    fontSize: 14
  },
  h: {
    color: COLORS.tertiary,
    alignSelf: 'center',
    fontSize: 25,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  card: {
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
    padding: 20,
    margin: 5,
    alignSelf: 'center',
    width: '100%'
  },
  innerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%'
  },
  input: {
    height: 50,
    borderWidth: 1,
    flex: 1,
    margin: 5,
    borderRadius: 5,
    paddingHorizontal: 10,
    borderColor: COLORS.tertiary,
    color: COLORS.white
  },
  header: {
    color: COLORS.tertiary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tertiary,
    marginBottom: 10,
    fontSize: 20
  },
  image: {
    margin: 4,
    marginRight: 10,
    width: 50,
    height: 50
  },
  selectedImage: {
    margin: 4,
    marginRight: 10,
    width: 50,
    height: 50,
    borderWidth: 3,
    borderColor: COLORS.tertiary,
    borderRadius: 5
  },
  buffCard: {
    marginVertical: 10,
    padding: 5
  },
  buffGroup: {
    color: COLORS.tertiary,
    fontSize: 17
  },
  itemImage: {
    width: 35,
    height: 35,
    margin: 3
  },
  locationName: {
    backgroundColor: COLORS.primary,
    marginTop: 40,
    color: COLORS.tertiary,
    marginBottom: 10,
    fontSize: 20
  },
  errorCard: {
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 5,
    padding: 5,
    marginVertical: 5
  },
  errorText: {
    color: 'red',
    fontSize: 10
  },
  buttonGroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  }
});

export default Filters;
