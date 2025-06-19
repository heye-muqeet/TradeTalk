import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./navigation/AppNavigator";
import { enableScreens } from "react-native-screens";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, store } from "./redux/store";
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { COLORS } from "./constants/constants";

enableScreens();

SystemNavigationBar.stickyImmersive();

const App = () => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "676967008945-ts81dpht7cjv1gjvv90f3r9iut8topfr.apps.googleusercontent.com", // Replace with your Google Web Client ID
      offlineAccess: true,
      scopes: ["https://www.googleapis.com/auth/calendar.events"], // Required for Google Calendar
    });
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider style={{ backgroundColor: COLORS.BACKGROUND.SECONDARY }}>
          <AppNavigator />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
