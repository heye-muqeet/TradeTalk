// import React, { useCallback, useEffect, useRef, useState } from "react";
// import { View, TouchableOpacity, Alert, Text } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import LottieView from "lottie-react-native";
// import Icon from "react-native-vector-icons/Ionicons";
// import AntDesign from "react-native-vector-icons/AntDesign";
// import Voice from "@react-native-voice/voice";
// import Sound from "react-native-sound";
// import { COLORS, SCREENS, API } from "../../constants/constants";
// import { useFocusEffect, useNavigation } from "@react-navigation/native";
// import styles from "./MainScreen.styles";
// import GoogleAuthService from "../../utility/GoogleAuth/googleAuthService";
// import { useAppDispatch, useAppSelector } from "../../redux/hooks";
// import { logout } from "../../redux/app/appAction";
// import { ConversationContext, InvoiceInfo, ClientData, persistentInvoiceInfo, persistentEventInfo } from "./types/types";
// import { conversation, eventInfo, invoiceDetail, invoiceInfo } from "./states/initialStates";
// import { googleAuthService } from "../../utility/GoogleCalendar/googleAuthentication";
// import { getOpenAIResponse } from "../../utility/OpenAi/openAiUtils";
// import { InvoiceUtils } from "./utilities/InvoiceDetails/invoiceUtils";
// import { EventUtils } from "./utilities/EventsDetails/eventUtils";
// import { speak } from "../../utility/GoogleVoice/googleVoice";
// import { requestMicPermission } from "../../utility/Permission/permissionServices";
// import ModalComponent from "./components/ModalComponent";
// import { translations } from "../../language/translation";

// Sound.setCategory("Playback");

// const MainScreen: React.FC = () => {
//     const navigation = useNavigation<any>();
//     const dispatch = useAppDispatch();
//     const googleCalendarToken = useAppSelector((state) => state.appState.googleCalendarToken);
//     const user = useAppSelector((state) => state.appState.user);
//     const userId = user?.id || null;
//     console.log("User:", userId);
//     const [modalType, setModalType] = useState<"eventConfirmation" | "invoiceConfirmation" | "manualEntry" | null>(null);
//     const [isListening, setIsListening] = useState(false);
//     const [spokenText, setSpokenText] = useState("");
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [selectedMode, setSelectedMode] = useState<"manual" | "auto" | "invoice" | "quote" | "">("");
//     const [language, setLanguage] = useState<"en-US" | "es-ES">("en-US");
//     const [eventTitle, setEventTitle] = useState("");
//     const [parsedDate, setParsedDate] = useState<Date | null>(null);
//     const [voiceMode, setVoiceMode] = useState<"init" | "response" | "confirm">("init");
//     const [hasMicPermission, setHasMicPermission] = useState(false);
//     const [retryCount, setRetryCount] = useState(0);
//     const [quotes, setQuotes] = useState<{ id: number; clientName: string; pdfUrl: string; createdAt: Date; status: string }[]>([]);
//     const MAX_RETRIES = 9;
//     const isVoiceStartingRef = useRef(false);
//     const [invoiceDetails, setInvoiceDetails] = useState<InvoiceInfo>(invoiceDetail);
//     const persistentEventInfoRef = useRef<persistentEventInfo>(eventInfo);
//     const persistentInvoiceInfoRef = useRef<persistentInvoiceInfo>(invoiceInfo);
//     const [conversationContext, setConversationContext] = useState<ConversationContext>({
//         ...conversation,
//         language,
//     });
//     const t = translations[language];

//     const { determineNextInvoiceQuestion, parseInvoiceDetails } = InvoiceUtils();
//     const { determineNextQuestion, parseEventDetails } = EventUtils();
//     const { validateAndRefreshToken, handleGoogleCalendarAuth } = googleAuthService();

//     useFocusEffect(
//         useCallback(() => {
//             const checkAuthAndToken = async () => {
//                 const authenticated = await GoogleAuthService.isAuthenticated();
//                 setIsAuthenticated(authenticated);
//                 if (authenticated && googleCalendarToken) await validateAndRefreshToken(googleCalendarToken, setIsAuthenticated);
//             };
//             checkAuthAndToken();
//         }, [googleCalendarToken])
//     );

//     useEffect(() => {
//         if (!googleCalendarToken || !isAuthenticated) return;
//         const interval = setInterval(() => validateAndRefreshToken(googleCalendarToken, setIsAuthenticated), 5 * 60 * 1000);
//         return () => clearInterval(interval);
//     }, [googleCalendarToken, isAuthenticated]);

//     useEffect(() => {
//         const initialize = async () => {
//             await requestMicPermission(setHasMicPermission);
//             Voice.onSpeechStart = () => {
//                 setIsListening(true);
//                 isVoiceStartingRef.current = false;
//             };
//             Voice.onSpeechEnd = () => {
//                 setIsListening(false);
//                 isVoiceStartingRef.current = false;
//             };
//             Voice.onSpeechResults = (e) => {
//                 setRetryCount(0);
//                 handleSpeechResults(e.value[0]);
//             };
//             Voice.onSpeechError = (e) => {
//                 setIsListening(false);
//                 isVoiceStartingRef.current = false;
//                 if (e.error?.code !== "5" && e.error?.code !== "7") {
//                     if (retryCount < MAX_RETRIES) {
//                         setRetryCount((prev) => prev + 1);
//                         speak(t.voiceError, language).then(startVoiceListener);
//                     } else {
//                         speak(t.tooManyRetries, language).then(() => {
//                             setVoiceMode("init");
//                             setRetryCount(0);
//                             Voice.stop();
//                         });
//                     }
//                 }
//             };
//             return () => Voice.destroy().then(Voice.removeAllListeners);
//         };
//         initialize();
//     }, [voiceMode, selectedMode, hasMicPermission, retryCount, language]);

//     const startVoiceListener = async () => {
//         if (!hasMicPermission || isListening || isVoiceStartingRef.current) return;
//         try {
//             isVoiceStartingRef.current = true;
//             await Voice.stop();
//             await Voice.start(language);
//         } catch (error: any) {
//             isVoiceStartingRef.current = false;
//             if (error.code !== "5" && error.code !== "7") {
//                 speak(t.voiceStartError, language);
//             }
//         }
//     };

//     const fetchEventsByDate = async (date: Date) => {
//         if (!googleCalendarToken) throw new Error("Not authenticated");
//         const startOfDay = new Date(date);
//         startOfDay.setHours(0, 0, 0, 0);
//         const endOfDay = new Date(date);
//         endOfDay.setHours(23, 59, 59, 999);
//         const url = `${API.BASE_URL2}/calendar/event/primary?time=${startOfDay.toISOString()}`;
//         const response = await fetch(url, {
//             method: "GET",
//             headers: { Authorization: `Bearer ${googleCalendarToken}`, "Content-Type": "application/json" },
//         });
//         const events = await response.json();
//         if (!response.ok) throw new Error(events.error || "Failed to fetch events");
//         return events.filter((event: any) => {
//             const eventStart = new Date(event.start.dateTime || event.start.date);
//             return eventStart >= startOfDay && eventStart <= endOfDay;
//         });
//     };

//     const fetchQuotes = async () => {
//         if (!googleCalendarToken || !userId) return [];
//         try {
//             const url = `${API.BASE_URL2}/invoices/quotes?userId=${userId}`;
//             const response = await fetch(url, {
//                 method: "GET",
//                 headers: {
//                     Authorization: `Bearer ${googleCalendarToken}`,
//                     "Content-Type": "application/json",
//                 },
//             });
//             const data = await response.json();

//             console.log(data);
            
//             if (response.ok) {
//                 setQuotes(data);
//                 return data;
//             } else {
//                 throw new Error(data.error || "Failed to fetch quotes");
//             }
//         } catch (error) {
//             console.error("Error fetching quotes:", error);
//             return [];
//         }
//     };

