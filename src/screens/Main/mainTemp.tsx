// import React, { useCallback, useEffect, useRef, useState } from "react";
// import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     Modal,
//     ActivityIndicator,
//     Alert,
//     PermissionsAndroid,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import LottieView from "lottie-react-native";
// import Icon from "react-native-vector-icons/Ionicons";
// import AntDesign from "react-native-vector-icons/AntDesign";
// import MaterialIcons from "react-native-vector-icons/MaterialIcons"
// import Voice from "@react-native-voice/voice";
// import Sound from "react-native-sound";
// import RNFS from "react-native-fs";
// import axios from "axios";
// import { FONTS, COLORS, THEME, SCREENS, API } from "../../constants/constants";
// import { useFocusEffect, useNavigation } from "@react-navigation/native";
// import styles from "./MainScreen.styles";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import GoogleAuthService from "../../utility/googleAuthService";
// import { useAppDispatch, useAppSelector } from "../../redux/hooks";
// import { logout, removeGoogleCalendarToken, setGoogleCalendarToken } from "../../redux/app/appAction";
// import { ConversationContext, InvoiceInfo, ClientData, EventInfo } from "../../constants/types";

// Sound.setCategory('Playback');

// const MainScreen: React.FC = () => {
//     const navigation = useNavigation<any>();
//     const dispatch = useAppDispatch();
//     const googleCalendarToken = useAppSelector((state) => state.appState.googleCalendarToken);
//     const user = useAppSelector((state) => state.appState.user);
//     const userId = user?.id || null;
//     console.log("User:", userId);


//     const [isModalVisible, setModalVisible] = useState(false);
//     const [isListening, setIsListening] = useState(false);
//     const [spokenText, setSpokenText] = useState("");
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [selectedMode, setSelectedMode] = useState<"manual" | "auto" | "invoice" | "">("");
//     const [eventTime, setEventTime] = useState("");
//     const [eventTitle, setEventTitle] = useState("");
//     const [parsedDate, setParsedDate] = useState<Date | null>(null);
//     const [voiceMode, setVoiceMode] = useState<"init" | "response" | "confirm">("init");
//     const [hasMicPermission, setHasMicPermission] = useState(false);
//     const [retryCount, setRetryCount] = useState(0);
//     const MAX_RETRIES = 9;
//     const isVoiceStartingRef = useRef(false);
//     const OPENAI_API_KEY = "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";
//     const GOOGLE_TTS_API_KEY = "AIzaSyBtRcA8BI5LvvgzV1jrQpsxrwXe7gbJ-lM";
//     const [showConfirmationForm, setShowConfirmationForm] = useState(false);
//     const [showInvoiceConfirmationForm, setShowInvoiceConfirmationForm] = useState(false);
//     const [invoiceDetails, setInvoiceDetails] = useState<InvoiceInfo>({
//         clientName: "",
//         jobDescription: "",
//         amount: null,
//         salesTax: null,
//         type: null,
//         date: null,
//         paymentTerms: null,
//         email: null,
//         phoneNumber: null,
//         sendMethod: null,
//         containsClientName: false,
//         containsJobDescription: false,
//         containsAmount: false,
//         containsSalesTax: false,
//         containsType: false,
//         containsDate: false,
//         containsPaymentTerms: false,
//         containsEmail: false,
//         containsPhoneNumber: false,
//     });
//     // Persistent event information that doesn't get reset until event creation
//     const persistentEventInfoRef = useRef<{
//         title: string;
//         date: Date | null;
//         time: string | null;
//         timePeriod: string | null;
//     }>({
//         title: "",
//         date: null,
//         time: null,
//         timePeriod: null
//     });

//     // Persistent invoice information
//     const persistentInvoiceInfoRef = useRef<{
//         clientName: string;
//         jobDescription: string;
//         amount: number | null;
//         salesTax: number | null;
//         type: "invoice" | "estimate" | null;
//         date: string | null;
//         paymentTerms: string | null;
//         email: string | null;
//         phoneNumber: string | null;
//         sendMethod: "email" | "sms" | null;
//     }>({
//         clientName: "",
//         jobDescription: "",
//         amount: null,
//         salesTax: null,
//         type: null,
//         date: null,
//         paymentTerms: null,
//         email: null,
//         phoneNumber: null,
//         sendMethod: null,
//     });

//     const [conversationContext, setConversationContext] = useState<ConversationContext>({
//         title: "",
//         date: null,
//         time: null,
//         timePeriod: null,
//         clientName: "",
//         jobDescription: "",
//         amount: null,
//         salesTax: null,
//         type: null,
//         invoiceDate: null,
//         paymentTerms: null,
//         email: null,
//         phoneNumber: null,
//         fullText: "",
//         needsTitle: false,
//         needsDate: false,
//         needsTime: false,
//         needsExactTime: false,
//         needsClientName: false,
//         needsJobDescription: false,
//         needsAmount: false,
//         needsSalesTax: false,
//         needsType: false,
//         needsInvoiceDate: false,
//         needsPaymentTerms: false,
//         needsEmail: false,
//         needsPhoneNumber: false,
//         needsApproval: false,
//         needsDeliveryMethod: false,
//         lastQuestion: "",
//         lastAskedFor: "",
//         processedInputs: [],
//         isComplete: false,
//         isInvoiceMode: false,
//         isModificationMode: false,
//         requestedChangeField: null,
//     });

//     const speak = async (text: string): Promise<void> => {
//         console.log("Speaking:", text);
//         return new Promise((resolve, reject) => {
//             axios.post(
//                 `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
//                 {
//                     input: { text: text },
//                     voice: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
//                     audioConfig: { audioEncoding: 'MP3' },
//                 }
//             ).then(async (response) => {
//                 const audioContent = response.data.audioContent;
//                 const filePath = `${RNFS.DocumentDirectoryPath}/speech.mp3`;
//                 await RNFS.writeFile(filePath, audioContent, 'base64');
//                 const sound = new Sound(filePath, '', (error) => {
//                     if (error) reject(error);
//                     sound.play((success) => {
//                         sound.release();
//                         resolve();
//                     });
//                 });
//             }).catch(reject);
//         });
//     };

//     const requestMicPermission = async () => {
//         const granted = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//             {
//                 title: "Microphone Permission",
//                 message: "This app needs access to your microphone for voice input.",
//                 buttonNeutral: "Ask Me Later",
//                 buttonNegative: "Cancel",
//                 buttonPositive: "OK",
//             }
//         );
//         setHasMicPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//     };

//     useFocusEffect(
//         useCallback(() => {
//             const checkAuthAndToken = async () => {
//                 const authenticated = await GoogleAuthService.isAuthenticated();
//                 setIsAuthenticated(authenticated);
//                 if (authenticated && googleCalendarToken) await validateAndRefreshToken(googleCalendarToken);
//             };
//             checkAuthAndToken();
//         }, [googleCalendarToken])
//     );

//     useEffect(() => {
//         if (!googleCalendarToken || !isAuthenticated) return;
//         const interval = setInterval(() => validateAndRefreshToken(googleCalendarToken), 5 * 60 * 1000);
//         return () => clearInterval(interval);
//     }, [googleCalendarToken, isAuthenticated]);

//     useEffect(() => {
//         const initialize = async () => {
//             await requestMicPermission();
//             Voice.onSpeechStart = () => { setIsListening(true); isVoiceStartingRef.current = false; };
//             Voice.onSpeechEnd = () => { setIsListening(false); isVoiceStartingRef.current = false; };
//             Voice.onSpeechResults = (e) => { setRetryCount(0); handleSpeechResults(e.value[0]); };
//             Voice.onSpeechError = (e) => {
//                 setIsListening(false);
//                 isVoiceStartingRef.current = false;
//                 if (e.error?.code !== "5" && e.error?.code !== "7") {
//                     if (retryCount < MAX_RETRIES) {
//                         setRetryCount((prev) => prev + 1);
//                         speak("Sorry, I didn't catch that. Please try again or say 'cancel'.").then(startVoiceListener);
//                     } else {
//                         speak("Too many failed attempts. Returning to manual mode.").then(() => {
//                             setVoiceMode("init"); setRetryCount(0); Voice.stop();
//                         });
//                     }
//                 }
//             };
//             return () => Voice.destroy().then(Voice.removeAllListeners);
//         };
//         initialize();
//     }, [voiceMode, selectedMode, hasMicPermission, retryCount]);

//     const validateAndRefreshToken = async (token: string) => {
//         const isValid = await checkGoogleCalendarAccess(token);
//         if (!isValid) {
//             const success = await handleGoogleCalendarAuth();
//             if (!success) {
//                 dispatch(removeGoogleCalendarToken());
//                 setIsAuthenticated(false);
//                 Alert.alert("Session Expired", "Please sign in again.", [{ text: "OK", onPress: () => GoogleAuthService.signInWithGoogle() }]);
//             }
//         }
//     };

//     const startVoiceListener = async () => {
//         if (!hasMicPermission || isListening || isVoiceStartingRef.current) return;
//         try {
//             isVoiceStartingRef.current = true;
//             await Voice.stop();
//             await Voice.start("en-US");
//         } catch (error) {
//             isVoiceStartingRef.current = false;
//             if (error.code !== "5" && error.code !== "7") {
//                 speak("Error starting voice input. Please try again or say 'cancel'.");
//             }
//         }
//     };

//     const getOpenAIResponse = async (input: string, context: string): Promise<string> => {
//         const response = await axios.post(
//             "https://api.openai.com/v1/chat/completions",
//             {
//                 model: "gpt-3.5-turbo",
//                 messages: [
//                     { role: "system", content: context },
//                     { role: "user", content: input },
//                 ],
//                 max_tokens: 100,
//             },
//             { headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" } }
//         );
//         return response.data.choices[0].message.content.trim();
//     };

