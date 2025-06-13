import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'expo-status-bar';

import { store, persistor } from 'core/src/store';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <MainNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
