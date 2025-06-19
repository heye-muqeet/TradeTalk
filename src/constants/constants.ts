import { Platform } from "react-native";

// API Configuration
const API = {
  // http://localhost:3000/api/v1/sendVerificationCode
  // http://localhost:3000/api/v1
  // BASE_URL: 'https://generous-wisdom-production.up.railway.app/api/v1',
  BASE_URL: 'http://192.168.1.8:3000/api/users',
  BASE_URL2: 'http://192.168.1.8:3000/api',
  BASE_IP: 'http://192.168.1.8:3000',
  // BASE_URL: 'http://192.168.100.10:3000/api/users',
  TIMEOUT: 5000, // Timeout in milliseconds
  ENDPOINTS: {
    SIGN_UP: '/signup',
    LOGIN: '/login',
    VERIFY_VERIFICATION_CODE: '/verify',
    SEND_VERIFICATION_CODE: '/sendVerificationCode',
    PROFILE: '/profiles',
    SAVE_PAGE: '/page-data',
    PAGES: '/pages',
    GET_LATEST_BOOK_NUMBER: '/latest-book-number',
  },
};

// Screen Names
const SCREENS = {
  SPLASH: "Splash",
  ONBOARDING: "Onboarding",
  LOGIN: "LoginScreen",
  SIGNUP: "SignupScreen",
  MAIN: "MainScreen",
  CALENDAR: "CalendarScreen",
  EVENTS: "EventListScreen",
  INVOICE: "InvoicesList",
  FORGOT_PASSWORD: "ForgotPassword",
  CREATE_PASSWORD: "CreatePassword",
  VERIFICATION: "Verification",
  HOME: "Home",
  TEMP: "temporay",
  MAIN_TEMP: "MainTemp"
  // Add more screens as needed
};

const THEME = {
  TRANSPARENT: "transparent",

  // **Primary Theme Colors**
  PRIMARY: "#176B87",     // Deep Teal
  PRIMARY_DARK: "#0E4F68", // Darker Teal (Contrast)
  PRIMARY_LIGHT: "#48A1C1", // Lighter Teal (Contrast)

  DARK: "#64A5FA",       // Bright Sky Blue
  DARK_DARK: "#4280D7",  // Deeper Blue (Contrast)
  DARK_LIGHT: "#92C6FF", // Softer Blue (Contrast)

  LIGHT: "#B4D4FF",      // Soft Pastel Blue
  LIGHT_DARK: "#8EB9E8", // Deeper Pastel Blue (Contrast)
  LIGHT_LIGHT: "#D6E7FF", // Almost White Blue (High Contrast)

  SECONDARY: "#EEF5FF",  // Off-White with a Blue Tint
  SECONDARY_DARK: "#D1E0F2", // Slightly Darker Off-White
  SECONDARY_LIGHT: "#F8FBFF", // Almost Pure White

  BLACK: "black",      // Dark Grayish Black
  BLACK_DARK: "#2A2A2A", // Even Darker Gray
  BLACK_LIGHT: "#6A6A6A", // Softer Black

  WHITE: "#FFFFFF",      // True White
  WHITE_DARK: "#F0F0F0", // Slight Gray Tint for Contrast
  WHITE_LIGHT: "#FFFFFF", // Same as True White
  DEEP_RED: "#B22222",
};