//     const parseEventDetails = async (input: string): Promise<EventInfo> => {
//         // Update the full conversation text
//         const updatedFullText = conversationContext.fullText + " " + input;

//         // Update conversation context with the new input
//         setConversationContext(prev => ({
//             ...prev,
//             fullText: updatedFullText,
//             processedInputs: [...prev.processedInputs, input]
//         }));

//         // Make sure we're using the persistent reference values
//         const currentEventInfo = {
//             title: persistentEventInfoRef.current.title || conversationContext.title,
//             date: persistentEventInfoRef.current.date || conversationContext.date,
//             time: persistentEventInfoRef.current.time || conversationContext.time,
//             timePeriod: persistentEventInfoRef.current.timePeriod || conversationContext.timePeriod
//         };

//         // Context for the AI to understand what we're looking for
//         const context = `
//             You are an event parser. Extract calendar event information from conversation.
            
//             Current conversation: "${updatedFullText}"
            
//             What we already know:
//             - Title: ${currentEventInfo.title || "None"}
//             - Date: ${currentEventInfo.date ? currentEventInfo.date.toDateString() : "None"}
//             - Time: ${currentEventInfo.time || "None"}
//             - Time Period: ${currentEventInfo.timePeriod || "None"}
            
//             Today's date is ${new Date().toDateString()}.
//             If the user mentions "tomorrow", interpret it relative to today.
//             If the user mentions a day of week without a date, interpret it as the next occurrence.
            
//             CRITICAL TIME HANDLING INSTRUCTIONS:
//             1. Do NOT convert PM times to AM. Keep exactly as stated by user.
//             2. If user says "3pm" or "3 PM", keep it as PM.
//             3. If user says a number only (e.g., "3", "4", "5", "6") without AM/PM:
//                Do NOT assume a time.
//                Instead, ask the user to clarify: "Please provide the time with AM or PM (e.g., 3 PM)."
//             4. If user mentions general periods like "morning", "afternoon", "evening", 
//                mark these as timePeriod but DO NOT assign a specific time.
//             5. Only assign a specific time if the user explicitly states an exact time.
//             6. If free slot not available then user say time again then if user say in like "3pm" or "6pm"
//                 like in PM then take it as pm not am. 
//             7. If the user types “PM” or “pm”, **trust the user’s input.** Never override with AM.
            
//             ONLY extract information from the MOST RECENT user input: "${input}"
//             DO NOT consider previously parsed information as part of this analysis.
            
//             Return a JSON object with these fields:
//             {
//                 "title": "extracted event title if found in this input, null if not",
//                 "date": "ISO date string if date found in this input, null if not",
//                 "time": "extracted time if found in this input (e.g. '3:00 PM'), null if not",
//                 "timePeriod": "morning/afternoon/evening if mentioned without specific time, null otherwise",
//                 "hasGeneralTimeOnly": boolean indicating if user only mentioned a general time period,
//                 "isFreeSlotCheck": boolean,
//                 "containsTitle": boolean indicating if THIS input contains title information,
//                 "containsDate": boolean indicating if THIS input contains date information,
//                 "containsTime": boolean indicating if THIS input contains time information
//             }
            
//             Only extract information present in the CURRENT input. Don't include information from previous exchanges.
//         `;

//         try {
//             const response = await axios.post(
//                 "https://api.openai.com/v1/chat/completions",
//                 {
//                     model: "gpt-3.5-turbo",
//                     messages: [{ role: "system", content: context }, { role: "user", content: "Parse this input." }],
//                     temperature: 0.2,
//                     max_tokens: 300,
//                 },
//                 { headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" } }
//             );

//             const responseText = response.data.choices[0].message.content.trim();
//             console.log("AI Parser Response:", responseText);

//             // Find JSON in response
//             const jsonMatch = responseText.match(/\{[\s\S]*\}/);
//             if (!jsonMatch) throw new Error("Invalid response format");

//             const result = JSON.parse(jsonMatch[0]);

//             // Process date if present in this input
//             let eventDate = currentEventInfo.date;
//             if (result.containsDate && result.date) {
//                 try {
//                     const newDate = new Date(result.date);
//                     if (!isNaN(newDate.getTime())) {
//                         eventDate = newDate;
//                     }
//                 } catch (e) {
//                     console.error("Failed to parse date", e);
//                 }
//             }

//             // Important: Only process time if we have an EXACT time (not just a period)
//             // and don't already have time information
//             // Replace the existing time parsing block with this:
//             if (eventDate && result.containsTime && result.time && !result.hasGeneralTimeOnly) {
//                 try {
//                     // Enhanced regex to capture various time formats
//                     const timeMatch = result.time.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm|A\.M\.|P\.M\.|a\.m\.|p\.m\.)?/i);
//                     if (timeMatch) {
//                         let [_, hours, minutes, period] = timeMatch;
//                         hours = parseInt(hours, 10);
//                         minutes = minutes ? parseInt(minutes, 10) : 0;

//                         // Reset time components to avoid any carryover
//                         eventDate.setHours(0, 0, 0, 0);

//                         // Handle AM/PM explicitly based on user input
//                         const isPM = period && /pm|p\.m\./i.test(period);
//                         const isAM = period && /am|a\.m\./i.test(period);

//                         // Respect the user's explicit AM/PM designation
//                         if (isPM && hours < 12) {
//                             hours += 12;  // Convert to 24-hour format for PM
//                         } else if (isAM && hours === 12) {
//                             hours = 0;    // Midnight case
//                         } else if (!period && hours >= 1 && hours <= 7) {
//                             // Default 1-7 to PM only if no period specified
//                             hours += 12;
//                         }

//                         // Set the hours and minutes
//                         eventDate.setHours(hours, minutes, 0, 0);

//                         // Debug logging
//                         console.log("Time set:", {
//                             input: result.time,
//                             isPM,
//                             isAM,
//                             hours,
//                             minutes,
//                             resultDateUTC: eventDate.toISOString(),
//                             resultDateLocal: eventDate.toLocaleString(),
//                             hours24: eventDate.getHours()
//                         });
//                     } else {
//                         throw new Error("Invalid time format");
//                     }
//                 } catch (e) {
//                     console.error("Failed to parse time:", e);
//                 }

//             }

//             // Merge with persistent information
//             const newTitle = result.containsTitle && result.title ? result.title : currentEventInfo.title;
//             const newTimePeriod = result.timePeriod || currentEventInfo.timePeriod;

//             // Track if we have a general time period but need exact time
//             const needsExactTime = (!!newTimePeriod && !result.time) || (result.hasGeneralTimeOnly === true);

//             // Update persistent reference
//             persistentEventInfoRef.current = {
//                 title: newTitle || persistentEventInfoRef.current.title,
//                 date: eventDate || persistentEventInfoRef.current.date,
//                 time: result.containsTime && result.time && !result.hasGeneralTimeOnly ? result.time : persistentEventInfoRef.current.time,
//                 timePeriod: newTimePeriod
//             };

//             // Update conversation context
//             setConversationContext(prev => ({
//                 ...prev,
//                 title: newTitle || prev.title,
//                 date: eventDate || prev.date,
//                 time: result.containsTime && result.time && !result.hasGeneralTimeOnly ? result.time : prev.time,
//                 timePeriod: newTimePeriod,
//                 needsTitle: !newTitle,
//                 needsDate: !eventDate,
//                 needsTime: !prev.time && (!result.time || result.hasGeneralTimeOnly),
//                 needsExactTime: needsExactTime
//             }));

//             // Construct and return event info
//             const eventInfo: EventInfo = {
//                 title: persistentEventInfoRef.current.title,
//                 date: persistentEventInfoRef.current.date,
//                 time: persistentEventInfoRef.current.time,
//                 hasGeneralTimeOnly: result.hasGeneralTimeOnly || false,
//                 timePeriod: newTimePeriod,
//                 // Keep track of what was found in THIS input
//                 isFreeSlotCheck: result.isFreeSlotCheck || false,
//                 containsTitle: result.containsTitle || false,
//                 containsDate: result.containsDate || false,
//                 containsTime: result.containsTime || false
//             };

//             console.log("Parsed Event Info:", eventInfo);
//             return eventInfo;

//         } catch (error) {
//             console.error("Error parsing event details:", error);
//             // Return existing persistent context on error
//             return {
//                 title: persistentEventInfoRef.current.title,
//                 date: persistentEventInfoRef.current.date,
//                 time: persistentEventInfoRef.current.time,
//                 hasGeneralTimeOnly: false,
//                 timePeriod: persistentEventInfoRef.current.timePeriod,
//                 isFreeSlotCheck: false,
//                 containsTitle: false,
//                 containsDate: false,
//                 containsTime: false
//             };
//         }
//     };

//     const parseInvoiceDetails = async (input: string): Promise<InvoiceInfo> => {
//         const updatedFullText = conversationContext.fullText + " " + input;
//         setConversationContext((prev) => ({
//             ...prev,
//             fullText: updatedFullText,
//             processedInputs: [...prev.processedInputs, input],
//         }));

//         const currentInvoiceInfo = {
//             clientName: persistentInvoiceInfoRef.current.clientName || conversationContext.clientName,
//             jobDescription: persistentInvoiceInfoRef.current.jobDescription || conversationContext.jobDescription,
//             amount: persistentInvoiceInfoRef.current.amount || conversationContext.amount,
//             salesTax: persistentInvoiceInfoRef.current.salesTax || conversationContext.salesTax,
//             type: persistentInvoiceInfoRef.current.type || conversationContext.type,
//             date: persistentInvoiceInfoRef.current.date || conversationContext.invoiceDate,
//             paymentTerms: persistentInvoiceInfoRef.current.paymentTerms || conversationContext.paymentTerms,
//             email: persistentInvoiceInfoRef.current.email || conversationContext.email,
//             phoneNumber: persistentInvoiceInfoRef.current.phoneNumber || conversationContext.phoneNumber,
//             sendMethod: persistentInvoiceInfoRef.current.sendMethod || conversationContext.sendMethod,
//         };

