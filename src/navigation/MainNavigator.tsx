import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import InvoiceScreen from '../screens/Invoice/InvoiceScreen';
import { SCREENS, THEME } from '../constants/constants';
import Icon from 'react-native-vector-icons/Ionicons';
import { responsiveVertical } from '../components/responsive';
import { MainScreen } from '../screens';
// import { MainScreen } from '../screens';
// import MainTemp from '../screens/temporary/MainTemp';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  console.log( "i am in main nav")
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: 'white',
          height: responsiveVertical(90),
        },
        tabBarActiveTintColor: THEME.PRIMARY,
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name={SCREENS.MAIN}
        // name={SCREENS.MAIN_TEMP}
        component={MainScreen}
        // component={MainTemp}
        options={{
          title: 'Home',
          headerShown: false,
          tabBarStyle: {
            display: 'none'
          },
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />
      {/* <Tab.Screen
        name={SCREENS.INVOICE}
        component={InvoiceScreen}
        options={{
          title: 'Invoices',
          headerShown: false,
          tabBarStyle: {
            display: 'none'
          },
          tabBarIcon: ({ color, size }) => (
            <Icon name="document-text-outline" size={size} color={color} />
          ),
        }}
      /> */}
    </Tab.Navigator>
  );
};

export default MainNavigator;
