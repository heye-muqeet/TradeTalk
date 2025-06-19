import { PayloadAction } from "@reduxjs/toolkit";
import { setUserType, setTokenType, setProfileDataType, setSelectedProfileType, logoutType, setGoogleCalendarTokenType, removeGoogleCalendarTokenType } from "./appAction";

interface AppState {
    user: Record<string, any> | null;
    token: { accessToken: string | null; refreshToken: string | null } | null;  // Add authToken
    profileData: any | null;
    selectedProfile: any | null;
    googleCalendarToken: string | null;
}

export const initialState: AppState = {
    user: null,
    token: { accessToken: null, refreshToken: null },
    profileData: null,
    selectedProfile: null,
    googleCalendarToken: null,
};

const appReducer = (state = initialState, action: PayloadAction<any>) => {
    switch (action.type) {
        case setUserType:
            return {
                ...state,
                user: action.payload,
            };
        case setTokenType:
            return {
                ...state,
                token: action.payload, // Store both accessToken and expiresAt
            };
        case setProfileDataType:
            return {
                ...state,
                profileData: action.payload,
            };
        case setSelectedProfileType:
            return {
                ...state,
                selectedProfile: action.payload, // Update selected profile
            };
        case setGoogleCalendarTokenType:
            return { ...state, googleCalendarToken: action.payload }; // ✅ Store Google Calendar Token
        case removeGoogleCalendarTokenType:
            return { ...state, googleCalendarToken: null };
        case logoutType:
            return initialState; // Reset the state on logout
        default:
            return state;
    }
}

export default appReducer;