//         const context = `
//             You are an invoice parser. Extract invoice information from the conversation.
    
//             Current conversation: "${updatedFullText}"
    
//             What we already know:
//             - Client Name: ${currentInvoiceInfo.clientName || "None"}
//             - Job Description: ${currentInvoiceInfo.jobDescription || "None"}
//             - Amount: ${currentInvoiceInfo.amount || "None"}
//             - Sales Tax: ${currentInvoiceInfo.salesTax || "None"}
//             - Type: ${currentInvoiceInfo.type || "None"}
//             - Date: ${currentInvoiceInfo.date || "None"}
//             - Payment Terms: ${currentInvoiceInfo.paymentTerms || "None"}
//             - Email: ${currentInvoiceInfo.email || "None"}
//             - Phone Number: ${currentInvoiceInfo.phoneNumber || "None"}
//             - Send Method: ${currentInvoiceInfo.sendMethod || "None"}
    
//             Special Instructions:
//             - If the input indicates a specific change request (e.g., "change client name to John Doe", "update amount to 500"),
//               identify the field to change and extract only that field's new value.
//             - For phone numbers: Return in E.164 format (e.g., "+12345678901").
//             - For email addresses: Normalize to lowercase, remove spaces, validate format.
//             - For amount and sales tax: Extract numeric value, ignore currency symbols.
//             - For sendMethod: Recognize "email" or "sms" explicitly.
    
//             Return a JSON object with these fields:
//             {
//                 "clientName": "extracted client name or null",
//                 "jobDescription": "extracted job description or null",
//                 "amount": "extracted amount as number or null",
//                 "salesTax": "extracted sales tax as number or null",
//                 "type": "invoice or estimate or null",
//                 "date": "extracted date as ISO string or null",
//                 "paymentTerms": "extracted payment terms or null",
//                 "email": "extracted and formatted email or null",
//                 "phoneNumber": "extracted and formatted phone number or null",
//                 "sendMethod": "email or sms or null",
//                 "containsClientName": boolean,
//                 "containsJobDescription": boolean,
//                 "containsAmount": boolean,
//                 "containsSalesTax": boolean,
//                 "containsType": boolean,
//                 "containsDate": boolean,
//                 "containsPaymentTerms": boolean,
//                 "containsEmail": boolean,
//                 "containsPhoneNumber": boolean,
//                 "changeRequestField": "field name if a change was requested (e.g., 'clientName'), null otherwise"
//             }
    
//             Only extract information from the CURRENT input: "${input}"
//         `;

//         try {
//             const response = await axios.post(
//                 "https://api.openai.com/v1/chat/completions",
//                 {
//                     model: "gpt-3.5-turbo",
//                     messages: [{ role: "system", content: context }, { role: "user", content: "Parse this input." }],
//                     temperature: 0.2,
//                     max_tokens: 300,
//                 },
//                 { headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" } }
//             );

//             const responseText = response.data.choices[0].message.content.trim();
//             console.log("AI Parser Response (Invoice):", responseText);

//             const jsonMatch = responseText.match(/\{[\s\S]*\}/);
//             if (!jsonMatch) throw new Error("Invalid response format");

//             let result = JSON.parse(jsonMatch[0]);

//             // Post-process phone number
//             let formattedPhoneNumber = result.phoneNumber;
//             if (result.containsPhoneNumber && result.phoneNumber) {
//                 let cleanedNumber = result.phoneNumber.replace(/[^+\d]/g, '');
//                 if (!cleanedNumber.startsWith('+')) {
//                     cleanedNumber = `+1${cleanedNumber}`;
//                 }
//                 const digitCount = cleanedNumber.replace('+', '').length;
//                 formattedPhoneNumber = digitCount >= 10 && digitCount <= 15 ? cleanedNumber : null;
//             }

//             // Post-process email
//             let formattedEmail = result.email;
//             if (result.containsEmail && result.email) {
//                 formattedEmail = result.email.replace(/\s+/g, '').toLowerCase();
//                 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//                 if (!emailRegex.test(formattedEmail)) {
//                     formattedEmail = null;
//                 }
//             }

//             // In modification mode, only update the requested field
//             if (conversationContext.isModificationMode && result.changeRequestField) {
//                 const field = result.changeRequestField;
//                 persistentInvoiceInfoRef.current[field] = result[field] !== null ? result[field] : persistentInvoiceInfoRef.current[field];
//                 setConversationContext((prev) => ({
//                     ...prev,
//                     [field]: result[field] !== null ? result[field] : prev[field],
//                     needsClientName: !persistentInvoiceInfoRef.current.clientName,
//                     needsJobDescription: !persistentInvoiceInfoRef.current.jobDescription,
//                     needsAmount: persistentInvoiceInfoRef.current.amount === null,
//                     needsContactInfo: !persistentInvoiceInfoRef.current.email && !persistentInvoiceInfoRef.current.phoneNumber,
//                     needsSendMethod: !persistentInvoiceInfoRef.current.sendMethod,
//                     requestedChangeField: field,
//                 }));
//             } else {
//                 // Normal parsing: update all provided fields
//                 const newClientName = result.containsClientName && result.clientName ? result.clientName : currentInvoiceInfo.clientName;
//                 const newJobDescription = result.containsJobDescription && result.jobDescription ? result.jobDescription : currentInvoiceInfo.jobDescription;
//                 const newAmount = result.containsAmount && result.amount !== null ? parseFloat(result.amount) : currentInvoiceInfo.amount;
//                 const newSalesTax = result.containsSalesTax && result.salesTax !== null ? parseFloat(result.salesTax) : currentInvoiceInfo.salesTax;
//                 const newType = result.containsType && result.type ? result.type : currentInvoiceInfo.type;
//                 const newDate = result.containsDate && result.date ? result.date : currentInvoiceInfo.date;
//                 const newPaymentTerms = result.containsPaymentTerms && result.paymentTerms ? result.paymentTerms : currentInvoiceInfo.paymentTerms;
//                 const newEmail = formattedEmail || currentInvoiceInfo.email;
//                 const newPhoneNumber = formattedPhoneNumber || currentInvoiceInfo.phoneNumber;
//                 const newSendMethod = result.sendMethod ? result.sendMethod.toLowerCase() : currentInvoiceInfo.sendMethod;

//                 persistentInvoiceInfoRef.current = {
//                     clientName: newClientName,
//                     jobDescription: newJobDescription,
//                     amount: newAmount,
//                     salesTax: newSalesTax,
//                     type: newType,
//                     date: newDate,
//                     paymentTerms: newPaymentTerms,
//                     email: newEmail,
//                     phoneNumber: newPhoneNumber,
//                     sendMethod: newSendMethod,
//                 };

//                 setConversationContext((prev) => ({
//                     ...prev,
//                     clientName: newClientName,
//                     jobDescription: newJobDescription,
//                     amount: newAmount,
//                     salesTax: newSalesTax,
//                     type: newType,
//                     invoiceDate: newDate,
//                     paymentTerms: newPaymentTerms,
//                     email: newEmail,
//                     phoneNumber: newPhoneNumber,
//                     sendMethod: newSendMethod,
//                     needsClientName: !newClientName,
//                     needsJobDescription: !newJobDescription,
//                     needsAmount: newAmount === null,
//                     needsContactInfo: !newEmail && !newPhoneNumber,
//                     needsSendMethod: !newSendMethod,
//                 }));
//             }

//             const invoiceInfo: InvoiceInfo = {
//                 clientName: persistentInvoiceInfoRef.current.clientName,
//                 jobDescription: persistentInvoiceInfoRef.current.jobDescription,
//                 amount: persistentInvoiceInfoRef.current.amount,
//                 salesTax: persistentInvoiceInfoRef.current.salesTax,
//                 type: persistentInvoiceInfoRef.current.type,
//                 date: persistentInvoiceInfoRef.current.date,
//                 paymentTerms: persistentInvoiceInfoRef.current.paymentTerms,
//                 email: persistentInvoiceInfoRef.current.email,
//                 phoneNumber: persistentInvoiceInfoRef.current.phoneNumber,
//                 sendMethod: persistentInvoiceInfoRef.current.sendMethod,
//                 containsClientName: result.containsClientName,
//                 containsJobDescription: result.containsJobDescription,
//                 containsAmount: result.containsAmount,
//                 containsSalesTax: result.containsSalesTax,
//                 containsType: result.containsType,
//                 containsDate: result.containsDate,
//                 containsPaymentTerms: result.containsPaymentTerms,
//                 containsEmail: result.containsEmail,
//                 containsPhoneNumber: result.containsPhoneNumber,
//             };

//             console.log("Parsed Invoice Info:", invoiceInfo);
//             return invoiceInfo;
//         } catch (error) {
//             console.error("Error parsing invoice details:", error);
//             return {
//                 clientName: persistentInvoiceInfoRef.current.clientName,
//                 jobDescription: persistentInvoiceInfoRef.current.jobDescription,
//                 amount: persistentInvoiceInfoRef.current.amount,
//                 salesTax: persistentInvoiceInfoRef.current.salesTax,
//                 type: persistentInvoiceInfoRef.current.type,
//                 date: persistentInvoiceInfoRef.current.date,
//                 paymentTerms: persistentInvoiceInfoRef.current.paymentTerms,
//                 email: persistentInvoiceInfoRef.current.email,
//                 phoneNumber: persistentInvoiceInfoRef.current.phoneNumber,
//                 sendMethod: persistentInvoiceInfoRef.current.sendMethod,
//                 containsClientName: false,
//                 containsJobDescription: false,
//                 containsAmount: false,
//                 containsSalesTax: false,
//                 containsType: false,
//                 containsDate: false,
//                 containsPaymentTerms: false,
//                 containsEmail: false,
//                 containsPhoneNumber: false,
//             };
//         }
//     };

