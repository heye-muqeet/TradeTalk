import { ACTIONS } from "../../constants/constants";

export const setUserType = ACTIONS.APP.SET_USER;
export const setTokenType = ACTIONS.APP.SET_TOKEN;
export const setProfileDataType = ACTIONS.APP.SET_PROFILE_DATA;
export const setSelectedProfileType = ACTIONS.APP.SET_SELECTED_PROFILE; // New action type
export const logoutType = ACTIONS.APP.LOGOUT;
export const setGoogleCalendarTokenType = ACTIONS.APP.SET_GOOGLE_CALENDAR_TOKEN;
export const removeGoogleCalendarTokenType = ACTIONS.APP.REMOVE_GOOGLE_CALENDAR_TOKEN;

const setUser = (data: Record<string, any>): { type: string; payload: Record<string, any> } => {
    return {
        type: setUserType,
        payload: data,
    };
};

const setToken = (tokenData: { accessToken: string; refreshToken: string }): { type: string; payload: { accessToken: string; refreshToken: string } } => {
    return {
        type: setTokenType,
        payload: tokenData,
    };
};

const setGoogleCalendarToken = (token: string): { type: string; payload: string } => ({
    type: setGoogleCalendarTokenType,
    payload: token,
});

const removeGoogleCalendarToken = (): { type: string } => ({
    type: removeGoogleCalendarTokenType,
});

const setProfileData = (data: any): { type: string; payload: any } => {
    return {
        type: setProfileDataType,
        payload: data,
    };
};

const setSelectedProfile = (profile: any): { type: string; payload: any } => {
    return {
        type: setSelectedProfileType,
        payload: profile,
    };
};

const logout = () => ({
    type: logoutType,
});

export { setUser, setToken, setProfileData, setSelectedProfile, logout, setGoogleCalendarToken, removeGoogleCalendarToken };
