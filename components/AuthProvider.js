import React from 'react';
import { useStorageState } from './useStorageState';
import axios from 'axios';
import { useNavigation, useRouter } from 'expo-router';
import { CommonActions } from '@react-navigation/native';

const AuthContext = React.createContext({
  signIn: (values) => {},
  signOut: () => {},
  signUp: (values) => {},
  authErr: null,
  session: null,
  isLoading: false,
  setAuthError: (err) => {}
});

export function useSession() {
  const value = React.useContext(AuthContext);

  return value;
}

export function SessionProvider(props) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const [[isError, authErr], setAuthErr] = useStorageState('authErr');
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
              await setAuthErr(null);
              await setSession(response.data.token);
              navigation.dispatch(
                CommonActions.reset({
                  routes: [{ name: 'SignIn' }]
                })
              );
              router.replace('/MyStats');
            }
          } catch (error) {
            if (error.response.data.message) {
              await setAuthErr(error.response.data.message);
            } else {
              console.log(error);
            }
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
              await setAuthErr(null);
              await setSession(response.data.token);
              navigation.dispatch(
                CommonActions.reset({
                  routes: [{ name: 'SignUp' }]
                })
              );
              router.replace('/MyStats');
            }
          } catch (error) {
            if (error.response.data.message) {
              await setAuthErr(error.response.data.message);
            } else {
              console.log(error);
            }
          }
        },
        signOut: async () => {
          await setAuthErr(null);
          await setSession(null);
          router.replace('/');
        },
        setAuthError: async (err) => {
          setAuthErr(err);
        },
        session,
        isLoading,
        authErr
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