//     const determineNextInvoiceQuestion = async (invoiceInfo: InvoiceInfo) => {
//         const { clientName, jobDescription, amount, sendMethod, email, phoneNumber } = invoiceInfo;

//         if (conversationContext.isModificationMode) {
//             // After a change, ask for confirmation or more changes
//             return "Would you like to make any other changes to the invoice, or are you ready to confirm?";
//         }

//         const needsClientName = !clientName;
//         const needsJobDescription = !jobDescription;
//         const needsAmount = amount === null;
//         const needsSendMethod = !sendMethod;
//         const needsContactInfo = !email && !phoneNumber;

//         setConversationContext((prev) => ({
//             ...prev,
//             needsClientName,
//             needsJobDescription,
//             needsAmount,
//             needsSendMethod,
//             needsContactInfo,
//         }));

//         let nextField = "";

//         if (needsClientName) {
//             nextField = "clientName";
//         } else if (needsJobDescription) {
//             nextField = "jobDescription";
//         } else if (needsAmount) {
//             nextField = "amount";
//         } else if (needsContactInfo) {
//             nextField = "contactInfo";
//         } else if (needsSendMethod) {
//             nextField = "sendMethod";
//         }

//         if (nextField === conversationContext.lastAskedFor && conversationContext.processedInputs.length > 1) {
//             if (nextField === "clientName") {
//                 nextField = jobDescription ? "amount" : "jobDescription";
//             } else if (nextField === "jobDescription") {
//                 nextField = clientName ? "amount" : "clientName";
//             } else if (nextField === "amount") {
//                 nextField = clientName ? "clientName" : "jobDescription";
//             } else if (nextField === "contactInfo") {
//                 nextField = "sendMethod";
//             } else if (nextField === "sendMethod") {
//                 nextField = "contactInfo";
//             }
//         }

//         let question = "";

//         if (nextField === "clientName") {
//             question = "Who is the invoice for?";
//             setConversationContext((prev) => ({ ...prev, lastAskedFor: "clientName" }));
//         } else if (nextField === "jobDescription") {
//             question = clientName
//                 ? `What is the job or service for ${clientName}'s invoice?`
//                 : "What is the job or service for the invoice?";
//             setConversationContext((prev) => ({ ...prev, lastAskedFor: "jobDescription" }));
//         } else if (nextField === "amount") {
//             question = clientName && jobDescription
//                 ? `How much is the invoice for ${clientName}'s ${jobDescription}?`
//                 : "What is the amount for the invoice?";
//             setConversationContext((prev) => ({ ...prev, lastAskedFor: "amount" }));
//         } else if (nextField === "contactInfo") {
//             question = clientName
//                 ? `Please provide an email address or phone number for ${clientName}.`
//                 : "Please provide an email address or phone number for the client.";
//             setConversationContext((prev) => ({ ...prev, lastAskedFor: "contactInfo" }));
//         } else if (nextField === "sendMethod") {
//             question = email && phoneNumber
//                 ? `Would you like to send the invoice to ${clientName} by email or SMS?`
//                 : email
//                     ? `Would you like to send the invoice to ${clientName} by email to ${email}?`
//                     : `Would you like to send the invoice to ${clientName} by SMS to ${phoneNumber}?`;
//             setConversationContext((prev) => ({ ...prev, lastAskedFor: "sendMethod" }));
//         } else {
//             return null;
//         }

//         return question;
//     };

//     // Smart function to determine what information we need next
//     const determineNextQuestion = async (eventInfo: EventInfo) => {
//         const { title, date, time, timePeriod, hasGeneralTimeOnly, isFreeSlotCheck } = eventInfo;

//         // If checking free slots, no need for more event information
//         if (isFreeSlotCheck) return null;

//         // Determine what information we still need
//         const needsTitle = !title;
//         const needsDate = !date;
//         // This is where the bug is - we need to check if we have a specific time, not just if date exists
//         const needsTime = !time && date && (!date.getHours() || hasGeneralTimeOnly);

//         // Update our tracking of what we need to ask
//         setConversationContext(prev => ({
//             ...prev,
//             needsTitle,
//             needsDate,
//             needsTime,
//             needsExactTime: hasGeneralTimeOnly || !!timePeriod
//         }));

//         // Determine what we should ask for next based on what we're missing
//         let nextField = "";

//         if (needsTitle) {
//             nextField = "title";
//         } else if (needsDate) {
//             nextField = "date";
//         } else if (needsTime) {
//             nextField = "time";
//         }

//         // If we have both title and date but no time, always ask for time next
//         if (title && date && !time) {
//             nextField = "time";
//         }

//         // Don't repeat the last question if possible
//         if (nextField === conversationContext.lastAskedFor &&
//             conversationContext.processedInputs.length > 1) {
//             if (nextField === "title") {
//                 nextField = date ? "time" : "date";
//             } else if (nextField === "date") {
//                 nextField = title ? "title" : "time";
//             } else if (nextField === "time") {
//                 nextField = needsTitle ? "title" : "date";
//             }
//         }

//         // Generate the appropriate question
//         let question = "";

//         if (nextField === "title") {
//             question = "What would you like to name this event?";
//             setConversationContext(prev => ({ ...prev, lastAskedFor: "title" }));
//         } else if (nextField === "date") {
//             question = title
//                 ? `When would you like to schedule "${title}"?`
//                 : "What date would you like to schedule this event?";
//             setConversationContext(prev => ({ ...prev, lastAskedFor: "date" }));
//         } else if (nextField === "time") {
//             // If we have a general time period but need specific time
//             if (timePeriod) {
//                 question = title
//                     ? `What specific time in the ${timePeriod} would you like to schedule "${title}" on ${date.toDateString()}?`
//                     : `What exact time in the ${timePeriod} would you like for the event on ${date.toDateString()}?`;
//             } else {
//                 question = title
//                     ? `What time would you like to schedule "${title}" on ${date.toDateString()}?`
//                     : `What time would you like for the event on ${date.toDateString()}?`;
//             }
//             setConversationContext(prev => ({ ...prev, lastAskedFor: "time" }));
//         } else if (title && date) {
//             // Fallback: if we have title and date but somehow didn't set nextField to time
//             question = `What time would you like to schedule "${title}" on ${date.toDateString()}?`;
//             setConversationContext(prev => ({ ...prev, lastAskedFor: "time" }));
//         } else {
//             // We have everything we need
//             return null;
//         }

//         return question;
//     };

//     const fetchEventsByDate = async (date: Date) => {
//         if (!googleCalendarToken) throw new Error("Not authenticated");
//         const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
//         const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);
//         const url = `${API.BASE_URL2}/calendar/event/primary?time=${startOfDay.toISOString()}`;
//         const response = await fetch(url, {
//             method: "GET",
//             headers: { "Authorization": `Bearer ${googleCalendarToken}`, "Content-Type": "application/json" },
//         });
//         const events = await response.json();
//         if (!response.ok) throw new Error(events.error || "Failed to fetch events");
//         return events.filter((event: any) => {
//             const eventStart = new Date(event.start.dateTime || event.start.date);
//             return eventStart >= startOfDay && eventStart <= endOfDay;
//         });
//     };

//     // Reset context when changing modes
//     const handleModeChange = (mode: "manual" | "auto" | "invoice" | "") => {
//         setSelectedMode(mode);
//         setRetryCount(0);

//         setConversationContext({
//             title: "",
//             date: null,
//             time: null,
//             timePeriod: null,
//             clientName: "",
//             jobDescription: "",
//             amount: null,
//             salesTax: null,
//             type: null,
//             invoiceDate: null,
//             paymentTerms: null,
//             email: null,
//             phoneNumber: null,
//             fullText: "",
//             needsTitle: false,
//             needsDate: false,
//             needsTime: false,
//             needsExactTime: false,
//             needsClientName: false,
//             needsJobDescription: false,
//             needsAmount: false,
//             needsSalesTax: false,
//             needsType: false,
//             needsInvoiceDate: false,
//             needsPaymentTerms: false,
//             needsEmail: false,
//             needsPhoneNumber: false,
//             needsApproval: false,
//             needsDeliveryMethod: false,
//             lastQuestion: "",
//             lastAskedFor: "",
//             processedInputs: [],
//             isComplete: false,
//             isInvoiceMode: mode === "invoice",
//         });

//         persistentEventInfoRef.current = {
//             title: "",
//             date: null,
//             time: null,
//             timePeriod: null,
//         };

//         persistentInvoiceInfoRef.current = {
//             clientName: "",
//             jobDescription: "",
//             amount: null,
//             salesTax: null,
//             type: null,
//             date: null,
//             paymentTerms: null,
//             email: null,
//             phoneNumber: null,
//         };

//         if (mode === "auto") {
//             setVoiceMode("init");
//             getOpenAIResponse("", "Generate a friendly greeting asking how I can assist with calendar events today.").then(
//                 (greeting) => speak(greeting).then(startVoiceListener)
//             );
//         } else if (mode === "invoice") {
//             setVoiceMode("init");
//             setConversationContext((prev) => ({ ...prev, isInvoiceMode: true }));
//             getOpenAIResponse("", "Generate a friendly greeting asking how I can assist with creating an invoice.").then(
//                 (greeting) => speak(greeting).then(startVoiceListener)
//             );
//         } else {
//             setVoiceMode("init");
//             Voice.stop();
//         }
//     };

//     const checkClientInBackend = async (
//         clientName: string
//     ): Promise<ClientData | null> => {
//         try {
//             // Encode the clientName to handle special characters
//             const encodedClientName = encodeURIComponent(clientName);
//             const url = `${API.BASE_URL2}/invoices/client-info?userId=${userId}&clientName=${encodedClientName}`;