//     const convertQuoteToInvoice = async () => {
//         if (!conversationContext.selectedQuoteId || !userId) return;
//         setIsProcessing(true);
//         try {
//             const url = `${API.BASE_URL2}/invoices/convert-quote`;
//             const response = await fetch(url, {
//                 method: "PATCH",
//                 headers: {
//                     Authorization: `Bearer ${googleCalendarToken}`,
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     quoteId: conversationContext.selectedQuoteId,
//                     userId,
//                     invoiceNumber: conversationContext.selectedQuoteId.toString(),
//                 }),
//             });
//             const responseData = await response.json();
//             if (response.ok) {
//                 setInvoiceDetails({
//                     ...invoiceDetails,
//                     type: "invoice",
//                     status: "Draft",
//                     jobDescription: `${invoiceDetails.jobDescription || ""} (Invoice #${conversationContext.selectedQuoteId})`,
//                 });
//                 setModalType("invoiceConfirmation");
//                 speak(t.invoiceConfirm, language);
//                 setConversationContext((prev) => ({
//                     ...prev,
//                     isQuoteMode: false,
//                     isComplete: true,
//                     selectedQuoteId: null,
//                 }));
//             } else {
//                 throw new Error(responseData.error || "Failed to convert quote");
//             }
//         } catch (error) {
//             console.error("Error converting quote:", error);
//             speak(t.failInvoice, language).then(() => {
//                 setVoiceMode("response");
//                 setModalType(null);
//             });
//         } finally {
//             setIsProcessing(false);
//         }
//     };

//     const handleModeChange = (mode: "manual" | "auto" | "invoice" | "quote" | "") => {
//         setSelectedMode(mode);
//         setRetryCount(0);
//         setConversationContext({ ...conversation, language });
//         persistentEventInfoRef.current = eventInfo;
//         persistentInvoiceInfoRef.current = invoiceInfo;

//         if (mode === "auto") {
//             setVoiceMode("init");
//             getOpenAIResponse("", `Generate a friendly greeting in ${language === "es-ES" ? "Spanish" : "English"} asking how I can assist with calendar events today.`).then(
//                 (greeting) => speak(greeting, language).then(startVoiceListener)
//             );
//         } else if (mode === "invoice") {
//             setVoiceMode("init");
//             setConversationContext((prev) => ({ ...prev, isInvoiceMode: true, language }));
//             getOpenAIResponse("", `Generate a friendly greeting in ${language === "es-ES" ? "Spanish" : "English"} asking how I can assist with creating an invoice.`).then(
//                 (greeting) => speak(greeting, language).then(startVoiceListener)
//             );
//         } else if (mode === "quote") {
//             setVoiceMode("init");
//             setConversationContext((prev) => ({ ...prev, isInvoiceMode: true, isQuoteMode: true, language }));
//             fetchQuotes().then((quotes) => {
//                 const message = quotes.length > 0 ? t.quotePrompt : t.quoteNoQuotes;
//                 speak(message, language).then(startVoiceListener);
//             });
//         } else {
//             setVoiceMode("init");
//             Voice.stop();
//         }
//     };

//     const handleLanguageChange = (lang: "en-US" | "es-ES") => {
//         setLanguage(lang);
//         setConversationContext((prev) => ({ ...prev, language: lang }));
//         const langName = lang === "es-ES" ? t.spanish : t.english;
//         speak(t.languageChange(langName), lang);
//     };

//     const checkClientInBackend = async (clientName: string): Promise<ClientData | null> => {
//         try {
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

//     const handleSpeechResults = async (text: string) => {
//         setSpokenText(text);
//         const cancelWords = language === "es-ES" ? ["cancelar", "para"] : ["cancel", "stop"];
//         if (cancelWords.some((word) => text.toLowerCase().includes(word))) {
//             resetConversation();
//             await speak(t.voiceCancel, language).then(() => Voice.stop());
//             return;
//         }

//         setIsProcessing(true);

//         try {
//             if (conversationContext.isInvoiceMode && !conversationContext.isQuoteMode) {
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
//                     status: invoiceInfo.status || persistentInvoiceInfoRef.current.status,
//                 };

//                 const hasCoreInfo = completeInvoiceInfo.clientName && completeInvoiceInfo.jobDescription && completeInvoiceInfo.amount !== null;

//                 if (conversationContext.isModificationMode) {
//                     const confirmWords = language === "es-ES" ? ["confirmar", "está bien", "correcto"] : ["confirm", "looks good", "that's fine"];
//                     if (confirmWords.some((word) => text.toLowerCase().includes(word))) {
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
//                             status: completeInvoiceInfo.status,
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
//                         setModalType("invoiceConfirmation");
//                         setConversationContext((prev) => ({
//                             ...prev,
//                             isModificationMode: false,
//                             requestedChangeField: null,
//                             isComplete: true,
//                         }));
//                         await speak(t.invoiceConfirm, language);
//                     } else if (
//                         invoiceInfo.containsClientName ||
//                         invoiceInfo.containsJobDescription ||
//                         invoiceInfo.containsAmount ||
//                         invoiceInfo.containsSalesTax ||
//                         invoiceInfo.containsType ||
//                         invoiceInfo.containsDate ||
//                         invoiceInfo.containsPaymentTerms ||
//                         invoiceInfo.containsEmail ||
//                         invoiceInfo.containsPhoneNumber ||
//                         invoiceInfo.containsSendMethod
//                     ) {
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
//                             status: completeInvoiceInfo.status,
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
//                         setModalType("invoiceConfirmation");
//                         setConversationContext((prev) => ({
//                             ...prev,
//                             isModificationMode: false,
//                             requestedChangeField: null,
//                             isComplete: true,
//                         }));
//                         await speak(t.invoiceUpdateConfirm, language);
//                     } else {
//                         const nextQuestion = await determineNextInvoiceQuestion(completeInvoiceInfo);
//                         if (nextQuestion) {
//                             await speak(nextQuestion, language).then(startVoiceListener);
//                             setConversationContext((prev) => ({ ...prev, lastQuestion: nextQuestion }));
//                             setVoiceMode("response");
//                         }
//                     }
//                 } else if (hasCoreInfo && !completeInvoiceInfo.sendMethod) {
//                     if (completeInvoiceInfo.email || completeInvoiceInfo.phoneNumber) {
//                         const question = completeInvoiceInfo.email && completeInvoiceInfo.phoneNumber
//                             ? t.invoiceSendMethodPrompt(completeInvoiceInfo.clientName, completeInvoiceInfo.email, completeInvoiceInfo.phoneNumber)
//                             : completeInvoiceInfo.email
//                                 ? t.invoiceSendMethodEmail(completeInvoiceInfo.clientName, completeInvoiceInfo.email)
//                                 : t.invoiceSendMethodPhone(completeInvoiceInfo.clientName, completeInvoiceInfo.phoneNumber);
//                         await speak(question, language).then(startVoiceListener);
//                         setConversationContext((prev) => ({
//                             ...prev,
//                             lastAskedFor: "sendMethod",
//                             needsSendMethod: true,
//                         }));
//                         setVoiceMode("response");
//                     } else {
//                         const question = completeInvoiceInfo.clientName
//                             ? t.invoiceContactPrompt(completeInvoiceInfo.clientName)
//                             : t.invoiceContactPromptGeneric;
//                         await speak(question, language).then(startVoiceListener);
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
//                         status: completeInvoiceInfo.status,
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
//                     setModalType("invoiceConfirmation");
//                     await speak(t.invoiceConfirm, language);
//                     setConversationContext((prev) => ({ ...prev, isComplete: true }));
//                 } else {
//                     const nextQuestion = await determineNextInvoiceQuestion(completeInvoiceInfo);
//                     if (nextQuestion) {
//                         await speak(nextQuestion, language).then(startVoiceListener);
//                         setConversationContext((prev) => ({ ...prev, lastQuestion: nextQuestion }));
//                         setVoiceMode("response");
//                     } else if (!completeInvoiceInfo.clientName) {
//                         await speak(t.invoiceClientPrompt, language).then(startVoiceListener);
//                         setConversationContext((prev) => ({ ...prev, lastAskedFor: "clientName" }));
//                         setVoiceMode("response");
//                     } else if (!completeInvoiceInfo.jobDescription) {
//                         const question = completeInvoiceInfo.clientName
//                             ? t.invoiceJobPrompt(completeInvoiceInfo.clientName)
//                             : t.invoiceJobPromptGeneric;
//                         await speak(question, language).then(startVoiceListener);
//                         setConversationContext((prev) => ({ ...prev, lastAskedFor: "jobDescription" }));
//                         setVoiceMode("response");
//                     } else if (completeInvoiceInfo.amount === null) {
//                         const question = completeInvoiceInfo.clientName && completeInvoiceInfo.jobDescription
//                             ? t.invoiceAmountPrompt(completeInvoiceInfo.clientName, completeInvoiceInfo.jobDescription)
//                             : t.invoiceAmountPromptGeneric;
//                         await speak(question, language).then(startVoiceListener);
//                         setConversationContext((prev) => ({ ...prev, lastAskedFor: "amount" }));
//                         setVoiceMode("response");
//                     } else {
//                         await speak(t.invoiceMissingInfo, language).then(startVoiceListener);
//                         setVoiceMode("response");
//                     }
//                 }
//             } else if (conversationContext.isQuoteMode) {
//                 const newInvoiceWords = language === "es-ES" ? ["nueva factura", "crear factura"] : ["new invoice", "create invoice"];
//                 if (newInvoiceWords.some((word) => text.toLowerCase().includes(word))) {
//                     setConversationContext((prev) => ({ ...prev, isQuoteMode: false }));
//                     handleModeChange("invoice");
//                     return;
//                 }

