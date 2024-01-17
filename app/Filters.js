import axios from 'axios';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Pressable
} from 'react-native';
import { useSession } from '../components/AuthProvider';

import { COLORS } from '../constants';

const Filters = () => {
    const router = useRouter();
    const { session } = useSession();
    const [buffs, setBuffs] = useState([]);
    const [buffGroups, setBuffGroups] = useState(null);
    const [classes, setClasses] = useState([]);

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
                            ...new Set(
                                responseBuffs.data.map(
                                    (item) => item.buff_group
                                )
                            )
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

    if (!buffs || !buffGroups || !classes) {
        return (
            <Pressable
                style={{ flex: 1 }}
                onPress={(event) => {
                    if (event.target === event.currentTarget) {
                        router.back();
                    }
                }}
            >
                <>
                    <Stack.Screen
                        options={{ presentation: 'transparentModal' }}
                    />
                    <View style={styles.container}>
                        <Text style={styles.text}>Loading...</Text>
                    </View>
                </>
            </Pressable>
        );
    }

    return (
        <Pressable
            style={{ flex: 1 }}
            onPress={(event) => {
                if (event.target === event.currentTarget) {
                    router.back();
                }
            }}
        >
            <>
                <Stack.Screen options={{ presentation: 'transparentModal' }} />
                <View style={styles.container}>
                    <Text style={styles.text}>Hi</Text>
                </View>
            </>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 60,
        marginHorizontal: 40,
        borderRadius: 5
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
    }
});

export default Filters;
