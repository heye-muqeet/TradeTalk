import { GoogleSignin } from "@react-native-google-signin/google-signin";

const API_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export const createEvent = async (summary: string, startDateTime: string, endDateTime: string) => {
    try {
        const { accessToken } = await GoogleSignin.getTokens();
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                summary,
                start: { dateTime: startDateTime, timeZone: "America/New_York" },
                end: { dateTime: endDateTime, timeZone: "America/New_York" },
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Google Calendar Error:", error);
    }
};

export const fetchEvents = async (date: string) => {
    try {
        const { accessToken } = await GoogleSignin.getTokens();
        const response = await fetch(`${API_URL}?timeMin=${date}T00:00:00Z&timeMax=${date}T23:59:59Z`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error("Google Calendar Fetch Error:", error);
        return [];
    }
};