//                 const invoiceNumberMatch = text.match(/#(\d+)/) || text.match(/número (\d+)/);
//                 const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : null;

//                 if (invoiceNumber) {
//                     const quote = quotes.find((q) => q.id.toString() === invoiceNumber);
//                     if (quote) {
//                         setInvoiceDetails({
//                             clientName: quote.clientName,
//                             jobDescription: null,
//                             amount: null,
//                             salesTax: null,
//                             type: "invoice",
//                             date: new Date().toISOString(),
//                             paymentTerms: "Due upon receipt",
//                             email: null,
//                             phoneNumber: null,
//                             sendMethod: null,
//                             status: "Draft",
//                             containsClientName: true,
//                             containsJobDescription: false,
//                             containsAmount: false,
//                             containsSalesTax: false,
//                             containsType: true,
//                             containsDate: true,
//                             containsPaymentTerms: true,
//                             containsEmail: false,
//                             containsPhoneNumber: false,
//                         });
//                         persistentInvoiceInfoRef.current = {
//                             clientName: quote.clientName,
//                             jobDescription: null,
//                             amount: null,
//                             salesTax: null,
//                             type: "invoice",
//                             date: new Date().toISOString(),
//                             paymentTerms: "Due upon receipt",
//                             email: null,
//                             phoneNumber: null,
//                             sendMethod: null,
//                             status: "Draft",
//                         };
//                         setConversationContext((prev) => ({
//                             ...prev,
//                             clientName: quote.clientName,
//                             type: "invoice",
//                             invoiceDate: new Date().toISOString(),
//                             paymentTerms: "Due upon receipt",
//                             status: "Draft",
//                             needsClientName: false,
//                             needsJobDescription: true,
//                             needsAmount: true,
//                             needsContactInfo: true,
//                             needsSendMethod: true,
//                             selectedQuoteId: quote.id,
//                             lastAskedFor: "quoteConfirmation",
//                         }));
//                         await speak(t.quoteConfirm(quote.id.toString(), quote.clientName), language).then(startVoiceListener);
//                         setVoiceMode("response");
//                     } else {
//                         await speak(t.quoteNotFound(invoiceNumber), language).then(startVoiceListener);
//                         setVoiceMode("response");
//                     }
//                 } else if (conversationContext.lastAskedFor === "quoteConfirmation") {
//                     const yesWords = language === "es-ES" ? ["sí", "si", "correcto"] : ["yes", "correct"];
//                     const noWords = language === "es-ES" ? ["no", "incorrecto"] : ["no", "incorrect"];
//                     if (yesWords.some((word) => text.toLowerCase().includes(word))) {
//                         await convertQuoteToInvoice();
//                     } else if (noWords.some((word) => text.toLowerCase().includes(word))) {
//                         await speak(t.quoteRetry, language).then(startVoiceListener);
//                         setConversationContext((prev) => ({
//                             ...prev,
//                             selectedQuoteId: null,
//                             lastAskedFor: "quoteNumber",
//                         }));
//                         setVoiceMode("response");
//                     }
//                 } else {
//                     await speak(t.quotePrompt, language).then(startVoiceListener);
//                     setConversationContext((prev) => ({ ...prev, lastAskedFor: "quoteNumber" }));
//                     setVoiceMode("response");
//                 }
//             } else {
//                 const eventInfo = await parseEventDetails(text);
//                 console.log(eventInfo);

//                 const completeEventInfo = {
//                     title: eventInfo.title || persistentEventInfoRef.current.title,
//                     date: eventInfo.date || persistentEventInfoRef.current.date,
//                     time: eventInfo.time || persistentEventInfoRef.current.time,
//                     timePeriod: eventInfo.timePeriod || persistentEventInfoRef.current.timePeriod,
//                 };

//                 if (eventInfo.isFreeSlotCheck && eventInfo.date) {
//                     const events = await fetchEventsByDate(eventInfo.date);
//                     const message = events.length > 0
//                         ? t.eventBusySlot(eventInfo.date.toDateString(), events.map((e: any) => e.summary).join(", "))
//                         : t.eventFreeSlot(eventInfo.date.toDateString());
//                     await speak(message, language).then(startVoiceListener);
//                     setParsedDate(eventInfo.date);
//                     setVoiceMode("response");
//                     setIsProcessing(false);
//                     return;
//                 }

//                 if (eventInfo.timePeriod && !eventInfo.time && !conversationContext.needsTitle && !conversationContext.needsDate) {
//                     const timeQuestion = eventInfo.title
//                         ? t.eventTimePrompt(eventInfo.title, eventInfo.date?.toDateString(), eventInfo.timePeriod)
//                         : t.eventTimePromptGeneric(eventInfo.date?.toDateString(), eventInfo.timePeriod);
//                     await speak(timeQuestion, language).then(startVoiceListener);
//                     setConversationContext((prev) => ({
//                         ...prev,
//                         lastAskedFor: "time",
//                         needsExactTime: true,
//                     }));
//                     setVoiceMode("response");
//                     setIsProcessing(false);
//                     return;
//                 }

//                 const hasCompleteInfo =
//                     completeEventInfo.title &&
//                     completeEventInfo.date &&
//                     (completeEventInfo.time ||
//                         (completeEventInfo.date.getHours() !== 0 && completeEventInfo.date.getMinutes() !== 0));

//                 console.log("Complete event check:", {
//                     hasTitle: !!completeEventInfo.title,
//                     hasDate: !!completeEventInfo.date,
//                     hasTime: !!completeEventInfo.time || (completeEventInfo.date && completeEventInfo.date.getHours() !== 0),
//                     hasCompleteInfo,
//                 });

//                 if (hasCompleteInfo) {
//                     const events = await fetchEventsByDate(completeEventInfo.date);
//                     const timeSlotTaken = events.some((e: any) => {
//                         const eventStart = new Date(e.start.dateTime || e.start.date);
//                         const eventEnd = new Date(e.end.dateTime || e.end.date);
//                         return completeEventInfo.date >= eventStart && completeEventInfo.date <= eventEnd;
//                     });

