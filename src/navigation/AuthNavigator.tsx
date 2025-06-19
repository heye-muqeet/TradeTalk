import React from 'react';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { LoginScreen, SignupScreen, VerificationCode } from '../screens';
import { SCREENS } from '../constants/constants';
import { Animated } from 'react-native';
import StackNavigator from './StackNavigator';
import MainNavigator from './MainNavigator';
import temporary from '../screens/temporary/temporary';
import CalendarScreen from '../screens/ManualEvents/CalendarScreen';
const Stack = createStackNavigator<any>();

const forFade = ({ current, next }: any) => {
    return {
        cardStyle: {
            opacity: current.progress, // Fade in
        },
    };
};

const AuthNavigator = () => {
    return (
        <Stack.Navigator
            // initialRouteName={SCREENS.MAIN}
            initialRouteName={SCREENS.SIGNUP}
            screenOptions={{
                cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid, // Smooth fade transition
                transitionSpec: {
                    open: { animation: 'timing', config: { duration: 300 } },
                    close: { animation: 'timing', config: { duration: 300 } },
                },
                gestureEnabled: true,
                headerShown: false,
            }}

        >

            {/* <Stack.Screen name={SCREENS.TEMP} component={temporary} /> */}
            <Stack.Screen name={SCREENS.SIGNUP} component={SignupScreen} />
            <Stack.Screen name={SCREENS.VERIFICATION} component={VerificationCode} />
            <Stack.Screen name={SCREENS.LOGIN} component={LoginScreen} />
            <Stack.Screen name={SCREENS.MAIN} component={MainNavigator} />
            {/* <Stack.Screen name={SCREENS.MAIN_TEMP} component={MainNavigator} /> */}
            {/* <Stack.Screen name={SCREENS.CALENDAR} component={CalendarScreen} /> */}
            {/* <Stack.Screen name={SCREENS.INVOICE} component={InvoiceScreen} /> */}
        </Stack.Navigator>
    );
};

export default AuthNavigator;
