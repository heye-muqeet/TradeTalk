import React, { useEffect, useState } from 'react';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { SCREENS } from '../constants/constants';
import { StatusBar } from 'react-native';
import { InvoiceScreen, LoginScreen, MainScreen, SignupScreen } from '../screens';
import MainNavigator from './MainNavigator';
import CalendarScreen from '../screens/ManualEvents/CalendarScreen';
import EventListScreen from '../screens/ManualEvents/EventListScreen';
import SplashScreen from '../screens/Splash/SplashScreen';
import InvoicesList from '../screens/Invoice/InvoicesList';

const Stack = createStackNavigator<any>();

const StackNavigator = () => {
    console.log("i am in stack")

    return (
        <>
            <StatusBar hidden={true} />
            <Stack.Navigator
                initialRouteName={SCREENS.MAIN}
                // initialRouteName={SCREENS.MAIN_TEMP}
                screenOptions={{
                    cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid, // Default animation
                    transitionSpec: {
                        open: { animation: 'timing', config: { duration: 100 } },
                        close: { animation: 'timing', config: { duration: 100 } },
                    },
                    headerShown: false,
                }}
            >
                <Stack.Screen name={SCREENS.MAIN} component={MainNavigator} />
                {/* <Stack.Screen name={SCREENS.MAIN_TEMP} component={MainNavigator} /> */}
                <Stack.Screen name={SCREENS.CALENDAR} component={CalendarScreen} />
                <Stack.Screen name={SCREENS.EVENTS} component={EventListScreen} />
                <Stack.Screen name={SCREENS.SPLASH} component={SplashScreen} />
                <Stack.Screen name={SCREENS.INVOICE} component={InvoicesList} />
                {/* <Stack.Screen name={SCREENS.INVOICE} component={MainNavigator} /> */}
            </Stack.Navigator>
        </>
    );
};


export default StackNavigator;