//                     if (timeSlotTaken) {
//                         await speak(t.eventSlotTaken(completeEventInfo.title), language).then(startVoiceListener);
//                         setConversationContext((prev) => ({ ...prev, lastAskedFor: "time" }));
//                         setVoiceMode("response");
//                     } else {
//                         setEventTitle(completeEventInfo.title);
//                         setParsedDate(completeEventInfo.date);
//                         setModalType("eventConfirmation");
//                         await speak(
//                             t.eventConfirm(
//                                 completeEventInfo.title,
//                                 completeEventInfo.date.toDateString(),
//                                 completeEventInfo.date?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
//                             ),
//                             language
//                         );
//                         setConversationContext((prev) => ({ ...prev, isComplete: true }));
//                     }
//                 } else {
//                     const nextQuestion = await determineNextQuestion(completeEventInfo);
//                     if (nextQuestion) {
//                         await speak(nextQuestion, language).then(startVoiceListener);
//                         setConversationContext((prev) => ({ ...prev, lastQuestion: nextQuestion }));
//                         setVoiceMode("response");
//                     } else if (!completeEventInfo.title) {
//                         await speak(t.eventTitlePrompt, language).then(startVoiceListener);
//                         setConversationContext((prev) => ({ ...prev, lastAskedFor: "title" }));
//                         setVoiceMode("response");
//                     } else if (!completeEventInfo.date) {
//                         const question = completeEventInfo.title
//                             ? t.eventDatePrompt(completeEventInfo.title)
//                             : t.eventDatePromptGeneric;
//                         await speak(question, language).then(startVoiceListener);
//                         setConversationContext((prev) => ({ ...prev, lastAskedFor: "date" }));
//                         setVoiceMode("response");
//                     } else if (completeEventInfo.date && (!completeEventInfo.time || eventInfo.hasGeneralTimeOnly)) {
//                         const question = completeEventInfo.timePeriod
//                             ? t.eventTimePrompt(
//                                 completeEventInfo.title || "the event",
//                                 completeEventInfo.date.toDateString(),
//                                 completeEventInfo.timePeriod
//                             )
//                             : t.eventTimePromptGeneric(completeEventInfo.date.toDateString(), completeEventInfo.timePeriod);
//                         await speak(question, language).then(startVoiceListener);
//                         setConversationContext((prev) => ({ ...prev, lastAskedFor: "time" }));
//                         setVoiceMode("response");
//                     } else {
//                         await speak(t.eventError, language).then(startVoiceListener);
//                         setVoiceMode("response");
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error("Error in speech processing:", error);
//             await speak(t.speechError, language).then(startVoiceListener);
//         }

//         setIsProcessing(false);
//     };

//     const resetConversation = () => {
//         setConversationContext({ ...conversation, language });
//         persistentEventInfoRef.current = eventInfo;
//         persistentInvoiceInfoRef.current = invoiceInfo;
//         setVoiceMode("init");
//     };

//     const saveEvent = async () => {
//         if (!eventTitle || !parsedDate) {
//             Alert.alert("Error", t.eventError);
//             await speak(t.eventError, language).then(() => {
//                 setVoiceMode("response");
//                 setModalType(null);
//             });
//             return;
//         }

//         if (!googleCalendarToken) {
//             Alert.alert("Error", t.authError);
//             await speak(t.authError, language).then(() => {
//                 setVoiceMode("init");
//                 setModalType(null);
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
//                 Alert.alert("Success", t.successEvent, [
//                     {
//                         text: "OK",
//                         onPress: () => {
//                             handleModeChange("manual");
//                             setEventTitle("");
//                             setParsedDate(null);
//                             setModalType(null);
//                             speak(t.successEvent, language);
//                         },
//                     },
//                 ]);
//             } else {
//                 throw new Error(`Failed to create event: ${responseData.error?.message || "Unknown error"}`);
//             }
//         } catch (error) {
//             console.error("Error creating event:", error);
//             Alert.alert("Error", t.failEvent);
//             await speak(t.failEvent, language).then(() => {
//                 setVoiceMode("response");
//                 setModalType(null);
//             });
//         } finally {
//             setIsProcessing(false);
//         }
//     };

//     const saveInvoice = async () => {
//         if (!invoiceDetails.clientName || !invoiceDetails.jobDescription || invoiceDetails.amount === null) {
//             Alert.alert("Error", t.invoiceError);
//             await speak(t.invoiceError, language).then(() => {
//                 setVoiceMode("response");
//                 setModalType(null);
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
//                 status: invoiceDetails.status || "Pending",
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
//                 Alert.alert("Success", t.successInvoice, [
//                     {
//                         text: "OK",
//                         onPress: () => {
//                             handleModeChange("manual");
//                             setInvoiceDetails(invoiceDetail);
//                             setModalType(null);
//                             speak(t.successInvoice, language);
//                         },
//                     },
//                 ]);
//             } else {
//                 throw new Error(`Failed to create invoice: ${responseData.error?.message || "Unknown error"}`);
//             }
//         } catch (error) {
//             console.error("Error creating invoice:", error);
//             Alert.alert("Error", t.failInvoice);
//             await speak(t.failInvoice, language).then(() => {
//                 setVoiceMode("response");
//                 setModalType(null);
//             });
//         } finally {
//             setIsProcessing(false);
//         }
//     };

//     const toggleModal = () => setModalType("manualEntry");

//     const handleScheduleEvent = async () => {
//         setIsProcessing(true);
//         try {
//             const success = await handleGoogleCalendarAuth();
//             if (success) {
//                 setModalType(null);
//                 navigation.navigate("CalendarScreen");
//             }
//         } catch (error) {
//             Alert.alert("Failed", "Could not authenticate Google Calendar.");
//         } finally {
//             setIsProcessing(false);
//         }
//     };

//     const handleLogoutPress = () => {
//         Alert.alert("Logout", "Are you sure you want to log out?", [
//             { text: "Cancel", style: "cancel" },
//             {
//                 text: "Yes",
//                 onPress: () => {
//                     navigation.reset({ index: 0, routes: [{ name: SCREENS.SPLASH }] });
//                     dispatch(logout());
//                 },
//             },
//         ]);
//     };

//     const handleViewEvents = async () => {
//         setIsProcessing(true);
//         try {
//             const success = await handleGoogleCalendarAuth();
//             if (success) {
//                 setModalType(null);
//                 navigation.navigate("EventListScreen");
//             }
//         } catch (error) {
//             Alert.alert("Failed", "Could not authenticate Google Calendar.");
//         } finally {
//             setIsProcessing(false);
//         }
//     };

//     const handleViewInvoices = () => {
//         setModalType(null);
//         navigation.navigate("InvoicesList");
//     };

//     const handleSignOut = () => {
//         GoogleAuthService.signOut().then(() => {
//             setIsAuthenticated(false);
//             Alert.alert("Signed Out", "You have been signed out successfully");
//             setModalType(null);
//         });
//     };

//     const handleEventModify = () => {
//         setModalType(null);
//         setVoiceMode("response");
//         speak(t.eventTitlePrompt, language);
//     };

//     const handleInvoiceModify = () => {
//         setModalType(null);
//         setConversationContext((prev) => ({
//             ...prev,
//             isModificationMode: true,
//             requestedChangeField: null,
//         }));
//         setVoiceMode("response");
//         speak(t.invoiceModifyPrompt, language);
//         startVoiceListener();
//     };

//     const handleCancel = () => {
//         setModalType(null);
//         if (modalType === "eventConfirmation") {
//             setVoiceMode("init");
//             speak(t.eventError, language);
//         } else if (modalType === "invoiceConfirmation") {
//             setVoiceMode("init");
//             resetConversation();
//             speak(t.invoiceError, language);
//         }
//     };

