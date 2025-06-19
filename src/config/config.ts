export const googleAuthConfig = {
    issuer: "https://accounts.google.com",
    clientId: "676967008945-ts81dpht7cjv1gjvv90f3r9iut8topfr.apps.googleusercontent.com",
    redirectUrl: "com.yourapp:/oauth2redirect/google",
    scopes: ["openid", "profile", "email", "https://www.googleapis.com/auth/calendar.events"],
    serviceConfiguration: {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
    },
  };
  