const COLORS = {
  TRANSPARENT: THEME.TRANSPARENT,
  WHITE: THEME.WHITE,
  BLACK: THEME.BLACK,

  BACKGROUND: {
    PRIMARY: THEME.PRIMARY,
    PRIMARY_DARK: THEME.PRIMARY_DARK,
    PRIMARY_LIGHT: THEME.PRIMARY_LIGHT,

    SECONDARY: THEME.SECONDARY,
    SECONDARY_DARK: THEME.SECONDARY_DARK,
    SECONDARY_LIGHT: THEME.SECONDARY_LIGHT,

    WHITE: THEME.WHITE,
    BLACK: THEME.BLACK,
    TRANSPARENT: THEME.TRANSPARENT,
  },

  TEXT: {
    PRIMARY: THEME.PRIMARY,
    PRIMARY_DARK: THEME.PRIMARY_DARK,
    PRIMARY_LIGHT: THEME.PRIMARY_LIGHT,

    SECONDARY: THEME.SECONDARY,
    SECONDARY_DARK: THEME.SECONDARY_DARK,
    SECONDARY_LIGHT: THEME.SECONDARY_LIGHT,

    WHITE: THEME.WHITE,
    BLACK: THEME.BLACK,

    ERROR: THEME.DEEP_RED,
  },

  INPUT: {
    TEXT: THEME.BLACK_LIGHT,
    BACKGROUND: THEME.LIGHT,
    BORDER: THEME.DARK,
    PLACEHOLDER: `${THEME.BLACK_LIGHT}AA`,
  },

  BUTTON: {
    PRIMARY: THEME.PRIMARY,
    PRIMARY_HOVER: THEME.PRIMARY_DARK,
    SECONDARY: THEME.DARK,
    SECONDARY_HOVER: THEME.DARK_DARK,
    TEXT: THEME.WHITE,
  },
};



const COMMON_DATA = {
  ENGLISH_LANG: 'english' as const,
  DEVICE_TYPE: Platform.OS.toUpperCase() as 'IOS' | 'ANDROID' | 'WEB',
  PAGGING_COUNT: 10,

  // Terms & privacy link
  // PRIVACY_LINK: 'https://sortapp.mobileapphero.com/privacy-policy',
  // TERMS_LINK: 'https://sortapp.mobileapphero.com/terms-and-conditions',
};

// App Configurations
const CONFIG = {
  APP_TITLE: "TradeTalk",
  APP_NAME: "TradeTalk",
  VERSION: "1.0",
  SUPPORT_EMAIL: "support@example.c",
  DEBUG_MODE: __DEV__,
};

// Redux Actions
const ACTIONS = {
  APP: {
    SET_USER: 'APP/USER_DATA',
    DELETE_USER: 'APP/SET_USER_INITIAL_DATA',
    SET_THEME: 'APP/IS_THEME',
    DEVICE_TOKEN: 'APP/DEVICE_TOKEN',
    SET_TOKEN: 'SET_AUTH_TOKEN',
    SET_PROFILE_DATA: 'SET_PROFILE_DATA',
    SET_SELECTED_PROFILE: 'SET_SELECTED_PROFILE',
    SET_GOOGLE_CALENDAR_TOKEN: 'SET_GOOGLE_CALENDAR_TOKEN',
    REMOVE_GOOGLE_CALENDAR_TOKEN: 'REMOVE_GOOGLE_CALENDAR_TOKEN',
    // LOGIN_REQUEST: "AUTH/LOGIN_REQUEST",
    // LOGIN_SUCCESS: "AUTH/LOGIN_SUCCESS",
    // LOGIN_FAILURE: "AUTH/LOGIN_FAILURE",
    LOGOUT: "LOGOUT",
  },
  HANDLER: {
    // SHOW_ALERT: "SHOW_ALERT",
    // HIDE_ALERT: "HIDE_ALERT",
    GET_DEVICES_INFO: "GET_DEVICES_INFO",
    DEVICE_INFO_ERROR: "DEVICE_INFO_ERROR",
  },
}

// Font Constants
const FONTS = {
  REGULAR: 'SpaceGrotesk-Regular',
  BOLD: 'SpaceGrotesk-Bold',
  LIGHT: 'SpaceGrotesk-Light',
  MEDIUM: 'SpaceGrotesk-Medium',
  SEMIBOLD: 'SpaceGrotesk-SemiBold',
}

const SOCIAL_DETAIL = {
  FB_CLIENT_ID: '',
  FB_CLIENT_SECERET: '',
  FB_REQUEST: '',
  GOOGLE_WEB_CLIENT_ID: '',
  APPLE: 'A',
  GOOGLE: 'G',
  FB: 'F',
  NORMAL_LOGIN: 'N',
};





export { API, SCREENS, COLORS, FONTS, COMMON_DATA, SOCIAL_DETAIL, CONFIG, ACTIONS, THEME }