//             const response = await fetch(url, {
//                 method: "GET",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${googleCalendarToken}`,
//                 },
//             });

//             if (response.ok) {
//                 return await response.json();
//             }
//             return null;
//         } catch (error) {
//             console.error("Error checking client:", error);
//             return null;
//         }
//     };

//     // const checkClientInBackend = async (clientName: string): Promise<ClientData | null> => {
//     //     // Return hardcoded client data every time
//     //     return {
//     //         clientName: clientName,
//     //         email: null,
//     //         phoneNumber: null, // example field
//     //     };
//     // };


//     const handleSpeechResults = async (text: string) => {
//         setSpokenText(text);

//         if (text.toLowerCase().includes("cancel") || text.toLowerCase().includes("stop")) {
//             resetConversation();
//             await speak("Voice mode canceled. Switching to manual mode.").then(() => Voice.stop());
//             return;
//         }

//         setIsProcessing(true);

//         try {
//             if (conversationContext.isInvoiceMode) {
//                 const invoiceInfo = await parseInvoiceDetails(text);
//                 console.log("Invoice Info:", invoiceInfo);

//                 const completeInvoiceInfo = {
//                     clientName: invoiceInfo.clientName || persistentInvoiceInfoRef.current.clientName,
//                     jobDescription: invoiceInfo.jobDescription || persistentInvoiceInfoRef.current.jobDescription,
//                     amount: invoiceInfo.amount !== null ? invoiceInfo.amount : persistentInvoiceInfoRef.current.amount,
//                     salesTax: invoiceInfo.salesTax !== null ? invoiceInfo.salesTax : persistentInvoiceInfoRef.current.salesTax,
//                     type: invoiceInfo.type || persistentInvoiceInfoRef.current.type,
//                     date: invoiceInfo.date || persistentInvoiceInfoRef.current.date,
//                     paymentTerms: invoiceInfo.paymentTerms || persistentInvoiceInfoRef.current.paymentTerms,
//                     email: invoiceInfo.email || persistentInvoiceInfoRef.current.email,
//                     phoneNumber: invoiceInfo.phoneNumber || persistentInvoiceInfoRef.current.phoneNumber,
//                     sendMethod: invoiceInfo.sendMethod || persistentInvoiceInfoRef.current.sendMethod,
//                 };

//                 const hasCoreInfo = completeInvoiceInfo.clientName && completeInvoiceInfo.jobDescription && completeInvoiceInfo.amount !== null;

//                 if (conversationContext.isModificationMode) {
//                     if (text.toLowerCase().includes("confirm") || text.toLowerCase().includes("looks good") || text.toLowerCase().includes("that's fine")) {
//                         // User wants to confirm after modifications
//                         setInvoiceDetails({
//                             clientName: completeInvoiceInfo.clientName,
//                             jobDescription: completeInvoiceInfo.jobDescription,
//                             amount: completeInvoiceInfo.amount,
//                             salesTax: completeInvoiceInfo.salesTax,
//                             type: completeInvoiceInfo.type,
//                             date: completeInvoiceInfo.date,
//                             paymentTerms: completeInvoiceInfo.paymentTerms,
//                             email: completeInvoiceInfo.email,
//                             phoneNumber: completeInvoiceInfo.phoneNumber,
//                             sendMethod: completeInvoiceInfo.sendMethod,
//                             containsClientName: invoiceInfo.containsClientName,
//                             containsJobDescription: invoiceInfo.containsJobDescription,
//                             containsAmount: invoiceInfo.containsAmount,
//                             containsSalesTax: invoiceInfo.containsSalesTax,
//                             containsType: invoiceInfo.containsType,
//                             containsDate: invoiceInfo.containsDate,
//                             containsPaymentTerms: invoiceInfo.containsPaymentTerms,
//                             containsEmail: invoiceInfo.containsEmail,
//                             containsPhoneNumber: invoiceInfo.containsPhoneNumber,
//                         });
//                         setShowInvoiceConfirmationForm(true);
//                         setConversationContext((prev) => ({
//                             ...prev,
//                             isModificationMode: false,
//                             requestedChangeField: null,
//                             isComplete: true,
//                         }));
//                         await speak("Please review the updated details and confirm.");
//                     } else if (invoiceInfo.containsClientName || invoiceInfo.containsJobDescription || invoiceInfo.containsAmount ||
//                         invoiceInfo.containsSalesTax || invoiceInfo.containsType || invoiceInfo.containsDate ||
//                         invoiceInfo.containsPaymentTerms || invoiceInfo.containsEmail || invoiceInfo.containsPhoneNumber ||
//                         invoiceInfo.containsSendMethod) {
//                         // User provided a specific change
//                         setInvoiceDetails({
//                             clientName: completeInvoiceInfo.clientName,
//                             jobDescription: completeInvoiceInfo.jobDescription,
//                             amount: completeInvoiceInfo.amount,
//                             salesTax: completeInvoiceInfo.salesTax,
//                             type: completeInvoiceInfo.type,
//                             date: completeInvoiceInfo.date,
//                             paymentTerms: completeInvoiceInfo.paymentTerms,
//                             email: completeInvoiceInfo.email,
//                             phoneNumber: completeInvoiceInfo.phoneNumber,
//                             sendMethod: completeInvoiceInfo.sendMethod,
//                             containsClientName: invoiceInfo.containsClientName,
//                             containsJobDescription: invoiceInfo.containsJobDescription,
//                             containsAmount: invoiceInfo.containsAmount,
//                             containsSalesTax: invoiceInfo.containsSalesTax,
//                             containsType: invoiceInfo.containsType,
//                             containsDate: invoiceInfo.containsDate,
//                             containsPaymentTerms: invoiceInfo.containsPaymentTerms,
//                             containsEmail: invoiceInfo.containsEmail,
//                             containsPhoneNumber: invoiceInfo.containsPhoneNumber,
//                         });
//                         setShowInvoiceConfirmationForm(true);
//                         setConversationContext((prev) => ({
//                             ...prev,
//                             isModificationMode: false,
//                             requestedChangeField: null,
//                             isComplete: true,
//                         }));
//                         await speak("I've updated the invoice. Please review the details and confirm.");
//                     } else {
//                         // Prompt for more changes
//                         const nextQuestion = await determineNextInvoiceQuestion(completeInvoiceInfo);
//                         if (nextQuestion) {
//                             await speak(nextQuestion).then(startVoiceListener);
//                             setConversationContext((prev) => ({ ...prev, lastQuestion: nextQuestion }));
//                             setVoiceMode("response");
//                         }
//                     }
//                 } else if (hasCoreInfo && !completeInvoiceInfo.sendMethod) {
//                     // if (!completeInvoiceInfo.email && !completeInvoiceInfo.phoneNumber && completeInvoiceInfo.clientName) {
//                     //     const clientData = await checkClientInBackend(completeInvoiceInfo.clientName);
//                     //     if (clientData && (clientData.email || clientData.phoneNumber)) {
//                     //         const confirmationQuestion = clientData.email && clientData.phoneNumber
//                     //             ? `Is this ${completeInvoiceInfo.clientName} with email ${clientData.email} and phone ${clientData.phoneNumber}? Say 'yes' to use these details or 'no' to provide new ones.`
//                     //             : clientData.email
//                     //             ? `Is this ${completeInvoiceInfo.clientName} with email ${clientData.email}? Say 'yes' to use this email or 'no' to provide new details.`
//                     //             : `Is this ${completeInvoiceInfo.clientName} with phone ${clientData.phoneNumber}? Say 'yes' to use this phone number or 'no' to provide new details.`;
//                     //         await speak(confirmationQuestion).then(startVoiceListener);
//                     //         setConversationContext((prev) => ({
//                     //             ...prev,
//                     //             lastAskedFor: "clientConfirmation",
//                     //             email: clientData.email || prev.email,
//                     //             phoneNumber: clientData.phoneNumber || prev.phoneNumber,
//                     //         }));
//                     //         setVoiceMode("response");
//                     //         return;
//                     //     }
//                     // }