//     return (
//         <View style={styles.background}>
//             <View style={styles.container}>
//                 <TouchableOpacity onPress={handleLogoutPress} style={styles.logoutIcon}>
//                     <AntDesign name="logout" size={34} color={COLORS.WHITE} />
//                 </TouchableOpacity>

//                 <View style={styles.dropdownContainer}>
//                     <Picker
//                         selectedValue={selectedMode}
//                         style={styles.picker}
//                         onValueChange={(itemValue) => handleModeChange(itemValue as "manual" | "auto" | "invoice" | "quote" | "")}
//                     >
//                         <Picker.Item label={t.selectMode} value="" />
//                         <Picker.Item label={t.manual} value="manual" />
//                         <Picker.Item label={t.auto} value="auto" />
//                         <Picker.Item label={t.invoice} value="invoice" />
//                         <Picker.Item label={t.quote} value="quote" />
//                     </Picker>
//                     <Picker
//                         selectedValue={language}
//                         style={styles.picker}
//                         onValueChange={(itemValue) => handleLanguageChange(itemValue as "en-US" | "es-ES")}
//                     >
//                         <Picker.Item label={t.selectLanguage} value="" />
//                         <Picker.Item label={t.english} value="en-US" />
//                         <Picker.Item label={t.spanish} value="es-ES" />
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

//                 <ModalComponent
//                     isVisible={!!modalType}
//                     modalType={modalType}
//                     onClose={handleCancel}
//                     onConfirm={modalType === "eventConfirmation" ? saveEvent : modalType === "invoiceConfirmation" ? saveInvoice : undefined}
//                     onModify={modalType === "eventConfirmation" ? handleEventModify : modalType === "invoiceConfirmation" ? handleInvoiceModify : undefined}
//                     isProcessing={isProcessing}
//                     eventTitle={eventTitle}
//                     parsedDate={parsedDate}
//                     invoiceDetails={invoiceDetails}
//                     handleViewEvents={handleViewEvents}
//                     handleScheduleEvent={handleScheduleEvent}
//                     handleViewInvoices={handleViewInvoices}
//                     handleSignOut={handleSignOut}
//                     isAuthenticated={isAuthenticated}
//                 />
//             </View>
//         </View>
//     );
// };

// export default MainScreen;

















// // ModalComponent.tsx
// import React from "react";
// import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";
// import { InvoiceInfo } from "../types/types";
// import styles from "../MainScreen.styles";
// import { COLORS, THEME } from "../../../constants/constants";

// interface ModalComponentProps {
//     isVisible: boolean;
//     modalType: "eventConfirmation" | "invoiceConfirmation" | "manualEntry" | null;
//     onClose: () => void;
//     onConfirm?: () => void;
//     onModify?: () => void;
//     isProcessing?: boolean;
//     eventTitle?: string;
//     parsedDate?: Date | null;
//     invoiceDetails?: InvoiceInfo;
//     handleViewEvents?: () => void;
//     handleScheduleEvent?: () => void;
//     handleViewInvoices?: () => void;
//     handleSignOut?: () => void;
//     isAuthenticated?: boolean;
// }

// const ModalComponent: React.FC<ModalComponentProps> = ({
//     isVisible,
//     modalType,
//     onClose,
//     onConfirm,
//     onModify,
//     isProcessing,
//     eventTitle,
//     parsedDate,
//     invoiceDetails,
//     handleViewEvents,
//     handleScheduleEvent,
//     handleViewInvoices,
//     handleSignOut,
//     isAuthenticated,
// }) => {

//     const renderContent = () => {
//         switch (modalType) {
//             case "eventConfirmation":
//                 return (
//                     <>
//                         <Text style={styles.modalTitle}>Confirm Event Details</Text>
//                         <View style={styles.confirmationDetails}>
//                             <Text style={styles.detailText}>Title: {eventTitle}</Text>
//                             <Text style={styles.detailText}>Date: {parsedDate?.toDateString()}</Text>
//                             <Text style={styles.detailText}>Time: {parsedDate?.toLocaleTimeString()}</Text>
//                             <Text style={styles.detailText}>Duration: 1 hour</Text>
//                         </View>
//                         {isProcessing ? (
//                             <View style={styles.processingIndicator}>
//                                 <ActivityIndicator size="large" color={THEME.PRIMARY} />
//                                 <Text style={styles.processingText}>Saving...</Text>
//                             </View>
//                         ) : (
//                             <View style={styles.confirmationButtons}>
//                                 <TouchableOpacity
//                                     style={[styles.optionButton, { backgroundColor: THEME.PRIMARY }]}
//                                     onPress={onConfirm}
//                                 >
//                                     <Text style={[styles.optionText, { color: COLORS.WHITE }]}>Confirm</Text>
//                                 </TouchableOpacity>
//                                 <TouchableOpacity
//                                     style={[styles.optionButton, { backgroundColor: COLORS.GRAY }]}
//                                     onPress={onModify}
//                                 >
//                                     <Text style={styles.optionText}>Modify</Text>
//                                 </TouchableOpacity>
//                                 <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//                                     <Text style={styles.closeText}>Cancel</Text>
//                                 </TouchableOpacity>
//                             </View>
//                         )}
//                     </>
//                 );
//             case "invoiceConfirmation":
//                 return (
//                     <>
//                         <Text style={styles.modalTitle}>Confirm Invoice Details</Text>
//                         <View style={styles.confirmationDetails}>
//                             <Text style={styles.detailText}>Client: {invoiceDetails?.clientName}</Text>
//                             <Text style={styles.detailText}>Job: {invoiceDetails?.jobDescription}</Text>
//                             <Text style={styles.detailText}>Amount: ${invoiceDetails?.amount}</Text>
//                             {invoiceDetails?.salesTax !== null && (
//                                 <Text style={styles.detailText}>Sales Tax: ${invoiceDetails?.salesTax}</Text>
//                             )}
//                             {invoiceDetails?.type && <Text style={styles.detailText}>Type: {invoiceDetails?.type}</Text>}
//                             {invoiceDetails?.date && (
//                                 <Text style={styles.detailText}>Date: {new Date(invoiceDetails.date).toDateString()}</Text>
//                             )}
//                             <Text style={styles.detailText}>Payment Terms: Due upon receipt</Text>
//                             {invoiceDetails?.email && <Text style={styles.detailText}>Email: {invoiceDetails?.email}</Text>}
//                             {invoiceDetails?.phoneNumber && (
//                                 <Text style={styles.detailText}>Phone: {invoiceDetails?.phoneNumber}</Text>
//                             )}
//                         </View>
//                         {isProcessing ? (
//                             <View style={styles.processingIndicator}>
//                                 <ActivityIndicator size="large" color={THEME.PRIMARY} />
//                                 <Text style={styles.processingText}>Saving and Sending...</Text>
//                             </View>
//                         ) : (
//                             <View style={styles.confirmationButtons}>
//                                 <TouchableOpacity
//                                     style={[styles.optionButton, { backgroundColor: THEME.PRIMARY }]}
//                                     onPress={onConfirm}
//                                 >
//                                     <Text style={[styles.optionText, { color: COLORS.WHITE }]}>Confirm</Text>
//                                 </TouchableOpacity>
//                                 <TouchableOpacity
//                                     style={[styles.optionButton, { backgroundColor: COLORS.GRAY }]}
//                                     onPress={onModify}
//                                 >
//                                     <Text style={styles.optionText}>Modify</Text>
//                                 </TouchableOpacity>
//                                 <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//                                     <Text style={styles.closeText}>Cancel</Text>
//                                 </TouchableOpacity>
//                             </View>
//                         )}
//                     </>
//                 );
//             case "manualEntry":
//                 return (
//                     <>
//                         <Text style={styles.modalTitle}>Manual Entry Options</Text>
//                         {isProcessing ? (
//                             <View style={styles.processingIndicator}>
//                                 <ActivityIndicator size="large" color={THEME.PRIMARY} />
//                                 <Text style={styles.processingText}>Processing...</Text>
//                             </View>
//                         ) : (
//                             <>
//                                 <TouchableOpacity style={styles.optionButton} onPress={handleViewEvents}>
//                                     <Icon name="list" size={30} color={THEME.PRIMARY} />
//                                     <Text style={styles.optionText}>Event List</Text>
//                                 </TouchableOpacity>
//                                 <TouchableOpacity style={styles.optionButton} onPress={handleScheduleEvent}>
//                                     <Icon name="calendar-outline" size={30} color={THEME.PRIMARY} />
//                                     <Text style={styles.optionText}>Schedule Event</Text>
//                                 </TouchableOpacity>
//                                 <TouchableOpacity style={styles.optionButton} onPress={handleViewInvoices}>
//                                     <Icon name="document-text-outline" size={30} color={THEME.PRIMARY} />
//                                     <Text style={styles.optionText}>View Invoices</Text>
//                                 </TouchableOpacity>
//                                 {isAuthenticated && (
//                                     <TouchableOpacity style={styles.optionButton} onPress={handleSignOut}>
//                                         <Icon name="log-out-outline" size={30} color={THEME.PRIMARY} />
//                                         <Text style={styles.optionText}>Sign Out</Text>
//                                     </TouchableOpacity>
//                                 )}
//                                 <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//                                     <Text style={styles.closeText}>Cancel</Text>
//                                 </TouchableOpacity>
//                             </>
//                         )}
//                     </>
//                 );
//             default:
//                 return null;
//         }
//     };

