import * as SecureStore from 'expo-secure-store';
import * as React from 'react';
import { Platform } from 'react-native';

function useAsyncState(initialValue = [true, null]) {
  return React.useReducer(
    (state, action = null) => [false, action],
    initialValue
  );
}

export async function setStorageItemAsync(key, value) {
  if (value == null) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export function useStorageState(key) {
  const [state, setState] = useAsyncState();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        let value;

        value = await SecureStore.getItemAsync(key);

        setState(value);
      } catch (error) {
        console.error('Error while fetching storage data:', error);
      }
    };

    fetchData();
  }, [key]);

  const setValue = React.useCallback(
    async (value) => {
      try {
        setState(value);
        await setStorageItemAsync(key, value);
      } catch (error) {
        console.error('Error while setting storage data:', error);
      }
    },
    [key]
  );

  return [state, setValue];
}
