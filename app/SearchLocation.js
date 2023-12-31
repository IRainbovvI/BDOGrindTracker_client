import axios from 'axios';
import { Link, router, Stack, useRouter } from 'expo-router';
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
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
  View
} from 'react-native';
import { useSession } from '../components/AuthProvider';
import { COLORS } from '../constants';

const SearchLocation = () => {
  const { session } = useSession();
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_API_URL + '/api/location',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: session
            }
          }
        );
        if (response.data) {
          setLocations(response.data);
          setFilteredLocations(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, []);

  if (!locations) {
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
        <View style={styles.searchCard}>
          <Text style={{ ...styles.text, textAlign: 'center' }}>
            Pick a Location
          </Text>
          <TextInput
            name='searchLocation'
            style={styles.input}
            placeholder='Search...'
            placeholderTextColor={COLORS.tertiary}
            onChangeText={(text) => {
              if (text) {
                setFilteredLocations(
                  locations.filter((item) => item.name.includes(text))
                );
              } else {
                setFilteredLocations(locations);
              }
            }}
          />
          <ScrollView style={styles.scrollView}>
            {filteredLocations.map((item) => {
              return (
                <Pressable
                  key={item._id}
                  style={styles.locationButton}
                  onPress={() =>
                    router.replace({
                      pathname: '/NewSession',
                      params: { id: item._id }
                    })
                  }
                >
                  <Image
                    style={styles.image}
                    source={{
                      uri:
                        'data:image/octet-stream;base64,' + item.items[0].logo
                    }}
                  />
                  <Text style={styles.text}>{item.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </>
  );
};

export default SearchLocation;

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
  scrollView: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 3,
    borderRadius: 5
  },
  searchCard: {
    marginVertical: 100,
    backgroundColor: COLORS.secondary,
    padding: 10,
    borderRadius: 10,
    width: Dimensions.get('window').width - 100
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderColor: COLORS.tertiary,
    color: COLORS.white
  },
  locationButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    marginVertical: 3,
    padding: 2,
    borderRadius: 5
  },
  image: {
    width: 30,
    height: 30,
    marginEnd: 5
  }
});