//                     // if (text.toLowerCase().includes("yes") && conversationContext.lastAskedFor === "clientConfirmation") {
//                     //     // User confirmed existing client details
//                     //     persistentInvoiceInfoRef.current.email = conversationContext.email;
//                     //     persistentInvoiceInfoRef.current.phoneNumber = conversationContext.phoneNumber;
//                     //     setConversationContext((prev) => ({
//                     //         ...prev,
//                     //         needsContactInfo: false,
//                     //         lastAskedFor: "sendMethod",
//                     //     }));
//                     //     const question = conversationContext.email && conversationContext.phoneNumber
//                     //         ? `Would you like to send the invoice to ${completeInvoiceInfo.clientName} by email or SMS?`
//                     //         : conversationContext.email
//                     //         ? `Would you like to send the invoice to ${completeInvoiceInfo.clientName} by email to ${conversationContext.email}?`
//                     //         : `Would you like to send the invoice to ${completeInvoiceInfo.clientName} by SMS to ${conversationContext.phoneNumber}?`;
//                     //     await speak(question).then(startVoiceListener);
//                     //     setVoiceMode("response");
//                     // } else if (text.toLowerCase().includes("no") && conversationContext.lastAskedFor === "clientConfirmation") {
//                     //     // User wants new contact details
//                     //     const question = `Please provide a new email address or phone number for ${completeInvoiceInfo.clientName}.`;
//                     //     await speak(question).then(startVoiceListener);
//                     //     setConversationContext((prev) => ({
//                     //         ...prev,
//                     //         lastAskedFor: "contactInfo",
//                     //         email: null,
//                     //         phoneNumber: null,
//                     //         needsContactInfo: true,
//                     //     }));
//                     //     setVoiceMode("response");
//                     // }
//                     if (completeInvoiceInfo.email || completeInvoiceInfo.phoneNumber) {
//                         const question = completeInvoiceInfo.email && completeInvoiceInfo.phoneNumber
//                             ? `Would you like to send the invoice to ${completeInvoiceInfo.clientName} by email or SMS?`
//                             : completeInvoiceInfo.email
//                                 ? `Would you like to send the invoice to ${completeInvoiceInfo.clientName} by email to ${completeInvoiceInfo.email}?`
//                                 : `Would you like to send the invoice to ${completeInvoiceInfo.clientName} by SMS to ${completeInvoiceInfo.phoneNumber}?`;
//                         await speak(question).then(startVoiceListener);
//                         setConversationContext((prev) => ({
//                             ...prev,
//                             lastAskedFor: "sendMethod",
//                             needsSendMethod: true,
//                         }));
//                         setVoiceMode("response");
//                     } else {
//                         const question = `Please provide an email address or phone number for ${completeInvoiceInfo.clientName}.`;
//                         await speak(question).then(startVoiceListener);
//                         setConversationContext((prev) => ({
//                             ...prev,
//                             lastAskedFor: "contactInfo",
//                             needsContactInfo: true,
//                         }));
//                         setVoiceMode("response");
//                     }
//                 } else if (hasCoreInfo && completeInvoiceInfo.sendMethod) {
//                     setInvoiceDetails({
//                         clientName: completeInvoiceInfo.clientName,
//                         jobDescription: completeInvoiceInfo.jobDescription,
//                         amount: completeInvoiceInfo.amount,
//                         salesTax: completeInvoiceInfo.salesTax,
//                         type: completeInvoiceInfo.type,
//                         date: completeInvoiceInfo.date,
//                         paymentTerms: completeInvoiceInfo.paymentTerms,
//                         email: completeInvoiceInfo.email,
//                         phoneNumber: completeInvoiceInfo.phoneNumber,
//                         sendMethod: completeInvoiceInfo.sendMethod,
//                         containsClientName: invoiceInfo.containsClientName,
//                         containsJobDescription: invoiceInfo.containsJobDescription,
//                         containsAmount: invoiceInfo.containsAmount,
//                         containsSalesTax: invoiceInfo.containsSalesTax,
//                         containsType: invoiceInfo.containsType,
//                         containsDate: invoiceInfo.containsDate,
//                         containsPaymentTerms: invoiceInfo.containsPaymentTerms,
//                         containsEmail: invoiceInfo.containsEmail,
//                         containsPhoneNumber: invoiceInfo.containsPhoneNumber,
//                     });
//                     setShowInvoiceConfirmationForm(true);

//                     await speak(
//                         `Please review the details and confirm.`
//                     );

//                     setConversationContext((prev) => ({ ...prev, isComplete: true }));
//                 } else {
//                     const nextQuestion = await determineNextInvoiceQuestion(completeInvoiceInfo);

//                     if (nextQuestion) {
//                         await speak(nextQuestion).then(startVoiceListener);
//                         setConversationContext((prev) => ({ ...prev, lastQuestion: nextQuestion }));
//                         setVoiceMode("response");
//                     } else if (!completeInvoiceInfo.clientName) {
//                         await speak("Who is the invoice for?").then(startVoiceListener);
//                         setConversationContext((prev) => ({ ...prev, lastAskedFor: "clientName" }));
//                         setVoiceMode("response");
//                     } else if (!completeInvoiceInfo.jobDescription) {
//                         const question = completeInvoiceInfo.clientName
//                             ? `What is the job or service for ${completeInvoiceInfo.clientName}'s invoice?`
//                             : "What is the job or service for the invoice?";
//                         await speak(question).then(startVoiceListener);
//                         setConversationContext((prev) => ({ ...prev, lastAskedFor: "jobDescription" }));
//                         setVoiceMode("response");
//                     } else if (completeInvoiceInfo.amount === null) {
//                         const question = completeInvoiceInfo.clientName && completeInvoiceInfo.jobDescription
//                             ? `How much is the invoice for ${completeInvoiceInfo.clientName}'s ${completeInvoiceInfo.jobDescription}?`
//                             : "What is the amount for the invoice?";
//                         await speak(question).then(startVoiceListener);
//                         setConversationContext((prev) => ({ ...prev, lastAskedFor: "amount" }));
//                         setVoiceMode("response");
//                     } else {
//                         await speak("I need more information about your invoice. Please tell me the client name, job description, and amount.").then(
//                             startVoiceListener
//                         );
//                         setVoiceMode("response");
//                     }
//                 }
//             }
//             else {
//                 // Process input with context awareness
//                 const eventInfo = await parseEventDetails(text);
//                 console.log(eventInfo);

//                 // Get the complete event information by combining current input with persistent storage
//                 const completeEventInfo = {
//                     title: eventInfo.title || persistentEventInfoRef.current.title,
//                     date: eventInfo.date || persistentEventInfoRef.current.date,
//                     time: eventInfo.time || persistentEventInfoRef.current.time,
//                     timePeriod: eventInfo.timePeriod || persistentEventInfoRef.current.timePeriod
//                 };

//                 // Handle free slot check
//                 if (eventInfo.isFreeSlotCheck && eventInfo.date) {
//                     const events = await fetchEventsByDate(eventInfo.date);
//                     const message = events.length > 0
//                         ? `You have ${events.length} events on ${eventInfo.date.toDateString()}: ${events.map((e: any) => e.summary).join(", ")}. Would you like to check another date or create an event?`
//                         : `You have no events on ${eventInfo.date.toDateString()}. Would you like to schedule something?`;
//                     await speak(message).then(startVoiceListener);
//                     setParsedDate(eventInfo.date);
//                     setVoiceMode("response");
//                     setIsProcessing(false);
//                     return;
//                 }

//                 // Special handling for cases where we have a general time period but need specific time
//                 if (eventInfo.timePeriod && !eventInfo.time && !conversationContext.needsTitle && !conversationContext.needsDate) {
//                     const timeQuestion = eventInfo.title
//                         ? `What specific time in the ${eventInfo.timePeriod} would you like to schedule "${eventInfo.title}" on ${eventInfo.date?.toDateString()}?`
//                         : `What exact time in the ${eventInfo.timePeriod} would you like for the event on ${eventInfo.date?.toDateString()}?`;

//                     await speak(timeQuestion).then(startVoiceListener);
//                     setConversationContext(prev => ({
//                         ...prev,
//                         lastAskedFor: "time",
//                         needsExactTime: true
//                     }));
//                     setVoiceMode("response");
//                     setIsProcessing(false);
//                     return;
//                 }

//                 // Check if we have complete information for an event
//                 // Use the combined information from current and persistent storage
//                 const hasCompleteInfo = completeEventInfo.title &&
//                     completeEventInfo.date &&
//                     (completeEventInfo.time ||
//                         (completeEventInfo.date.getHours() !== 0 &&
//                             completeEventInfo.date.getMinutes() !== 0));

//                 console.log("Complete event check:", {
//                     hasTitle: !!completeEventInfo.title,
//                     hasDate: !!completeEventInfo.date,
//                     hasTime: !!completeEventInfo.time || (completeEventInfo.date && completeEventInfo.date.getHours() !== 0),
//                     hasCompleteInfo
//                 });

//                 if (hasCompleteInfo) {
//                     // We have all the information needed for an event
//                     const events = await fetchEventsByDate(completeEventInfo.date);
//                     const timeSlotTaken = events.some((e: any) => {
//                         const eventStart = new Date(e.start.dateTime || e.start.date);
//                         const eventEnd = new Date(e.end.dateTime || e.end.date);
//                         return completeEventInfo.date >= eventStart && completeEventInfo.date <= eventEnd;
//                     });

//                     if (timeSlotTaken) {
//                         const message = `That time slot is already taken. Would you like to choose another time for "${completeEventInfo.title}"?`;
//                         await speak(message).then(startVoiceListener);
//                         setConversationContext(prev => ({ ...prev, lastAskedFor: "time" }));
//                         setVoiceMode("response");
//                     } else {
//                         // We have complete, valid information - show confirmation
//                         setEventTitle(completeEventInfo.title);
//                         setParsedDate(completeEventInfo.date);
//                         setShowConfirmationForm(true);

//                         await speak(`I've scheduled "${completeEventInfo.title}" for ${completeEventInfo.date.toDateString()} at ${completeEventInfo.date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}. Please review the details and confirm.`);

//                         // Mark context as complete but don't reset yet - we'll reset after confirming
//                         setConversationContext(prev => ({ ...prev, isComplete: true }));

//                         // Don't start voice listener here as we want user to interact with confirmation form
//                     }
//                 } else {
//                     // We're still missing information
//                     const nextQuestion = await determineNextQuestion(completeEventInfo);

