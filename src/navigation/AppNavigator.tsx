import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import SplashScreen from '../screens/Splash/SplashScreen';
import StackNavigator from './StackNavigator';
import { useAppSelector } from '../redux/hooks';

const AppNavigator = () => {
  // const isAuthenticated = false; // Replace with Redux selector
  const [isSplashVisible, setSplashVisible] = useState(true);
  const token = useAppSelector(state => state.appState.token);

  const isAuthenticated = (token.accessToken != null) ? true : false;
  const handleSplashEnd = () => {
    setSplashVisible(false);
  };

  return (
    <>
      {isSplashVisible ? (
        <SplashScreen onSplashEnd={handleSplashEnd} />
      ) : (
        <NavigationContainer>
          {isAuthenticated ? <StackNavigator /> : <AuthNavigator />}
          {/* <AuthNavigator /> */}
        </NavigationContainer>
      )}
    </>
  );
};

export default AppNavigator;
