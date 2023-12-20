import axios from 'axios';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useEffect } from 'react';
import { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity
} from 'react-native';
import { COLORS } from '../constants';
import { API_URL } from '@env';
import { useSession } from '../components/AuthProvider';

const NewSession = () => {
  const { session } = useSession();
  const [location, setLocation] = useState();
  const [buffs, setBuffs] = useState([]);
  const [buffGroups, setBuffGroups] = useState(null);
  const [items, setItems] = useState();
  const [classes, setClasses] = useState([]);
  const [silver, setSilver] = useState(0);
  const [error, setError] = useState('');
  const { id } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      try {
        const responseLocation = await axios.get(
          API_URL + '/api/location/' + id,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: session
            }
          }
        );
        const responseBuffs = await axios.get(API_URL + '/api/buff/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: session
          }
        });
        const responseClasses = await axios.get(API_URL + '/api/char_class/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: session
          }
        });
        if (responseLocation.data && responseBuffs.data && responseClasses) {
          setLocation(responseLocation.data);
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
          setItems(
            responseLocation.data.items.reduce((result, value) => {
              result[value._id] = '0';
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

  const addSession = async (values) => {
    if (!silver) {
      setError("You can't add empty session");
      return;
    }
    try {
      const response = await axios.post(
        API_URL + '/api/session/create',
        {
          location: location._id,
          hours: parseInt(values.hours, 10) || 0,
          minutes: parseInt(values.minutes, 10) || 0,
          agris: parseInt(values.agris, 10) || 0,
          silver_total: silver,
          char_class: values.class,
          buffs: Object.values(values.buffs).filter((value) => value !== ''),
          items: Object.keys(values.items).map((key) => {
            return { _id: key, amount: values.items[key] || 0 };
          })
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: session
          }
        }
      );
      if (response.data) {
        router.back();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSilverChange = (itemsObj) => {
    setSilver(
      Object.keys(itemsObj).reduce((result, val) => {
        const item = location.items.find((item) => item._id == val);
        const itemAmount = parseInt(itemsObj[val], 10) || 0;
        const sellPrice = item ? item.sellPrice || 1 : 1;
        return result + itemAmount * sellPrice;
      }, 0)
    );
  };

  if (!location || !buffs || !buffGroups || !items || !classes) {
    return (
      <>
        <Stack.Screen options={{ animation: 'slide_from_bottom' }} />
        <View style={styles.container}>
          <Text style={styles.text}>Loading...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ animation: 'slide_from_bottom' }} />
      <View style={styles.container}>
        <Text style={styles.locationName}>{location.name}</Text>
        <ScrollView>
          <Formik
            initialValues={{
              hours: '',
              minutes: '',
              agris: '',
              class: classes[0]._id,
              buffs: buffGroups,
              items: items
            }}
            onSubmit={(values) => addSession(values)}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              values
            }) => (
              <View style={{ marginBottom: 40 }}>
                <View style={styles.card}>
                  <Text style={styles.header}>Time</Text>
                  <View style={styles.innerCard}>
                    <TextInput
                      name='hours'
                      style={styles.input}
                      placeholder='Hours'
                      placeholderTextColor={COLORS.tertiary}
                      onChangeText={handleChange('hours')}
                      onBlur={handleBlur('hours')}
                      value={values.hours}
                      keyboardType='numeric'
                    />
                    <TextInput
                      name='minutes'
                      style={styles.input}
                      placeholder='Minutes'
                      placeholderTextColor={COLORS.tertiary}
                      onChangeText={handleChange('minutes')}
                      onBlur={handleBlur('minutes')}
                      value={values.minutes}
                      keyboardType='numeric'
                    />
                  </View>
                </View>

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
                            uri: 'data:image/octet-stream;base64,' + item.logo
                          }}
                        />
                      ) : (
                        <Image
                          style={styles.image}
                          source={{
                            uri: 'data:image/octet-stream;base64,' + item.logo
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
                {values.buffs['Agris'] && (
                  <View style={styles.card}>
                    <Text style={styles.header}>Agris</Text>
                    <TextInput
                      name='agris'
                      style={styles.input}
                      placeholder='Agris'
                      placeholderTextColor={COLORS.tertiary}
                      onChangeText={handleChange('agris')}
                      onBlur={handleBlur('agris')}
                      value={values.agris}
                      keyboardType='numeric'
                    />
                  </View>
                )}
                <View style={styles.card}>
                  <Text style={styles.header}>Items</Text>

                  {location.items.map((item) => (
                    <View style={styles.innerCard} key={item._id}>
                      <Image
                        style={styles.itemImage}
                        source={{
                          uri: 'data:image/octet-stream;base64,' + item.logo
                        }}
                      />
                      <TextInput
                        name={item.name}
                        style={styles.input}
                        placeholder={item.name}
                        placeholderTextColor={COLORS.tertiary}
                        onChangeText={(text) => {
                          handleChange('items.' + item._id)(text);
                          handleSilverChange(values.items);
                        }}
                        onBlur={handleBlur('items.' + item._id)}
                        value={values.items[item._id]}
                        keyboardType='numeric'
                      />
                    </View>
                  ))}
                </View>
                <View style={styles.card}>
                  <Text style={styles.header}>Silver Per Hour</Text>
                  <View style={styles.innerCard}>
                    <Text style={styles.text}>
                      {Math.floor(
                        (silver /
                          ((parseInt(values.hours, 10) || 0) * 60 +
                            (parseInt(values.minutes, 10) || 0))) *
                          60 || 0
                      ).toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.card}>
                  <Text style={styles.header}>Silver Total</Text>
                  <View style={styles.innerCard}>
                    <Text style={styles.text}>{silver.toLocaleString()}</Text>
                  </View>
                  {error && (
                    <View style={styles.errorCard}>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text>Add Session</Text>
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
            )}
          </Formik>
        </ScrollView>
      </View>
    </>
  );
};

export default NewSession;

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
  card: {
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
    padding: 20,
    width: Dimensions.get('window').width - 40,
    margin: 10
  },
  innerCard: {
    flexDirection: 'row',
    alignItems: 'center'
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
  }
});