//     return (
//         <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
//             <View style={styles.modalOverlay}>
//                 <View style={styles.modalContent}>{renderContent()}</View>
//             </View>
//         </Modal>
//     );
// };

// export default ModalComponent;


















// import { useRef, useState } from "react";
// import { ConversationContext, InvoiceInfo, persistentInvoiceInfo } from "../../types/types";
// import { conversation, invoiceInfo } from "../../states/initialStates";
// import axios from "axios";
// import { translations } from "../../../../language/translation";

// export const InvoiceUtils = () => {
//   const persistentInvoiceInfoRef = useRef<persistentInvoiceInfo>(invoiceInfo);
//   const OPENAI_API_KEY = "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";
//   const [conversationContext, setConversationContext] = useState<ConversationContext>(conversation);

//   const parseInvoiceDetails = async (input: string): Promise<InvoiceInfo> => {
//     console.log("Parse");

//     const updatedFullText = conversationContext.fullText + " " + input;
//     setConversationContext((prev) => ({
//       ...prev,
//       fullText: updatedFullText,
//       processedInputs: [...prev.processedInputs, input],
//     }));

//     const currentInvoiceInfo = {
//       clientName: persistentInvoiceInfoRef.current.clientName || conversationContext.clientName,
//       jobDescription: persistentInvoiceInfoRef.current.jobDescription || conversationContext.jobDescription,
//       amount: persistentInvoiceInfoRef.current.amount || conversationContext.amount,
//       salesTax: persistentInvoiceInfoRef.current.salesTax || conversationContext.salesTax,
//       type: persistentInvoiceInfoRef.current.type || conversationContext.type,
//       date: persistentInvoiceInfoRef.current.date || conversationContext.invoiceDate,
//       paymentTerms: persistentInvoiceInfoRef.current.paymentTerms || conversationContext.paymentTerms,
//       email: persistentInvoiceInfoRef.current.email || conversationContext.email,
//       phoneNumber: persistentInvoiceInfoRef.current.phoneNumber || conversationContext.phoneNumber,
//       sendMethod: persistentInvoiceInfoRef.current.sendMethod || conversationContext.sendMethod,
//     };

//     const language = conversationContext.language || "en-US";
//     const t = translations[language];

//     const context = `
//       You are an invoice parser. Extract invoice information from the conversation.
//       Language: ${language === "es-ES" ? "Spanish" : "English"}

//       Current conversation: "${updatedFullText}"

//       What we already know:
//       - Client Name: ${currentInvoiceInfo.clientName || "None"}
//       - Job Description: ${currentInvoiceInfo.jobDescription || "None"}
//       - Amount: ${currentInvoiceInfo.amount || "None"}
//       - Sales Tax: ${currentInvoiceInfo.salesTax || "None"}
//       - Type: ${currentInvoiceInfo.type || "None"}
//       - Date: ${currentInvoiceInfo.date || "None"}
//       - Payment Terms: ${currentInvoiceInfo.paymentTerms || "None"}
//       - Email: ${currentInvoiceInfo.email || "None"}
//       - Phone Number: ${currentInvoiceInfo.phoneNumber || "None"}
//       - Send Method: ${currentInvoiceInfo.sendMethod || "None"}

//       Special Instructions:
//       - If the input indicates a specific change request (e.g., "${language === "es-ES" ? "cambiar el nombre del cliente a John Doe" : "change client name to John Doe"}", "${language === "es-ES" ? "actualizar monto a 500" : "update amount to 500"}"),
//         identify the field to change and extract only that field's new value.
//       - For phone numbers: Return in E.164 format (e.g., "+12345678901").
//       - For email addresses: Normalize to lowercase, remove spaces, validate format.
//       - For amount and sales tax: Extract numeric value, ignore currency symbols.
//       - For sendMethod: Recognize "${language === "es-ES" ? "correo" : "email"}" or "${language === "es-ES" ? "sms" : "sms"}" explicitly.
//       - For type: Recognize "${language === "es-ES" ? "cotización" : "quote"}" or "${language === "es-ES" ? "factura" : "invoice"}" explicitly.
//       - For status: Set to "Pending" for quotes unless explicitly changed.

//       Return a JSON object with these fields:
//       {
//           "clientName": "extracted client name or null",
//           "jobDescription": "extracted job description or null",
//           "amount": "extracted amount as number or null",
//           "salesTax": "extracted sales tax as number or null",
//           "type": "quote or invoice or null",
//           "date": "extracted date as ISO string or null",
//           "paymentTerms": "extracted payment terms or null",
//           "email": "extracted and formatted email or null",
//           "phoneNumber": "extracted and formatted phone number or null",
//           "sendMethod": "email or sms or null",
//           "status": "Pending or Accepted or null",
//           "containsClientName": boolean,
//           "containsJobDescription": boolean,
//           "containsAmount": boolean,
//           "containsSalesTax": boolean,
//           "containsType": boolean,
//           "containsDate": boolean,
//           "containsPaymentTerms": boolean,
//           "containsEmail": boolean,
//           "containsPhoneNumber": boolean,
//           "changeRequestField": "field name if a change was requested (e.g., 'clientName'), null otherwise"
//       }

//       Only extract information from the CURRENT input: "${input}"
//     `;

//     try {
//       const response = await axios.post(
//         "https://api.openai.com/v1/chat/completions",
//         {
//           model: "gpt-3.5-turbo",
//           messages: [
//             { role: "system", content: context },
//             { role: "user", content: "Parse this input." },
//           ],
//           temperature: 0.2,
//           max_tokens: 300,
//         },
//         { headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" } }
//       );

//       const responseText = response.data.choices[0].message.content.trim();
//       console.log("AI Parser Response (Invoice):", responseText);

//       const jsonMatch = responseText.match(/\{[\s\S]*\}/);
//       if (!jsonMatch) throw new Error("Invalid response format");

//       let result = JSON.parse(jsonMatch[0]);

//       // Post-process phone number
//       let formattedPhoneNumber = result.phoneNumber;
//       if (result.containsPhoneNumber && result.phoneNumber) {
//         let cleanedNumber = result.phoneNumber.replace(/[^+\d]/g, "");
//         if (!cleanedNumber.startsWith("+")) {
//           cleanedNumber = `+1${cleanedNumber}`;
//         }
//         const digitCount = cleanedNumber.replace("+", "").length;
//         formattedPhoneNumber = digitCount >= 10 && digitCount <= 15 ? cleanedNumber : null;
//       }

