import { Alert } from "react-native";
import { removeGoogleCalendarToken, setGoogleCalendarToken } from "../../redux/app/appAction";
import GoogleAuthService from "../GoogleAuth/googleAuthService";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";


export const googleAuthService = () => {
    const dispatch = useAppDispatch();
    const googleCalendarToken = useAppSelector((state) => state.appState.googleCalendarToken);

    const handleGoogleCalendarAuth = async () => {
        try {
            let accessToken = googleCalendarToken;
            if (!accessToken) {
                const { tokens } = await GoogleAuthService.signInWithGoogle();
                accessToken = tokens.accessToken;
                dispatch(setGoogleCalendarToken(accessToken));
            }
            const calendarConnected = await checkGoogleCalendarAccess(accessToken);
            if (calendarConnected) {
                Alert.alert("Success", "Google Calendar Connected Successfully!");
                return true;
            } else {
                throw new Error("Unable to connect to Google Calendar.");
            }
        } catch (error) {
            console.error("Calendar Auth Error:", error);
            dispatch(removeGoogleCalendarToken());
            Alert.alert("Failed", "Could not authenticate Google Calendar.");
            return false;
        }
    };

    const checkGoogleCalendarAccess = async (accessToken: string) => {
        try {
            const response = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
                method: "GET",
                headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            });
            return response.ok;
        } catch (error) {
            console.error("Error checking Google Calendar access:", error);
            return false;
        }
    };

    const validateAndRefreshToken = async (
        googleCalendarToken: string,
        setIsAuthenticated
    ) => {
        const isValid = await checkGoogleCalendarAccess(googleCalendarToken);
        if (!isValid) {
            const success = await handleGoogleCalendarAuth();
            if (!success) {
                dispatch(removeGoogleCalendarToken());
                setIsAuthenticated(false);
                Alert.alert("Session Expired", "Please sign in again.", [{ text: "OK", onPress: () => GoogleAuthService.signInWithGoogle() }]);
            }
        }
    }

    return { handleGoogleCalendarAuth, checkGoogleCalendarAccess, validateAndRefreshToken }
}