//                     if (nextQuestion) {
//                         await speak(nextQuestion).then(startVoiceListener);
//                         setConversationContext(prev => ({ ...prev, lastQuestion: nextQuestion }));
//                         setVoiceMode("response");
//                     } else if (!completeEventInfo.title) {
//                         // Fallback if determineNextQuestion fails but we know we need a title
//                         await speak("What would you like to name your event?").then(startVoiceListener);
//                         setConversationContext(prev => ({ ...prev, lastAskedFor: "title" }));
//                         setVoiceMode("response");
//                     } else if (!completeEventInfo.date) {
//                         // Fallback if we need date
//                         const question = completeEventInfo.title
//                             ? `When would you like to schedule "${completeEventInfo.title}"?`
//                             : "When would you like to schedule this event?";
//                         await speak(question).then(startVoiceListener);
//                         setConversationContext(prev => ({ ...prev, lastAskedFor: "date" }));
//                         setVoiceMode("response");
//                     } else if (completeEventInfo.date && (!completeEventInfo.time || eventInfo.hasGeneralTimeOnly)) {
//                         // Fallback if we need time
//                         const question = completeEventInfo.timePeriod
//                             ? `What specific time in the ${completeEventInfo.timePeriod} would you like for "${completeEventInfo.title || "the event"}" on ${completeEventInfo.date.toDateString()}?`
//                             : `What time would you like for "${completeEventInfo.title || "the event"}" on ${completeEventInfo.date.toDateString()}?`;
//                         await speak(question).then(startVoiceListener);
//                         setConversationContext(prev => ({ ...prev, lastAskedFor: "time" }));
//                         setVoiceMode("response");
//                     } else {
//                         // General fallback
//                         await speak("I need more information about your event. Please tell me the title, date and exact time.").then(startVoiceListener);
//                         setVoiceMode("response");
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error("Error in speech processing:", error);
//             await speak("I'm having trouble understanding. Could you please try again?").then(startVoiceListener);
//         }

//         setIsProcessing(false);
//     };

//     const resetConversation = () => {
//         setConversationContext({
//             title: "",
//             date: null,
//             time: null,
//             timePeriod: null,
//             clientName: "",
//             jobDescription: "",
//             amount: null,
//             salesTax: null,
//             type: null,
//             invoiceDate: null,
//             paymentTerms: null,
//             email: null,
//             phoneNumber: null,
//             fullText: "",
//             needsTitle: false,
//             needsDate: false,
//             needsTime: false,
//             needsExactTime: false,
//             needsClientName: false,
//             needsJobDescription: false,
//             needsAmount: false,
//             needsSalesTax: false,
//             needsType: false,
//             needsInvoiceDate: false,
//             needsPaymentTerms: false,
//             needsEmail: false,
//             needsPhoneNumber: false,
//             needsApproval: false,
//             needsDeliveryMethod: false,
//             lastQuestion: "",
//             lastAskedFor: "",
//             processedInputs: [],
//             isComplete: false,
//             isInvoiceMode: selectedMode === "invoice",
//         });

//         persistentEventInfoRef.current = {
//             title: "",
//             date: null,
//             time: null,
//             timePeriod: null,
//         };

//         persistentInvoiceInfoRef.current = {
//             clientName: "",
//             jobDescription: "",
//             amount: null,
//             salesTax: null,
//             type: null,
//             date: null,
//             paymentTerms: null,
//             email: null,
//             phoneNumber: null,
//         };

//         setVoiceMode("init");
//     };

//     const saveEvent = async () => {
//         if (!eventTitle || !parsedDate) {
//             Alert.alert("Error", "Event title and time are required");
//             await speak("Event title and time are required. Let's start over.").then(() => {
//                 setVoiceMode("response");
//                 setShowConfirmationForm(false);
//             });
//             return;
//         }

//         if (!googleCalendarToken) {
//             Alert.alert("Error", "You need to log in first");
//             await speak("You need to log in first. Please authenticate.").then(() => {
//                 setVoiceMode("init");
//                 setShowConfirmationForm(false);
//             });
//             return;
//         }

//         setIsProcessing(true);

//         try {
//             const startTime = parsedDate;
//             const endTime = new Date(startTime);
//             endTime.setHours(endTime.getHours() + 1);

//             const eventPayload = {
//                 summary: eventTitle,
//                 description: "Event created via voice input",
//                 startTime: startTime.toISOString(),
//                 endTime: endTime.toISOString(),
//                 attendees: [],
//             };

//             const url = `${API.BASE_URL2}/calendar/create-event`;
//             const response = await fetch(url, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${googleCalendarToken}`,
//                 },
//                 body: JSON.stringify(eventPayload),
//             });

//             const responseData = await response.json();

//             if (response.ok) {
//                 Alert.alert("Success", "Event created successfully", [{
//                     text: "OK",
//                     onPress: () => {
//                         handleModeChange("manual");
//                         setEventTitle("");
//                         setParsedDate(null);
//                         setShowConfirmationForm(false);
//                         speak("Event added successfully. Switching back to manual mode.");
//                     },
//                 }]);
//             } else {
//                 throw new Error(`Failed to create event: ${responseData.error?.message || "Unknown error"}`);
//             }
//         } catch (error) {
//             console.error("Error creating event:", error);
//             Alert.alert("Error", "Failed to create event. Please try again.");
//             await speak("Sorry, I couldn't add the event. Let's try again.").then(() => {
//                 setVoiceMode("response");
//                 setShowConfirmationForm(false);
//             });
//         } finally {
//             setIsProcessing(false);
//         }
//     };

//     const saveInvoice = async () => {
//         if (!invoiceDetails.clientName || !invoiceDetails.jobDescription || invoiceDetails.amount === null) {
//             Alert.alert("Error", "Client name, job description, and amount are required");
//             await speak("Client name, job description, and amount are required. Let's start over.").then(() => {
//                 setVoiceMode("response");
//                 setShowInvoiceConfirmationForm(false);
//             });
//             return;
//         }

//         setIsProcessing(true);

//         try {
//             const invoicePayload = {
//                 clientName: invoiceDetails.clientName,
//                 jobDescription: invoiceDetails.jobDescription,
//                 amount: invoiceDetails.amount,
//                 salesTax: invoiceDetails.salesTax || 0,
//                 type: invoiceDetails.type || "invoice",
//                 date: invoiceDetails.date || new Date().toISOString(),
//                 paymentTerms: invoiceDetails.paymentTerms || "Due upon receipt",
//                 email: invoiceDetails.email || null,
//                 phoneNumber: invoiceDetails.phoneNumber || null,
//                 createdAt: new Date().toISOString(),
//                 userId: userId,
//             };

//             const url = `${API.BASE_URL2}/invoices/create`;
//             const response = await fetch(url, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${googleCalendarToken}`,
//                 },
//                 body: JSON.stringify(invoicePayload),
//             });

//             const responseData = await response.json();

//             if (response.ok) {
//                 Alert.alert("Success", "Invoice created successfully", [
//                     {
//                         text: "OK",
//                         onPress: () => {
//                             handleModeChange("manual");
//                             setInvoiceDetails({
//                                 clientName: "",
//                                 jobDescription: "",
//                                 amount: null,
//                                 salesTax: null,
//                                 type: null,
//                                 date: null,
//                                 paymentTerms: null,
//                                 email: null,
//                                 phoneNumber: null,
//                                 containsClientName: false,
//                                 containsJobDescription: false,
//                                 containsAmount: false,
//                                 containsSalesTax: false,
//                                 containsType: false,
//                                 containsDate: false,
//                                 containsPaymentTerms: false,
//                                 containsEmail: false,
//                                 containsPhoneNumber: false,
//                             });
//                             setShowInvoiceConfirmationForm(false);
//                             speak("Invoice created successfully. Switching back to manual mode.");
//                         },
//                     },
//                 ]);
//             } else {
//                 throw new Error(`Failed to create invoice: ${responseData.error?.message || "Unknown error"}`);
//             }
//         } catch (error) {
//             console.error("Error creating invoice:", error);
//             Alert.alert("Error", "Failed to create invoice. Please try again.");
//             await speak("Sorry, I couldn't create the invoice. Let's try again.").then(() => {
//                 setVoiceMode("response");
//                 setShowInvoiceConfirmationForm(false);
//             });
//         } finally {
//             setIsProcessing(false);
//         }
//     };

//     const toggleModal = () => setModalVisible(true);
//     const cleanup = () => setModalVisible(false);

//     const handleScheduleEvent = async () => {
//         setIsProcessing(true);
//         try {
//             const success = await handleGoogleCalendarAuth();
//             if (success) {
//                 cleanup();
//                 navigation.navigate("CalendarScreen");
//             }
//         } catch (error) {
//             Alert.alert("Failed", "Could not authenticate Google Calendar.");
//         } finally {
//             setIsProcessing(false);
//         }
//     };

//     const handleGoogleCalendarAuth = async () => {
//         try {
//             let accessToken = googleCalendarToken;
//             if (!accessToken) {
//                 const { tokens } = await GoogleAuthService.signInWithGoogle();
//                 accessToken = tokens.accessToken;
//                 dispatch(setGoogleCalendarToken(accessToken));
//             }
//             const calendarConnected = await checkGoogleCalendarAccess(accessToken);
//             if (calendarConnected) {
//                 Alert.alert("Success", "Google Calendar Connected Successfully!");
//                 return true;
//             } else {
//                 throw new Error("Unable to connect to Google Calendar.");
//             }
//         } catch (error) {
//             console.error("Calendar Auth Error:", error);
//             dispatch(removeGoogleCalendarToken());
//             Alert.alert("Failed", "Could not authenticate Google Calendar.");
//             return false;
//         }
//     };

//     const checkGoogleCalendarAccess = async (accessToken: string) => {
//         try {
//             const response = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
//                 method: "GET",
//                 headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
//             });
//             return response.ok;
//         } catch (error) {
//             console.error("Error checking Google Calendar access:", error);
//             return false;
//         }
//     };

//     const handleLogoutPress = () => {
//         Alert.alert("Logout", "Are you sure you want to log out?", [
//             { text: "Cancel", style: "cancel" },
//             { text: "Yes", onPress: () => { navigation.reset({ index: 0, routes: [{ name: SCREENS.SPLASH }] }); dispatch(logout()); } },
//         ]);
//     };

//     const handleViewEvents = async () => {
//         setIsProcessing(true);
//         try {
//             const success = await handleGoogleCalendarAuth();
//             if (success) {
//                 cleanup();
//                 navigation.navigate("EventListScreen");
//             }
//         } catch (error) {
//             Alert.alert("Failed", "Could not authenticate Google Calendar.");
//         } finally {
//             setIsProcessing(false);
//         }
//     };
//     return (
//         <View style={styles.background}>
//             <View style={styles.container}>
//                 <TouchableOpacity onPress={handleLogoutPress} style={styles.logoutIcon}>
//                     <AntDesign name="logout" size={34} color={COLORS.WHITE} />
//                 </TouchableOpacity>

