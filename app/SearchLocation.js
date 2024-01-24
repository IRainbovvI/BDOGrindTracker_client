import axios from 'axios';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity
} from 'react-native';
import { useSession } from '../components/AuthProvider';
import { COLORS } from '../constants';

const SearchLocation = () => {
  const { session } = useSession();
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const router = useRouter();
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
  scrollView: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 3,
    borderRadius: 5
  },
  searchCard: {
    height: Dimensions.get('window').height * 0.8,
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
