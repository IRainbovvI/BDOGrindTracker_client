import React from 'react';
import { useStorageState } from './useStorageState';
import axios from 'axios';
import { useNavigation, useRouter } from 'expo-router';
import { CommonActions } from '@react-navigation/native';

const AuthContext = React.createContext({
    signIn: (values) => {},
    signOut: () => {},
    signUp: (values) => {},
    session: null,
    isLoading: false
});

// This hook can be used to access the user info.
export function useSession() {
    const value = React.useContext(AuthContext);
    // if (process.env.NODE_ENV !== 'production') {
    //   if (!value) {
    //     throw new Error('useSession must be wrapped in a <SessionProvider />');
    //   }
    // }

    return value;
}

export function SessionProvider(props) {
    const [[isLoading, session], setSession] = useStorageState('session');
    const router = useRouter();
    const navigation = useNavigation();

    return (
        <AuthContext.Provider
            value={{
                signIn: async (values) => {
                    try {
                        const response = await axios.post(
                            process.env.REACT_APP_API_URL + '/api/user/signin',
                            values,
                            {
                                headers: { 'Content-Type': 'application/json' }
                            }
                        );
                        if (response.data.token) {
                            await setSession(response.data.token);
                            navigation.dispatch(
                                CommonActions.reset({
                                    routes: [{ name: 'SignIn' }]
                                })
                            );
                            router.replace('/MyStats');
                        }
                    } catch (error) {
                        console.log(error);
                    }
                },
                signUp: async (values) => {
                    try {
                        const response = await axios.post(
                            process.env.REACT_APP_API_URL + '/api/user/signup',
                            values,
                            {
                                headers: { 'Content-Type': 'application/json' }
                            }
                        );
                        if (response.data.token) {
                            await setSession(response.data.token);
                            navigation.dispatch(
                                CommonActions.reset({
                                    routes: [{ name: 'SignUp' }]
                                })
                            );
                            router.replace('/MyStats');
                        }
                    } catch (error) {
                        console.log(error);
                    }
                },
                signOut: async () => {
                    await setSession(null);
                    router.replace('/');
                },
                session,
                isLoading
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
}
