import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
    webClientId: '676967008945-ts81dpht7cjv1gjvv90f3r9iut8topfr.apps.googleusercontent.com',
    // androidClientId: '676967008945-1ok62fv557i00m0l9n528379ptoav9ap.apps.googleusercontent.com',
    iosClientId: '676967008945-t0lvjkolmp7klhd5pgf7b5vgjfkj4p0q.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'], 
});

const GoogleAuthService = {
    signInWithGoogle: async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const tokens = await GoogleSignin.getTokens(); // Get access & refresh tokens

            console.log('✅ Tokens:', tokens);
            console.log('✅ User Info:', userInfo);

            // ✅ Store tokens securely in AsyncStorage
            await AsyncStorage.setItem('google_access_token', tokens.accessToken);
            // await AsyncStorage.setItem('google_refresh_token', tokens.refreshToken);
            await AsyncStorage.setItem('google_user_info', JSON.stringify(userInfo));

            // ✅ Check Google Calendar access
            await GoogleAuthService.requestCalendarAccess(tokens.accessToken);

            return { userInfo, tokens };
        } catch (error) {
            console.error('❌ Google Sign-In Error:', error);
            throw error;
        }
    },

    isAuthenticated: async () => {
        return await GoogleSignin.isSignedIn();
    },

    getAccessToken: async () => {
        return await AsyncStorage.getItem('google_access_token');
    },

    getUserInfo: async () => {
        const userInfo = await AsyncStorage.getItem('google_user_info');
        return userInfo ? JSON.parse(userInfo) : null;
    },

    signOut: async () => {
        await GoogleSignin.signOut();
        await AsyncStorage.removeItem('google_access_token');
        await AsyncStorage.removeItem('google_refresh_token');
        await AsyncStorage.removeItem('google_user_info');
    },

    requestCalendarAccess: async (accessToken: string) => {
        try {
            const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                console.log('✅ Google Calendar Connected Successfully!');
                return true;
            } else {
                const errorData = await response.json();
                console.error('❌ Google Calendar Access Denied:', errorData);
                throw new Error(errorData.error.message || 'Google Calendar access failed.');
            }
        } catch (error) {
            console.error('❌ Google Calendar API Error:', error);
            throw error;
        }
    }
};

export default GoogleAuthService;