//       // Post-process email
//       let formattedEmail = result.email;
//       if (result.containsEmail && result.email) {
//         formattedEmail = result.email.replace(/\s+/g, "").toLowerCase();
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(formattedEmail)) {
//           formattedEmail = null;
//         }
//       }

//       // In modification mode, only update the requested field
//       if (conversationContext.isModificationMode && result.changeRequestField) {
//         const field = result.changeRequestField;
//         persistentInvoiceInfoRef.current[field] =
//           result[field] !== null ? result[field] : persistentInvoiceInfoRef.current[field];
//         setConversationContext((prev) => ({
//           ...prev,
//           [field]: result[field] !== null ? result[field] : prev[field],
//           needsClientName: !persistentInvoiceInfoRef.current.clientName,
//           needsJobDescription: !persistentInvoiceInfoRef.current.jobDescription,
//           needsAmount: persistentInvoiceInfoRef.current.amount === null,
//           needsContactInfo: !persistentInvoiceInfoRef.current.email && !persistentInvoiceInfoRef.current.phoneNumber,
//           needsSendMethod: !persistentInvoiceInfoRef.current.sendMethod,
//           requestedChangeField: field,
//         }));
//       } else {
//         // Normal parsing: update all provided fields
//         const newClientName = result.containsClientName && result.clientName ? result.clientName : currentInvoiceInfo.clientName;
//         const newJobDescription = result.containsJobDescription && result.jobDescription ? result.jobDescription : currentInvoiceInfo.jobDescription;
//         const newAmount = result.containsAmount && result.amount !== null ? parseFloat(result.amount) : currentInvoiceInfo.amount;
//         const newSalesTax = result.containsSalesTax && result.salesTax !== null ? parseFloat(result.salesTax) : currentInvoiceInfo.salesTax;
//         const newType = result.containsType && result.type ? result.type : currentInvoiceInfo.type;
//         const newDate = result.containsDate && result.date ? result.date : currentInvoiceInfo.date;
//         const newPaymentTerms = result.containsPaymentTerms && result.paymentTerms ? result.paymentTerms : currentInvoiceInfo.paymentTerms;
//         const newEmail = formattedEmail || currentInvoiceInfo.email;
//         const newPhoneNumber = formattedPhoneNumber || currentInvoiceInfo.phoneNumber;
//         const newSendMethod = result.sendMethod ? result.sendMethod.toLowerCase() : currentInvoiceInfo.sendMethod;
//         const newStatus = result.containsStatus && result.status ? result.status : (newType === "quote" ? "Pending" : currentInvoiceInfo.status);

//         persistentInvoiceInfoRef.current = {
//           clientName: newClientName,
//           jobDescription: newJobDescription,
//           amount: newAmount,
//           salesTax: newSalesTax,
//           type: newType,
//           date: newDate,
//           paymentTerms: newPaymentTerms,
//           email: newEmail,
//           phoneNumber: newPhoneNumber,
//           sendMethod: newSendMethod,
//           status: newStatus,
//         };

//         setConversationContext((prev) => ({
//           ...prev,
//           clientName: newClientName,
//           jobDescription: newJobDescription,
//           amount: newAmount,
//           salesTax: newSalesTax,
//           type: newType,
//           invoiceDate: newDate,
//           paymentTerms: newPaymentTerms,
//           email: newEmail,
//           phoneNumber: newPhoneNumber,
//           sendMethod: newSendMethod,
//           status: newStatus,
//           needsClientName: !newClientName,
//           needsJobDescription: !newJobDescription,
//           needsAmount: newAmount === null,
//           needsContactInfo: !newEmail && !newPhoneNumber,
//           needsSendMethod: !newSendMethod,
//         }));
//       }

//       const invoiceInfo: InvoiceInfo = {
//         clientName: persistentInvoiceInfoRef.current.clientName,
//         jobDescription: persistentInvoiceInfoRef.current.jobDescription,
//         amount: persistentInvoiceInfoRef.current.amount,
//         salesTax: persistentInvoiceInfoRef.current.salesTax,
//         type: persistentInvoiceInfoRef.current.type,
//         date: persistentInvoiceInfoRef.current.date,
//         paymentTerms: persistentInvoiceInfoRef.current.paymentTerms,
//         email: persistentInvoiceInfoRef.current.email,
//         phoneNumber: persistentInvoiceInfoRef.current.phoneNumber,
//         sendMethod: persistentInvoiceInfoRef.current.sendMethod,
//         status: persistentInvoiceInfoRef.current.status,
//         containsClientName: result.containsClientName,
//         containsJobDescription: result.containsJobDescription,
//         containsAmount: result.containsAmount,
//         containsSalesTax: result.containsSalesTax,
//         containsType: result.containsType,
//         containsDate: result.containsDate,
//         containsPaymentTerms: result.containsPaymentTerms,
//         containsEmail: result.containsEmail,
//         containsPhoneNumber: result.containsPhoneNumber,
//       };

//       console.log("Parsed Invoice Info:", invoiceInfo);
//       return invoiceInfo;
//     } catch (error) {
//       console.error("Error parsing invoice details:", error);
//       return {
//         clientName: persistentInvoiceInfoRef.current.clientName,
//         jobDescription: persistentInvoiceInfoRef.current.jobDescription,
//         amount: persistentInvoiceInfoRef.current.amount,
//         salesTax: persistentInvoiceInfoRef.current.salesTax,
//         type: persistentInvoiceInfoRef.current.type,
//         date: persistentInvoiceInfoRef.current.date,
//         paymentTerms: persistentInvoiceInfoRef.current.paymentTerms,
//         email: persistentInvoiceInfoRef.current.email,
//         phoneNumber: persistentInvoiceInfoRef.current.phoneNumber,
//         sendMethod: persistentInvoiceInfoRef.current.sendMethod,
//         status: persistentInvoiceInfoRef.current.status,
//         containsClientName: false,
//         containsJobDescription: false,
//         containsAmount: false,
//         containsSalesTax: false,
//         containsType: false,
//         containsDate: false,
//         containsPaymentTerms: false,
//         containsEmail: false,
//         containsPhoneNumber: false,
//       };
//     }
//   };

//   const determineNextInvoiceQuestion = async (invoiceInfo: InvoiceInfo) => {
//     const { clientName, jobDescription, amount, sendMethod, email, phoneNumber } = invoiceInfo;
//     const language = conversationContext.language || "en-US";
//     const t = translations[language];

//     if (conversationContext.isModificationMode) {
//       return t.invoiceModifyPrompt;
//     }

//     const needsClientName = !clientName;
//     const needsJobDescription = !jobDescription;
//     const needsAmount = amount === null;
//     const needsSendMethod = !sendMethod;
//     const needsContactInfo = !email && !phoneNumber;

//     setConversationContext((prev) => ({
//       ...prev,
//       needsClientName,
//       needsJobDescription,
//       needsAmount,
//       needsSendMethod,
//       needsContactInfo,
//     }));

//     let nextField = "";

//     if (needsClientName) {
//       nextField = "clientName";
//     } else if (needsJobDescription) {
//       nextField = "jobDescription";
//     } else if (needsAmount) {
//       nextField = "amount";
//     } else if (needsContactInfo) {
//       nextField = "contactInfo";
//     } else if (needsSendMethod) {
//       nextField = "sendMethod";
//     }

//     if (nextField === conversationContext.lastAskedFor && conversationContext.processedInputs.length > 1) {
//       if (nextField === "clientName") {
//         nextField = jobDescription ? "amount" : "jobDescription";
//       } else if (nextField === "jobDescription") {
//         nextField = clientName ? "amount" : "clientName";
//       } else if (nextField === "amount") {
//         nextField = clientName ? "clientName" : "jobDescription";
//       } else if (nextField === "contactInfo") {
//         nextField = "sendMethod";
//       } else if (nextField === "sendMethod") {
//         nextField = "contactInfo";
//       }
//     }

//     let question = "";

//     if (nextField === "clientName") {
//       question = t.invoiceClientPrompt;
//       setConversationContext((prev) => ({ ...prev, lastAskedFor: "clientName" }));
//     } else if (nextField === "jobDescription") {
//       question = clientName ? t.invoiceJobPrompt(clientName) : t.invoiceJobPromptGeneric;
//       setConversationContext((prev) => ({ ...prev, lastAskedFor: "jobDescription" }));
//     } else if (nextField === "amount") {
//       question = clientName && jobDescription ? t.invoiceAmountPrompt(clientName, jobDescription) : t.invoiceAmountPromptGeneric;
//       setConversationContext((prev) => ({ ...prev, lastAskedFor: "amount" }));
//     } else if (nextField === "contactInfo") {
//       question = clientName ? t.invoiceContactPrompt(clientName) : t.invoiceContactPromptGeneric;
//       setConversationContext((prev) => ({ ...prev, lastAskedFor: "contactInfo" }));
//     } else if (nextField === "sendMethod") {
//       question = email && phoneNumber
//         ? t.invoiceSendMethodPrompt(clientName, email, phoneNumber)
//         : email
//           ? t.invoiceSendMethodEmail(clientName, email)
//           : t.invoiceSendMethodPhone(clientName, phoneNumber);
//       setConversationContext((prev) => ({ ...prev, lastAskedFor: "sendMethod" }));
//     } else {
//       return null;
//     }

//     return question;
//   };

//   return { parseInvoiceDetails, determineNextInvoiceQuestion };
// };














// import { ConversationContext, InvoiceInfo, persistentEventInfo, persistentInvoiceInfo } from "../types/types";

// export const conversation: ConversationContext = {
//     title: "",
//     date: null,
//     time: null,
//     timePeriod: null,
//     clientName: "",
//     jobDescription: "",
//     amount: null,
//     salesTax: null,
//     type: "quote",
//     invoiceDate: null,
//     paymentTerms: null,
//     email: null,
//     phoneNumber: null,
//     fullText: "",
//     needsTitle: false,
//     needsDate: false,
//     needsTime: false,
//     needsExactTime: false,
//     needsClientName: false,
//     needsJobDescription: false,
//     needsAmount: false,
//     needsSalesTax: false,
//     needsType: false,
//     needsInvoiceDate: false,
//     needsPaymentTerms: false,
//     needsEmail: false,
//     needsPhoneNumber: false,
//     needsApproval: false,
//     needsDeliveryMethod: false,
//     lastQuestion: "",
//     lastAskedFor: "",
//     processedInputs: [],
//     isComplete: false,
//     isInvoiceMode: false,
//     isModificationMode: false,
//     requestedChangeField: null,
// }

// export const invoiceDetail: InvoiceInfo = {
//     clientName: "",
//     jobDescription: "",
//     amount: null,
//     salesTax: null,
//     type: "quote",
//     date: null,
//     paymentTerms: null,
//     email: null,
//     phoneNumber: null,
//     sendMethod: null,
//     status: "Pending",
//     containsClientName: false,
//     containsJobDescription: false,
//     containsAmount: false,
//     containsSalesTax: false,
//     containsType: false,
//     containsDate: false,
//     containsPaymentTerms: false,
//     containsEmail: false,
//     containsPhoneNumber: false,
// }

// export const invoiceInfo: persistentInvoiceInfo = {
//     clientName: "",
//     jobDescription: "",
//     amount: null,
//     salesTax: null,
//     type: "quote",
//     date: null,
//     paymentTerms: null,
//     email: null,
//     phoneNumber: null,
//     sendMethod: null,
//     status: "Pending"
// }

// export const eventInfo: persistentEventInfo = {
//     title: "",
//     date: null,
//     time: null,
//     timePeriod: null
// }












// export interface EventInfo {
//     title: string;
//     date: Date | null;
//     time: string | null;
//     hasGeneralTimeOnly: boolean;
//     timePeriod: string | null;
//     isFreeSlotCheck: boolean;
//     containsTitle: boolean;
//     containsDate: boolean;
//     containsTime: boolean;
// }

// export interface ClientData {
//     clientName: string;
//     email?: string;
//     phoneNumber?: string;
// }

// export interface InvoiceInfo {
//     clientName: string;
//     jobDescription: string;
//     amount: number | null;
//     salesTax: number | null;
//     type: "invoice" | "quote" | null;
//     date: string | null;
//     paymentTerms: string | null;
//     email: string | null;
//     phoneNumber: string | null;
//     sendMethod: "email" | "sms" | null;
//     status: "Pending" | "Accepted" | null,
//     containsClientName: boolean;
//     containsJobDescription: boolean;
//     containsAmount: boolean;
//     containsSalesTax: boolean;
//     containsType: boolean;
//     containsDate: boolean;
//     containsPaymentTerms: boolean;
//     containsEmail: boolean;
//     containsPhoneNumber: boolean;
// }

// export interface ConversationContext {
//     title: string;
//     date: Date | null;
//     time: string | null;
//     timePeriod: string | null;
//     clientName: string;
//     jobDescription: string;
//     amount: number | null;
//     salesTax: number | null;
//     type: "invoice" | "quote" | null;
//     invoiceDate: string | null;
//     paymentTerms: string | null;
//     email: string | null;
//     phoneNumber: string | null;
//     sendMethod: "email" | "sms" | null;
//     fullText: string;
//     needsTitle: boolean;
//     needsDate: boolean;
//     needsTime: boolean;
//     needsExactTime: boolean;
//     needsClientName: boolean;
//     needsJobDescription: boolean;
//     needsAmount: boolean;
//     needsSendMethod: boolean;
//     needsContactInfo: boolean;
//     lastQuestion: string;
//     lastAskedFor: string;
//     processedInputs: string[];
//     isComplete: boolean;
//     isInvoiceMode: boolean;
//     isModificationMode: boolean; // Track if we're in modification mode
//     requestedChangeField: string | null;
// }


// export interface persistentEventInfo {
//     title: string;
//     date: Date | null;
//     time: string | null;
//     timePeriod: string | null;
// }

// export interface persistentInvoiceInfo {
//     clientName: string;
//     jobDescription: string;
//     amount: number | null;
//     salesTax: number | null;
//     type: "invoice" | "quote" | null;
//     date: string | null;
//     paymentTerms: string | null;
//     email: string | null;
//     phoneNumber: string | null;
//     sendMethod: "email" | "sms" | null;
//     status: "Pending" | "Accepted" | null;
// }







// import axios from "axios";
// import RNFS from "react-native-fs";
// import Sound from "react-native-sound";

// const GOOGLE_TTS_API_KEY = "AIzaSyBtRcA8BI5LvvgzV1jrQpsxrwXe7gbJ-lM";

// export const speak = async (text: string, language: "en-US" | "es-ES"): Promise<void> => {
//   console.log("Speaking:", text);
//   const voiceConfig = language === "es-ES" ? { languageCode: "es-ES", name: "es-ES-Wavenet-B" } : { languageCode: "en-US", name: "en-US-Wavenet-D" };
//   return new Promise((resolve, reject) => {
//     axios
//       .post(
//         `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
//         {
//           input: { text: text },
//           voice: voiceConfig,
//           audioConfig: { audioEncoding: "MP3" },
//         }
//       )
//       .then(async (response) => {
//         const audioContent = response.data.audioContent;
//         const filePath = `${RNFS.DocumentDirectoryPath}/speech.mp3`;
//         await RNFS.writeFile(filePath, audioContent, "base64");
//         const sound = new Sound(filePath, "", (error) => {
//           if (error) reject(error);
//           sound.play((success) => {
//             sound.release();
//             resolve();
//           });
//         });
//       })
//       .catch(reject);
//   });
// };