//                 <View style={customStyles.dropdownContainer}>
//                     <Picker
//                         selectedValue={selectedMode}
//                         style={customStyles.picker}
//                         onValueChange={(itemValue) => handleModeChange(itemValue as "manual" | "auto" | "invoice" | "")}
//                     >
//                         <Picker.Item label="Select Mode" value="" />
//                         <Picker.Item label="Manual" value="manual" />
//                         <Picker.Item label="Auto" value="auto" />
//                         <Picker.Item label="Invoice" value="invoice" />
//                     </Picker>
//                 </View>

//                 {isListening && (
//                     <LottieView source={require("../../assets/loaders/loader.json")} autoPlay loop style={styles.lottie} />
//                 )}

//                 {!isListening && (
//                     <LottieView source={require("../../assets/loaders/loader.json")} style={styles.lottie} />
//                 )}

//                 <TouchableOpacity style={styles.plusButton} onPress={toggleModal}>
//                     <Icon name="add" size={100} color={COLORS.WHITE} />
//                 </TouchableOpacity>

//                 <Modal visible={showConfirmationForm} transparent animationType="slide" onRequestClose={() => setShowConfirmationForm(false)}>
//                     <View style={styles.modalOverlay}>
//                         <View style={styles.modalContent}>
//                             <Text style={styles.modalTitle}>Confirm Event Details</Text>
//                             <View style={styles.confirmationDetails}>
//                                 <Text style={styles.detailText}>Title: {eventTitle}</Text>
//                                 <Text style={styles.detailText}>Date: {parsedDate?.toDateString()}</Text>
//                                 <Text style={styles.detailText}>Time: {parsedDate?.toLocaleTimeString()}</Text>
//                                 <Text style={styles.detailText}>Duration: 1 hour</Text>
//                             </View>
//                             {isProcessing ? (
//                                 <View style={styles.processingIndicator}>
//                                     <ActivityIndicator size="large" color={THEME.PRIMARY} />
//                                     <Text style={styles.processingText}>Saving...</Text>
//                                 </View>
//                             ) : (
//                                 <View style={styles.confirmationButtons}>
//                                     <TouchableOpacity style={[styles.optionButton, { backgroundColor: THEME.PRIMARY }]} onPress={saveEvent}>
//                                         <Text style={[styles.optionText, { color: COLORS.WHITE }]}>Confirm</Text>
//                                     </TouchableOpacity>
//                                     <TouchableOpacity
//                                         style={[styles.optionButton, { backgroundColor: COLORS.GRAY }]}
//                                         onPress={() => {
//                                             setShowConfirmationForm(false);
//                                             setVoiceMode("response");
//                                             speak("Please provide new event details.");
//                                         }}
//                                     >
//                                         <Text style={styles.optionText}>Modify</Text>
//                                     </TouchableOpacity>
//                                     <TouchableOpacity
//                                         style={styles.closeButton}
//                                         onPress={() => {
//                                             setShowConfirmationForm(false);
//                                             setVoiceMode("init");
//                                             speak("Event creation cancelled. How can I assist you now?");
//                                         }}
//                                     >
//                                         <Text style={styles.closeText}>Cancel</Text>
//                                     </TouchableOpacity>
//                                 </View>
//                             )}
//                         </View>
//                     </View>
//                 </Modal>

//                 <Modal
//                     visible={showInvoiceConfirmationForm}
//                     transparent
//                     animationType="slide"
//                     onRequestClose={() => setShowInvoiceConfirmationForm(false)}
//                 >
//                     <View style={styles.modalOverlay}>
//                         <View style={styles.modalContent}>
//                             <Text style={styles.modalTitle}>Confirm Invoice Details</Text>
//                             <View style={styles.confirmationDetails}>
//                                 <Text style={styles.detailText}>Client: {invoiceDetails.clientName}</Text>
//                                 <Text style={styles.detailText}>Job: {invoiceDetails.jobDescription}</Text>
//                                 <Text style={styles.detailText}>Amount: ${invoiceDetails.amount}</Text>
//                                 {invoiceDetails.salesTax !== null && (
//                                     <Text style={styles.detailText}>Sales Tax: ${invoiceDetails.salesTax}</Text>
//                                 )}
//                                 {invoiceDetails.type && <Text style={styles.detailText}>Type: {invoiceDetails.type}</Text>}
//                                 {invoiceDetails.date && <Text style={styles.detailText}>Date: {new Date(invoiceDetails.date).toDateString()}</Text>}
//                                 {/* {invoiceDetails.paymentTerms && ( */}
//                                     <Text style={styles.detailText}>Payment Terms: Due upon receipt</Text>
//                                 {/* )} */}
//                                 {invoiceDetails.email && <Text style={styles.detailText}>Email: {invoiceDetails.email}</Text>}
//                                 {invoiceDetails.phoneNumber && (
//                                     <Text style={styles.detailText}>Phone: {invoiceDetails.phoneNumber}</Text>
//                                 )}
//                             </View>
//                             {isProcessing ? (
//                                 <View style={styles.processingIndicator}>
//                                     <ActivityIndicator size="large" color={THEME.PRIMARY} />
//                                     <Text style={styles.processingText}>Saving and Sending...</Text>
//                                 </View>
//                             ) : (
//                                 <View style={styles.confirmationButtons}>
//                                     <TouchableOpacity
//                                         style={[styles.optionButton, { backgroundColor: THEME.PRIMARY }]}
//                                         onPress={saveInvoice}
//                                     >
//                                         <Text style={[styles.optionText, { color: COLORS.WHITE }]}>Confirm</Text>
//                                     </TouchableOpacity>
//                                     <TouchableOpacity
//                                         style={[styles.optionButton, { backgroundColor: COLORS.GRAY }]}
//                                         onPress={() => {
//                                             setShowInvoiceConfirmationForm(false);
//                                             setConversationContext((prev) => ({
//                                                 ...prev,
//                                                 isModificationMode: true,
//                                                 requestedChangeField: null,
//                                             }));
//                                             setVoiceMode("response");
//                                             speak("What would you like to change in the invoice?");
//                                             startVoiceListener();
//                                         }}
//                                     >
//                                         <Text style={styles.optionText}>Modify</Text>
//                                     </TouchableOpacity>
//                                     <TouchableOpacity
//                                         style={styles.closeButton}
//                                         onPress={() => {
//                                             setShowInvoiceConfirmationForm(false);
//                                             setVoiceMode("init");
//                                             resetConversation();
//                                             speak("Invoice creation cancelled. How can I assist you now?");
//                                         }}
//                                     >
//                                         <Text style={styles.closeText}>Cancel</Text>
//                                     </TouchableOpacity>
//                                 </View>
//                             )}
//                         </View>
//                     </View>
//                 </Modal>

//                 <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={toggleModal}>
//                     <View style={styles.modalOverlay}>
//                         <View style={styles.modalContent}>
//                             <Text style={styles.modalTitle}>Manual Entry Options</Text>
//                             {isProcessing ? (
//                                 <View style={styles.processingIndicator}>
//                                     <ActivityIndicator size="large" color={THEME.PRIMARY} />
//                                     <Text style={styles.processingText}>Processing...</Text>
//                                 </View>
//                             ) : (
//                                 <>
//                                     <TouchableOpacity style={styles.optionButton} onPress={handleViewEvents}>
//                                         <Icon name="list" size={30} color={THEME.PRIMARY} />
//                                         <Text style={styles.optionText}>Event List</Text>
//                                     </TouchableOpacity>
//                                     <TouchableOpacity style={styles.optionButton} onPress={handleScheduleEvent}>
//                                         <Icon name="calendar-outline" size={30} color={THEME.PRIMARY} />
//                                         <Text style={styles.optionText}>Schedule Event</Text>
//                                     </TouchableOpacity>
//                                     <TouchableOpacity style={styles.optionButton} onPress={() => navigation.navigate('InvoicesList')}>
//                                         {/* <FontAwesome6 name="file-invoice" size={30} color={THEME.PRIMARY} /> */}
//                                         <Icon name="document-text-outline" size={30} color={THEME.PRIMARY} />
//                                         <Text style={styles.optionText}>View Invoices</Text>
//                                     </TouchableOpacity>
//                                     {isAuthenticated && (
//                                         <TouchableOpacity
//                                             style={styles.optionButton}
//                                             onPress={() => {
//                                                 GoogleAuthService.signOut().then(() => {
//                                                     setIsAuthenticated(false);
//                                                     Alert.alert("Signed Out", "You have been signed out successfully");
//                                                 });
//                                                 cleanup();
//                                             }}
//                                         >
//                                             <Icon name="log-out-outline" size={30} color={THEME.PRIMARY} />
//                                             <Text style={styles.optionText}>Sign Out</Text>
//                                         </TouchableOpacity>
//                                     )}
//                                     <TouchableOpacity style={styles.closeButton} onPress={cleanup}>
//                                         <Text style={styles.closeText}>Cancel</Text>
//                                     </TouchableOpacity>
//                                 </>
//                             )}
//                         </View>
//                     </View>
//                 </Modal>
//             </View>
//         </View>
//     );
// };

// const customStyles = StyleSheet.create({
//     dropdownContainer: {
//         width: "60%",
//         alignSelf: "center",
//         marginTop: 20,
//         backgroundColor: "rgba(255, 255, 255, 0.8)",
//         borderRadius: 8,
//     },
//     picker: {
//         height: 50,
//         width: "100%",
//         color: COLORS.BLACK,
//     },
// });

// export default MainScreen;