import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, Alert, Text, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import LottieView from "lottie-react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import Voice from "@react-native-voice/voice";
import Sound from "react-native-sound";
import { COLORS, SCREENS, API } from "../../constants/constants";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import styles from "./MainScreen.styles";
import GoogleAuthService from "../../utility/GoogleAuth/googleAuthService";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logout } from "../../redux/app/appAction";
import { ConversationContext, InvoiceInfo, ClientData, persistentInvoiceInfo, persistentEventInfo } from "./types/types";
import { conversation, eventInfo, invoiceDetail, invoiceInfo } from "./states/initialStates";
import { googleAuthService } from "../../utility/GoogleCalendar/googleAuthentication";
import { getOpenAIResponse } from "../../utility/OpenAi/openAiUtils";
import { InvoiceUtils } from "./utilities/InvoiceDetails/invoiceUtils";
import { EventUtils } from "./utilities/EventsDetails/eventUtils";
import { speak } from "../../utility/GoogleVoice/googleVoice";
import { requestMicPermission } from "../../utility/Permission/permissionServices";
import ModalComponent from "./components/ModalComponent";
import { translations } from "../../language/translation";

Sound.setCategory("Playback");

const MainScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();
    const googleCalendarToken = useAppSelector((state) => state.appState.googleCalendarToken);
    const user = useAppSelector((state) => state.appState.user);
    const userId = user?.id || null;
    console.log("User:", userId);
    const [modalType, setModalType] = useState<"eventConfirmation" | "invoiceConfirmation" | "quoteConfirmation" | "convertQuote" | "manualEntry" | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [spokenText, setSpokenText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [selectedMode, setSelectedMode] = useState<"manual" | "auto" | "invoice" | "quote" | "">("");
    const [language, setLanguage] = useState<"en-US" | "es-ES">("en-US");
    const [eventTitle, setEventTitle] = useState("");
    const [parsedDate, setParsedDate] = useState<Date | null>(null);
    const [voiceMode, setVoiceMode] = useState<"init" | "response" | "confirm" | "convertQuote">("init");
    const [hasMicPermission, setHasMicPermission] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [quotes, setQuotes] = useState<{ id: number; clientName: string; pdfUrl: string; createdAt: Date; status: string; jobDescription: string; email: string; type: string }[]>([]);
    const MAX_RETRIES = 9;
    const isVoiceStartingRef = useRef(false);
    const [invoiceDetails, setInvoiceDetails] = useState<InvoiceInfo>(invoiceDetail);
    const persistentEventInfoRef = useRef<persistentEventInfo>(eventInfo);
    const persistentInvoiceInfoRef = useRef<persistentInvoiceInfo>(invoiceInfo);
    const [conversationContext, setConversationContext] = useState<ConversationContext>({
        ...conversation,
        language,
    });
    const t = translations[language];
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);

    const openSettingsModal = () => setSettingsModalVisible(true);
    const closeSettingsModal = () => setSettingsModalVisible(false);
    const { determineNextInvoiceQuestion, parseInvoiceDetails } = InvoiceUtils();
    const { determineNextQuestion, parseEventDetails } = EventUtils();
    const { validateAndRefreshToken, handleGoogleCalendarAuth } = googleAuthService();

    useFocusEffect(
        useCallback(() => {
            const checkAuthAndToken = async () => {
                const authenticated = await GoogleAuthService.isAuthenticated();
                setIsAuthenticated(authenticated);
                if (authenticated && googleCalendarToken) await validateAndRefreshToken(googleCalendarToken, setIsAuthenticated);
            };
            checkAuthAndToken();
        }, [googleCalendarToken])
    );

    useEffect(() => {
        if (!googleCalendarToken || !isAuthenticated) return;
        const interval = setInterval(() => validateAndRefreshToken(googleCalendarToken, setIsAuthenticated), 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [googleCalendarToken, isAuthenticated]);

    useEffect(() => {
        const initialize = async () => {
            await requestMicPermission(setHasMicPermission);
            Voice.onSpeechStart = () => {
                setIsListening(true);
                isVoiceStartingRef.current = false;
            };
            Voice.onSpeechEnd = () => {
                setIsListening(false);
                isVoiceStartingRef.current = false;
            };
            Voice.onSpeechResults = (e) => {
                setRetryCount(0);
                handleSpeechResults(e.value[0]);
            };
            Voice.onSpeechError = (e) => {
                setIsListening(false);
                isVoiceStartingRef.current = false;
                if (e.error?.code !== "5" && e.error?.code !== "7") {
                    if (retryCount < MAX_RETRIES) {
                        setRetryCount((prev) => prev + 1);
                        speak(t.voiceError, language).then(startVoiceListener);
                    } else {
                        speak(t.tooManyRetries, language).then(() => {
                            setVoiceMode("init");
                            setRetryCount(0);
                            Voice.stop();
                        });
                    }
                }
            };
            return () => Voice.destroy().then(Voice.removeAllListeners);
        };
        initialize();
    }, [voiceMode, selectedMode, hasMicPermission, retryCount, language]);

    const startVoiceListener = async () => {
        if (!hasMicPermission || isListening || isVoiceStartingRef.current) return;
        try {
            isVoiceStartingRef.current = true;
            await Voice.stop();
            await Voice.start(language);
        } catch (error: any) {
            isVoiceStartingRef.current = false;
            if (error.code !== "5" && error.code !== "7") {
                speak(t.voiceStartError, language);
            }
        }
    };

    const fetchEventsByDate = async (date: Date) => {
        if (!googleCalendarToken) throw new Error("Not authenticated");
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const url = `${API.BASE_URL2}/calendar/event/primary?time=${startOfDay.toISOString()}`;
        const response = await fetch(url, {
            method: "GET",
            headers: { Authorization: `Bearer ${googleCalendarToken}`, "Content-Type": "application/json" },
        });
        const events = await response.json();
        if (!response.ok) throw new Error(events.error || "Failed to fetch events");
        return events.filter((event: any) => {
            const eventStart = new Date(event.start.dateTime || event.start.date);
            return eventStart >= startOfDay && eventStart <= endOfDay;
        });
    };

    const fetchQuotes = async () => {
        if (!googleCalendarToken || !userId) return [];
        try {
            const url = `${API.BASE_URL2}/invoices/quotes?userId=${userId}`;
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${googleCalendarToken}`,
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();

            console.log(data);

            if (response.ok) {
                setQuotes(data);
                return data;
            } else {
                throw new Error(data.error || "Failed to fetch quotes");
            }
        } catch (error) {
            console.error("Error fetching quotes:", error);
            return [];
        }
    };

    const fetchQuoteById = async (quoteId: number) => {
        if (!googleCalendarToken || !userId) return null;
        try {
            const url = `${API.BASE_URL2}/invoices/quotes?userId=${userId}`;
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${googleCalendarToken}`,
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            if (response.ok) {
                return data.find((q: any) => q.id === quoteId) || null;
            }
            throw new Error(data.error || "Failed to fetch quote");
        } catch (error) {
            console.error("Error fetching quote by ID:", error);
            return null;
        }
    };

    const convertQuoteToInvoice = async (amount: number | null) => {
        if (!conversationContext.selectedQuoteId || !userId) return;
        setIsProcessing(true);
        try {
            const url = `${API.BASE_URL2}/invoices/convert-quote`;
            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${googleCalendarToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    quoteId: conversationContext.selectedQuoteId,
                    userId,
                    invoiceNumber: conversationContext.selectedQuoteId.toString(),
                    amount,
                }),
            });
            const responseData = await response.json();
            if (response.ok) {
                setInvoiceDetails({
                    ...invoiceDetails,
                    type: "invoice",
                    status: "Draft",
                    amount: amount,
                    jobDescription: `${invoiceDetails.jobDescription || ""} (Invoice #${conversationContext.selectedQuoteId})`,
                });
                setModalType("invoiceConfirmation");
                setConversationContext((prev) => ({
                    ...prev,
                    isQuoteMode: false,
                    isConvertQuoteMode: false,
                    isComplete: true,
                    selectedQuoteId: null,
                }));
                await speak(t.invoiceConfirm, language);
            } else {
                throw new Error(responseData.error || "Failed to convert quote");
            }
        } catch (error) {
            console.error("Error converting quote:", error);
            await speak(t.failInvoice, language).then(() => {
                setVoiceMode("response");
                setModalType(null);
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleModeChange = (mode: "manual" | "auto" | "invoice" | "quote" | "") => {
        setSelectedMode(mode);
        setRetryCount(0);
        setConversationContext({ ...conversation, language });
        persistentEventInfoRef.current = eventInfo;
        persistentInvoiceInfoRef.current = invoiceInfo;

        if (mode === "auto") {
            setVoiceMode("init");
            getOpenAIResponse("", `Generate a friendly greeting in ${language === "es-ES" ? "Spanish" : "English"} asking how I can assist with calendar events today.`).then(
                (greeting) => speak(greeting, language).then(startVoiceListener)
            );
        } else if (mode === "invoice") {
            setVoiceMode("init");
            setConversationContext((prev) => ({ ...prev, isInvoiceMode: true, language }));
            getOpenAIResponse("", `Generate a friendly greeting in ${language === "es-ES" ? "Spanish" : "English"} asking how I can assist with creating an invoice.`).then(
                (greeting) => speak(greeting, language).then(startVoiceListener)
            );
        } else if (mode === "quote") {
            setVoiceMode("init");
            setConversationContext((prev) => ({ ...prev, isInvoiceMode: true, isQuoteMode: true, type: "quote", language }));
            getOpenAIResponse("", `Generate a friendly greeting in ${language === "es-ES" ? "Spanish" : "English"} asking how I can assist with creating a quote.`).then(
                (greeting) => speak(greeting, language).then(startVoiceListener)
            );
        } else {
            setVoiceMode("init");
            Voice.stop();
        }
    };

    const handleLanguageChange = (lang: "en-US" | "es-ES") => {
        setLanguage(lang);
        setConversationContext((prev) => ({ ...prev, language: lang }));
        const langName = lang === "es-ES" ? t.spanish : t.english;
        speak(t.languageChange(langName), lang);
    };

    const checkClientInBackend = async (clientName: string): Promise<ClientData | null> => {
        try {
            const encodedClientName = encodeURIComponent(clientName);
            const url = `${API.BASE_URL2}/invoices/client-info?userId=${userId}&clientName=${encodedClientName}`;
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${googleCalendarToken}`,
                },
            });
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error("Error checking client:", error);
            return null;
        }
    };

    const handleConvertQuote = () => {
        setModalType("convertQuote");
        setConversationContext((prev) => ({
            ...prev,
            isConvertQuoteMode: true,
            lastAskedFor: "quoteNumber",
        }));
        setVoiceMode("convertQuote");
        speak("Please provide the quote number, like ID number 3.", language).then(startVoiceListener);
    };

    const handleSpeechResults = async (text: string) => {
        setSpokenText(text);
        const cancelWords = language === "es-ES" ? ["cancelar", "para"] : ["cancel", "stop"];
        if (cancelWords.some((word) => text.toLowerCase().includes(word))) {
            resetConversation();
            await speak(t.voiceCancel, language).then(() => Voice.stop());
            return;
        }

        setIsProcessing(true);

        try {
            if (conversationContext.isInvoiceMode && !conversationContext.isQuoteMode && !conversationContext.isConvertQuoteMode) {
                const invoiceInfo = await parseInvoiceDetails(text);
                console.log("Invoice Info:", invoiceInfo);

                const completeInvoiceInfo = {
                    clientName: invoiceInfo.clientName || persistentInvoiceInfoRef.current.clientName,
                    jobDescription: invoiceInfo.jobDescription || persistentInvoiceInfoRef.current.jobDescription,
                    amount: invoiceInfo.amount !== null ? invoiceInfo.amount : persistentInvoiceInfoRef.current.amount,
                    salesTax: invoiceInfo.salesTax !== null ? invoiceInfo.salesTax : persistentInvoiceInfoRef.current.salesTax,
                    type: invoiceInfo.type || persistentInvoiceInfoRef.current.type,
                    date: invoiceInfo.date || persistentInvoiceInfoRef.current.date,
                    paymentTerms: invoiceInfo.paymentTerms || persistentInvoiceInfoRef.current.paymentTerms,
                    email: invoiceInfo.email || persistentInvoiceInfoRef.current.email,
                    phoneNumber: invoiceInfo.phoneNumber || persistentInvoiceInfoRef.current.phoneNumber,
                    sendMethod: invoiceInfo.sendMethod || persistentInvoiceInfoRef.current.sendMethod,
                    status: invoiceInfo.status || persistentInvoiceInfoRef.current.status,
                };

                const hasCoreInfo = completeInvoiceInfo.clientName && completeInvoiceInfo.jobDescription && (completeInvoiceInfo.type === "quote" || completeInvoiceInfo.amount !== null);

                if (conversationContext.isModificationMode) {
                    const confirmWords = language === "es-ES" ? ["confirmar", "está bien", "correcto"] : ["confirm", "looks good", "that's fine"];
                    if (confirmWords.some((word) => text.toLowerCase().includes(word))) {
                        setInvoiceDetails({
                            clientName: completeInvoiceInfo.clientName,
                            jobDescription: completeInvoiceInfo.jobDescription,
                            amount: completeInvoiceInfo.amount,
                            salesTax: completeInvoiceInfo.salesTax,
                            type: completeInvoiceInfo.type,
                            date: completeInvoiceInfo.date,
                            paymentTerms: completeInvoiceInfo.paymentTerms,
                            email: completeInvoiceInfo.email,
                            phoneNumber: completeInvoiceInfo.phoneNumber,
                            sendMethod: completeInvoiceInfo.sendMethod,
                            status: completeInvoiceInfo.status,
                            containsClientName: invoiceInfo.containsClientName,
                            containsJobDescription: invoiceInfo.containsJobDescription,
                            containsAmount: invoiceInfo.containsAmount,
                            containsSalesTax: invoiceInfo.containsSalesTax,
                            containsType: invoiceInfo.containsType,
                            containsDate: invoiceInfo.containsDate,
                            containsPaymentTerms: invoiceInfo.containsPaymentTerms,
                            containsEmail: invoiceInfo.containsEmail,
                            containsPhoneNumber: invoiceInfo.containsPhoneNumber,
                        });
                        setModalType(completeInvoiceInfo.type === "quote" ? "quoteConfirmation" : "invoiceConfirmation");
                        setConversationContext((prev) => ({
                            ...prev,
                            isModificationMode: false,
                            requestedChangeField: null,
                            isComplete: true,
                        }));
                        await speak(t.invoiceConfirm, language);
                    } else if (
                        invoiceInfo.containsClientName ||
                        invoiceInfo.containsJobDescription ||
                        invoiceInfo.containsAmount ||
                        invoiceInfo.containsSalesTax ||
                        invoiceInfo.containsType ||
                        invoiceInfo.containsDate ||
                        invoiceInfo.containsPaymentTerms ||
                        invoiceInfo.containsEmail ||
                        invoiceInfo.containsPhoneNumber ||
                        invoiceInfo.containsSendMethod
                    ) {
                        setInvoiceDetails({
                            clientName: completeInvoiceInfo.clientName,
                            jobDescription: completeInvoiceInfo.jobDescription,
                            amount: completeInvoiceInfo.amount,
                            salesTax: completeInvoiceInfo.salesTax,
                            type: completeInvoiceInfo.type,
                            date: completeInvoiceInfo.date,
                            paymentTerms: completeInvoiceInfo.paymentTerms,
                            email: completeInvoiceInfo.email,
                            phoneNumber: completeInvoiceInfo.phoneNumber,
                            sendMethod: completeInvoiceInfo.sendMethod,
                            status: completeInvoiceInfo.status,
                            containsClientName: invoiceInfo.containsClientName,
                            containsJobDescription: invoiceInfo.containsJobDescription,
                            containsAmount: invoiceInfo.containsAmount,
                            containsSalesTax: invoiceInfo.containsSalesTax,
                            containsType: invoiceInfo.containsType,
                            containsDate: invoiceInfo.containsDate,
                            containsPaymentTerms: invoiceInfo.containsPaymentTerms,
                            containsEmail: invoiceInfo.containsEmail,
                            containsPhoneNumber: invoiceInfo.containsPhoneNumber,
                        });
                        setModalType(completeInvoiceInfo.type === "quote" ? "quoteConfirmation" : "invoiceConfirmation");
                        setConversationContext((prev) => ({
                            ...prev,
                            isModificationMode: false,
                            requestedChangeField: null,
                            isComplete: true,
                        }));
                        await speak(t.invoiceUpdateConfirm, language);
                    } else {
                        const nextQuestion = await determineNextInvoiceQuestion(completeInvoiceInfo);
                        if (nextQuestion) {
                            await speak(nextQuestion, language).then(startVoiceListener);
                            setConversationContext((prev) => ({ ...prev, lastQuestion: nextQuestion }));
                            setVoiceMode("response");
                        }
                    }
                } else if (hasCoreInfo && !completeInvoiceInfo.sendMethod) {
                    if (completeInvoiceInfo.email || completeInvoiceInfo.phoneNumber) {
                        const question = completeInvoiceInfo.email && completeInvoiceInfo.phoneNumber
                            ? t.invoiceSendMethodPrompt(completeInvoiceInfo.clientName, completeInvoiceInfo.email, completeInvoiceInfo.phoneNumber)
                            : completeInvoiceInfo.email
                                ? t.invoiceSendMethodEmail(completeInvoiceInfo.clientName, completeInvoiceInfo.email)
                                : t.invoiceSendMethodPhone(completeInvoiceInfo.clientName, completeInvoiceInfo.phoneNumber);
                        await speak(question, language).then(startVoiceListener);
                        setConversationContext((prev) => ({
                            ...prev,
                            lastAskedFor: "sendMethod",
                            needsSendMethod: true,
                        }));
                        setVoiceMode("response");
                    } else {
                        const question = completeInvoiceInfo.clientName
                            ? t.invoiceContactPrompt(completeInvoiceInfo.clientName)
                            : t.invoiceContactPromptGeneric;
                        await speak(question, language).then(startVoiceListener);
                        setConversationContext((prev) => ({
                            ...prev,
                            lastAskedFor: "contactInfo",
                            needsContactInfo: true,
                        }));
                        setVoiceMode("response");
                    }
                } else if (hasCoreInfo && completeInvoiceInfo.sendMethod) {
                    setInvoiceDetails({
                        clientName: completeInvoiceInfo.clientName,
                        jobDescription: completeInvoiceInfo.jobDescription,
                        amount: completeInvoiceInfo.amount,
                        salesTax: completeInvoiceInfo.salesTax,
                        type: completeInvoiceInfo.type,
                        date: completeInvoiceInfo.date,
                        paymentTerms: completeInvoiceInfo.paymentTerms,
                        email: completeInvoiceInfo.email,
                        phoneNumber: completeInvoiceInfo.phoneNumber,
                        sendMethod: completeInvoiceInfo.sendMethod,
                        status: completeInvoiceInfo.status,
                        containsClientName: invoiceInfo.containsClientName,
                        containsJobDescription: invoiceInfo.containsJobDescription,
                        containsAmount: invoiceInfo.containsAmount,
                        containsSalesTax: invoiceInfo.containsSalesTax,
                        containsType: invoiceInfo.containsType,
                        containsDate: invoiceInfo.containsDate,
                        containsPaymentTerms: invoiceInfo.containsPaymentTerms,
                        containsEmail: invoiceInfo.containsEmail,
                        containsPhoneNumber: invoiceInfo.containsPhoneNumber,
                    });
                    setModalType(completeInvoiceInfo.type === "quote" ? "quoteConfirmation" : "invoiceConfirmation");
                    await speak(t.invoiceConfirm, language);
                    setConversationContext((prev) => ({ ...prev, isComplete: true }));
                } else {
                    const nextQuestion = await determineNextInvoiceQuestion(completeInvoiceInfo);
                    if (nextQuestion) {
                        await speak(nextQuestion, language).then(startVoiceListener);
                        setConversationContext((prev) => ({ ...prev, lastQuestion: nextQuestion }));
                        setVoiceMode("response");
                    } else if (!completeInvoiceInfo.clientName) {
                        await speak(t.invoiceClientPrompt, language).then(startVoiceListener);
                        setConversationContext((prev) => ({ ...prev, lastAskedFor: "clientName" }));
                        setVoiceMode("response");
                    } else if (!completeInvoiceInfo.jobDescription) {
                        const question = completeInvoiceInfo.clientName
                            ? t.invoiceJobPrompt(completeInvoiceInfo.clientName)
                            : t.invoiceJobPromptGeneric;
                        await speak(question, language).then(startVoiceListener);
                        setConversationContext((prev) => ({ ...prev, lastAskedFor: "jobDescription" }));
                        setVoiceMode("response");
                    } else if (completeInvoiceInfo.type === "invoice" && completeInvoiceInfo.amount === null) {
                        const question = completeInvoiceInfo.clientName && completeInvoiceInfo.jobDescription
                            ? t.invoiceAmountPrompt(completeInvoiceInfo.clientName, completeInvoiceInfo.jobDescription)
                            : t.invoiceAmountPromptGeneric;
                        await speak(question, language).then(startVoiceListener);
                        setConversationContext((prev) => ({ ...prev, lastAskedFor: "amount" }));
                        setVoiceMode("response");
                    } else {
                        await speak(t.invoiceMissingInfo, language).then(startVoiceListener);
                        setVoiceMode("response");
                    }
                }
            } else if (conversationContext.isQuoteMode && !conversationContext.isConvertQuoteMode) {
                const newInvoiceWords = language === "es-ES" ? ["nueva factura", "crear factura"] : ["new invoice", "create invoice"];
                if (newInvoiceWords.some((word) => text.toLowerCase().includes(word))) {
                    setConversationContext((prev) => ({ ...prev, isQuoteMode: false }));
                    handleModeChange("invoice");
                    return;
                }
                // Handle quote creation
                const invoiceInfo = await parseInvoiceDetails(text);
                console.log("Quote Info:", invoiceInfo);

                const completeInvoiceInfo = {
                    clientName: invoiceInfo.clientName || persistentInvoiceInfoRef.current.clientName,
                    jobDescription: invoiceInfo.jobDescription || persistentInvoiceInfoRef.current.jobDescription,
                    amount: invoiceInfo.amount !== null ? invoiceInfo.amount : persistentInvoiceInfoRef.current.amount,
                    salesTax: invoiceInfo.salesTax !== null ? invoiceInfo.salesTax : persistentInvoiceInfoRef.current.salesTax,
                    type: invoiceInfo.type || "quote",
                    date: invoiceInfo.date || persistentInvoiceInfoRef.current.date,
                    paymentTerms: invoiceInfo.paymentTerms || persistentInvoiceInfoRef.current.paymentTerms,
                    email: invoiceInfo.email || persistentInvoiceInfoRef.current.email,
                    phoneNumber: invoiceInfo.phoneNumber || persistentInvoiceInfoRef.current.phoneNumber,
                    sendMethod: invoiceInfo.sendMethod || persistentInvoiceInfoRef.current.sendMethod,
                    status: invoiceInfo.status || "Pending",
                };

                const hasCoreInfo = completeInvoiceInfo.clientName && completeInvoiceInfo.jobDescription;

                if (hasCoreInfo && !completeInvoiceInfo.sendMethod) {
                    if (completeInvoiceInfo.email || completeInvoiceInfo.phoneNumber) {
                        const question = completeInvoiceInfo.email && completeInvoiceInfo.phoneNumber
                            ? t.invoiceSendMethodPrompt(completeInvoiceInfo.clientName, completeInvoiceInfo.email, completeInvoiceInfo.phoneNumber)
                            : completeInvoiceInfo.email
                                ? t.invoiceSendMethodEmail(completeInvoiceInfo.clientName, completeInvoiceInfo.email)
                                : t.invoiceSendMethodPhone(completeInvoiceInfo.clientName, completeInvoiceInfo.phoneNumber);
                        await speak(question, language).then(startVoiceListener);
                        setConversationContext((prev) => ({
                            ...prev,
                            lastAskedFor: "sendMethod",
                            needsSendMethod: true,
                        }));
                        setVoiceMode("response");
                    } else {
                        const question = completeInvoiceInfo.clientName
                            ? t.invoiceContactPrompt(completeInvoiceInfo.clientName)
                            : t.invoiceContactPromptGeneric;
                        await speak(question, language).then(startVoiceListener);
                        setConversationContext((prev) => ({
                            ...prev,
                            lastAskedFor: "contactInfo",
                            needsContactInfo: true,
                        }));
                        setVoiceMode("response");
                    }
                } else if (hasCoreInfo && completeInvoiceInfo.sendMethod) {
                    setInvoiceDetails({
                        clientName: completeInvoiceInfo.clientName,
                        jobDescription: completeInvoiceInfo.jobDescription,
                        amount: completeInvoiceInfo.amount,
                        salesTax: completeInvoiceInfo.salesTax,
                        type: completeInvoiceInfo.type,
                        date: completeInvoiceInfo.date,
                        paymentTerms: completeInvoiceInfo.paymentTerms,
                        email: completeInvoiceInfo.email,
                        phoneNumber: completeInvoiceInfo.phoneNumber,
                        sendMethod: completeInvoiceInfo.sendMethod,
                        status: completeInvoiceInfo.status,
                        containsClientName: invoiceInfo.containsClientName,
                        containsJobDescription: invoiceInfo.containsJobDescription,
                        containsAmount: invoiceInfo.containsAmount,
                        containsSalesTax: invoiceInfo.containsSalesTax,
                        containsType: invoiceInfo.containsType,
                        containsDate: invoiceInfo.containsDate,
                        containsPaymentTerms: invoiceInfo.containsPaymentTerms,
                        containsEmail: invoiceInfo.containsEmail,
                        containsPhoneNumber: invoiceInfo.containsPhoneNumber,
                    });
                    setModalType("quoteConfirmation");
                    await speak(t.quoteConfirm("", completeInvoiceInfo.clientName), language);
                    setConversationContext((prev) => ({ ...prev, isComplete: true }));
                } else {
                    const nextQuestion = await determineNextInvoiceQuestion(completeInvoiceInfo);
                    if (nextQuestion) {
                        await speak(nextQuestion, language).then(startVoiceListener);
                        setConversationContext((prev) => ({ ...prev, lastQuestion: nextQuestion }));
                        setVoiceMode("response");
                    } else if (!completeInvoiceInfo.clientName) {
                        await speak(t.invoiceClientPrompt, language).then(startVoiceListener);
                        setConversationContext((prev) => ({ ...prev, lastAskedFor: "clientName" }));
                        setVoiceMode("response");
                    } else if (!completeInvoiceInfo.jobDescription) {
                        const question = completeInvoiceInfo.clientName
                            ? t.invoiceJobPrompt(completeInvoiceInfo.clientName)
                            : t.invoiceJobPromptGeneric;
                        await speak(question, language).then(startVoiceListener);
                        setConversationContext((prev) => ({ ...prev, lastAskedFor: "jobDescription" }));
                        setVoiceMode("response");
                    } else {
                        await speak(t.invoiceMissingInfo, language).then(startVoiceListener);
                        setVoiceMode("response");
                    }
                }
            } else if (conversationContext.isConvertQuoteMode) {
                // Handle quote conversion
                const invoiceNumberMatch = text.match(/#(\d+)/) || text.match(/id number (\d+)/i) || text.match(/number (\d+)/i);
                const invoiceNumber = invoiceNumberMatch ? parseInt(invoiceNumberMatch[1]) : null;

                if (voiceMode === "convertQuote" && invoiceNumber) {
                    const quote = await fetchQuoteById(invoiceNumber);
                    if (quote) {
                        setInvoiceDetails({
                            clientName: quote.clientName,
                            jobDescription: quote.jobDescription,
                            amount: null,
                            salesTax: quote.salesTax || null,
                            type: "invoice",
                            date: new Date().toISOString(),
                            paymentTerms: quote.paymentTerms || "Due upon receipt",
                            email: quote.email || null,
                            phoneNumber: quote.phoneNumber || null,
                            sendMethod: quote.sendMethod || null,
                            status: "Draft",
                            containsClientName: true,
                            containsJobDescription: true,
                            containsAmount: false,
                            containsSalesTax: !!quote.salesTax,
                            containsType: true,
                            containsDate: true,
                            containsPaymentTerms: !!quote.paymentTerms,
                            containsEmail: !!quote.email,
                            containsPhoneNumber: !!quote.phoneNumber,
                        });
                        persistentInvoiceInfoRef.current = {
                            clientName: quote.clientName,
                            jobDescription: quote.jobDescription,
                            amount: null,
                            salesTax: quote.salesTax || null,
                            type: "invoice",
                            date: new Date().toISOString(),
                            paymentTerms: quote.paymentTerms || "Due upon receipt",
                            email: quote.email || null,
                            phoneNumber: quote.phoneNumber || null,
                            sendMethod: quote.sendMethod || null,
                            status: "Draft",
                        };
                        setConversationContext((prev) => ({
                            ...prev,
                            clientName: quote.clientName,
                            jobDescription: quote.jobDescription,
                            type: "invoice",
                            invoiceDate: new Date().toISOString(),
                            paymentTerms: quote.paymentTerms || "Due upon receipt",
                            email: quote.email || null,
                            phoneNumber: quote.phoneNumber || null,
                            sendMethod: quote.sendMethod || null,
                            status: "Draft",
                            needsClientName: false,
                            needsJobDescription: false,
                            needsAmount: true,
                            needsContactInfo: !quote.email && !quote.phoneNumber,
                            needsSendMethod: !quote.sendMethod,
                            selectedQuoteId: quote.id,
                            lastAskedFor: "amount",
                        }));
                        setModalType("convertQuote");
                        await speak(`Quote ${invoiceNumber} found for ${quote.clientName}. Please provide the invoice amount.`, language).then(startVoiceListener);
                        setVoiceMode("response");
                    } else {
                        await speak(`Quote number ${invoiceNumber} not found. Please provide a valid quote number, like ID number 3.`, language).then(startVoiceListener);
                        setConversationContext((prev) => ({
                            ...prev,
                            lastAskedFor: "quoteNumber",
                        }));
                        setVoiceMode("convertQuote");
                    }
                } else if (voiceMode === "response" && conversationContext.lastAskedFor === "amount") {
                    // Try parsing the amount with parseInvoiceDetails
                    const invoiceInfo = await parseInvoiceDetails(text);
                    let amount = invoiceInfo.containsAmount && invoiceInfo.amount !== null ? invoiceInfo.amount : null;

                    // Fallback: Directly parse numeric input if parseInvoiceDetails fails
                    if (!amount) {
                        const numericMatch = text.match(/^\d+$/); // Match pure numbers like "1"
                        amount = numericMatch ? parseFloat(numericMatch[0]) : null;
                    }

                    if (amount !== null) {
                        // Update invoiceDetails with the provided amount and set status to Draft
                        setInvoiceDetails((prev) => ({
                            ...prev,
                            amount,
                            status: "Draft",
                            containsAmount: true,
                        }));
                        persistentInvoiceInfoRef.current = {
                            ...persistentInvoiceInfoRef.current,
                            amount,
                            status: "Draft",
                        };
                        setConversationContext((prev) => ({
                            ...prev,
                            needsAmount: false,
                            isComplete: true,
                            lastAskedFor: null,
                        }));
                        setModalType("convertQuote"); // Keep modal open with updated details
                        await speak(`Amount set to $${amount}. Please confirm the invoice details.`, language);
                        setVoiceMode("confirm");
                    } else {
                        await speak(`Please provide a valid invoice amount for ${invoiceDetails.clientName}, such as a number like 100.`, language).then(startVoiceListener);
                        setVoiceMode("response");
                    }
                } else {
                    // Try parsing the amount with parseInvoiceDetails
                    const invoiceInfo = await parseInvoiceDetails(text);
                    let amount = invoiceInfo.containsAmount && invoiceInfo.amount !== null ? invoiceInfo.amount : null;

                    // Fallback: Directly parse numeric input if parseInvoiceDetails fails
                    if (!amount) {
                        const numericMatch = text.match(/^\d+$/); // Match pure numbers like "1"
                        amount = numericMatch ? parseFloat(numericMatch[0]) : null;
                    }

                    if (amount !== null) {
                        // Update invoiceDetails with the provided amount and set status to Draft
                        setInvoiceDetails((prev) => ({
                            ...prev,
                            amount,
                            status: "Draft",
                            containsAmount: true,
                        }));
                        persistentInvoiceInfoRef.current = {
                            ...persistentInvoiceInfoRef.current,
                            amount,
                            status: "Draft",
                        };
                        setConversationContext((prev) => ({
                            ...prev,
                            needsAmount: false,
                            isComplete: true,
                            lastAskedFor: null,
                        }));
                        setModalType("convertQuote"); // Keep modal open with updated details
                        await speak(`Amount set to $${amount}. Please confirm the invoice details.`, language);
                        setVoiceMode("confirm");
                    } else {
                        await speak(`Please provide a valid invoice amount for ${invoiceDetails.clientName}, such as a number like 100.`, language).then(startVoiceListener);
                        setVoiceMode("response");
                    }
                }
            } else {
                const eventInfo = await parseEventDetails(text);
                console.log(eventInfo);

                const completeEventInfo = {
                    title: eventInfo.title || persistentEventInfoRef.current.title,
                    date: eventInfo.date || persistentEventInfoRef.current.date,
                    time: eventInfo.time || persistentEventInfoRef.current.time,
                    timePeriod: eventInfo.timePeriod || persistentEventInfoRef.current.timePeriod,
                };

                if (eventInfo.isFreeSlotCheck && eventInfo.date) {
                    const events = await fetchEventsByDate(eventInfo.date);
                    const message = events.length > 0
                        ? t.eventBusySlot(eventInfo.date.toDateString(), events.map((e: any) => e.summary).join(", "))
                        : t.eventFreeSlot(eventInfo.date.toDateString());
                    await speak(message, language).then(startVoiceListener);
                    setParsedDate(eventInfo.date);
                    setVoiceMode("response");
                    setIsProcessing(false);
                    return;
                }

                if (eventInfo.timePeriod && !eventInfo.time && !conversationContext.needsTitle && !conversationContext.needsDate) {
                    const timeQuestion = eventInfo.title
                        ? t.eventTimePrompt(eventInfo.title, eventInfo.date?.toDateString(), eventInfo.timePeriod)
                        : t.eventTimePromptGeneric(eventInfo.date?.toDateString(), eventInfo.timePeriod);
                    await speak(timeQuestion, language).then(startVoiceListener);
                    setConversationContext((prev) => ({
                        ...prev,
                        lastAskedFor: "time",
                        needsExactTime: true,
                    }));
                    setVoiceMode("response");
                    setIsProcessing(false);
                    return;
                }

                const hasCompleteInfo =
                    completeEventInfo.title &&
                    completeEventInfo.date &&
                    (completeEventInfo.time ||
                        (completeEventInfo.date.getHours() !== 0 && completeEventInfo.date.getMinutes() !== 0));

                console.log("Complete event check:", {
                    hasTitle: !!completeEventInfo.title,
                    hasDate: !!completeEventInfo.date,
                    hasTime: !!completeEventInfo.time || (completeEventInfo.date && completeEventInfo.date.getHours() !== 0),
                    hasCompleteInfo,
                });

                if (hasCompleteInfo) {
                    const events = await fetchEventsByDate(completeEventInfo.date);
                    const timeSlotTaken = events.some((e: any) => {
                        const eventStart = new Date(e.start.dateTime || e.start.date);
                        const eventEnd = new Date(e.end.dateTime || e.end.date);
                        return completeEventInfo.date >= eventStart && completeEventInfo.date <= eventEnd;
                    });

                    if (timeSlotTaken) {
                        await speak(t.eventSlotTaken(completeEventInfo.title), language).then(startVoiceListener);
                        setConversationContext((prev) => ({ ...prev, lastAskedFor: "time" }));
                        setVoiceMode("response");
                    } else {
                        setEventTitle(completeEventInfo.title);
                        setParsedDate(completeEventInfo.date);
                        setModalType("eventConfirmation");
                        await speak(
                            t.eventConfirm(
                                completeEventInfo.title,
                                completeEventInfo.date.toDateString(),
                                completeEventInfo.date?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
                            ),
                            language
                        );
                        setConversationContext((prev) => ({ ...prev, isComplete: true }));
                    }
                } else {
                    const nextQuestion = await determineNextQuestion(completeEventInfo);
                    if (nextQuestion) {
                        await speak(nextQuestion, language).then(startVoiceListener);
                        setConversationContext((prev) => ({ ...prev, lastQuestion: nextQuestion }));
                        setVoiceMode("response");
                    } else if (!completeEventInfo.title) {
                        await speak(t.eventTitlePrompt, language).then(startVoiceListener);
                        setConversationContext((prev) => ({ ...prev, lastAskedFor: "title" }));
                        setVoiceMode("response");
                    } else if (!completeEventInfo.date) {
                        const question = completeEventInfo.title
                            ? t.eventDatePrompt(completeEventInfo.title)
                            : t.eventDatePromptGeneric;
                        await speak(question, language).then(startVoiceListener);
                        setConversationContext((prev) => ({ ...prev, lastAskedFor: "date" }));
                        setVoiceMode("response");
                    } else if (completeEventInfo.date && (!completeEventInfo.time || eventInfo.hasGeneralTimeOnly)) {
                        const question = completeEventInfo.timePeriod
                            ? t.eventTimePrompt(
                                completeEventInfo.title || "the event",
                                completeEventInfo.date.toDateString(),
                                completeEventInfo.timePeriod
                            )
                            : t.eventTimePromptGeneric(completeEventInfo.date.toDateString(), completeEventInfo.timePeriod);
                        await speak(question, language).then(startVoiceListener);
                        setConversationContext((prev) => ({ ...prev, lastAskedFor: "time" }));
                        setVoiceMode("response");
                    } else {
                        await speak(t.eventError, language).then(startVoiceListener);
                        setVoiceMode("response");
                    }
                }
            }
        } catch (error) {
            console.error("Error in speech processing:", error);
            await speak(t.speechError, language).then(startVoiceListener);
        }

        setIsProcessing(false);
    };

    const resetConversation = () => {
        setConversationContext({ ...conversation, language });
        persistentEventInfoRef.current = eventInfo;
        persistentInvoiceInfoRef.current = invoiceInfo;
        setVoiceMode("init");
        setModalType(null);
    };

    const saveEvent = async () => {
        if (!eventTitle || !parsedDate) {
            Alert.alert("Error", t.eventError);
            await speak(t.eventError, language).then(() => {
                setVoiceMode("response");
                setModalType(null);
            });
            return;
        }

        if (!googleCalendarToken) {
            Alert.alert("Error", t.authError);
            await speak(t.authError, language).then(() => {
                setVoiceMode("init");
                setModalType(null);
            });
            return;
        }

        setIsProcessing(true);

        try {
            const startTime = parsedDate;
            const endTime = new Date(startTime);
            endTime.setHours(endTime.getHours() + 1);

            const eventPayload = {
                summary: eventTitle,
                description: "Event created via voice input",
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                attendees: [],
            };

            const url = `${API.BASE_URL2}/calendar/create-event`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${googleCalendarToken}`,
                },
                body: JSON.stringify(eventPayload),
            });

            const responseData = await response.json();

            if (response.ok) {
                Alert.alert("Success", t.successEvent, [
                    {
                        text: "OK",
                        onPress: () => {
                            handleModeChange("manual");
                            setEventTitle("");
                            setParsedDate(null);
                            setModalType(null);
                            speak(t.successEvent, language);
                        },
                    },
                ]);
            } else {
                throw new Error(`Failed to create event: ${responseData.error?.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error creating event:", error);
            Alert.alert("Error", t.failEvent);
            await speak(t.failEvent, language).then(() => {
                setVoiceMode("response");
                setModalType(null);
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const saveInvoice = async () => {
        if (!invoiceDetails.clientName || !invoiceDetails.jobDescription || (invoiceDetails.type === "invoice" && invoiceDetails.amount === null)) {
            Alert.alert("Error", t.invoiceError);
            await speak(t.invoiceError, language).then(() => {
                setVoiceMode("response");
                setModalType(null);
            });
            return;
        }

        setIsProcessing(true);

        try {
            const invoicePayload = {
                clientName: invoiceDetails.clientName,
                jobDescription: invoiceDetails.jobDescription,
                amount: invoiceDetails.amount,
                salesTax: invoiceDetails.salesTax || 0,
                type: invoiceDetails.type || "quote",
                date: invoiceDetails.date || new Date().toISOString(),
                paymentTerms: invoiceDetails.paymentTerms || "Due upon receipt",
                email: invoiceDetails.email || null,
                phoneNumber: invoiceDetails.phoneNumber || null,
                status: invoiceDetails.status || "Pending",
                createdAt: new Date().toISOString(),
                userId: userId,
            };

            const url = `${API.BASE_URL2}/invoices/create`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${googleCalendarToken}`,
                },
                body: JSON.stringify(invoicePayload),
            });

            const responseData = await response.json();

            if (response.ok) {
                Alert.alert("Success", invoiceDetails.type === "quote" ? t.successQuote : t.successInvoice, [
                    {
                        text: "OK",
                        onPress: () => {
                            handleModeChange("manual");
                            setInvoiceDetails(invoiceDetail);
                            setModalType(null);
                            speak(invoiceDetails.type === "quote" ? t.successQuote : t.successInvoice, language);
                        },
                    },
                ]);
            } else {
                throw new Error(`Failed to create ${invoiceDetails.type}: ${responseData.error?.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error(`Error creating ${invoiceDetails.type}:`, error);
            Alert.alert("Error", invoiceDetails.type === "quote" ? t.failQuote : t.failInvoice);
            await speak(invoiceDetails.type === "quote" ? t.failQuote : t.failInvoice, language).then(() => {
                setVoiceMode("response");
                setModalType(null);
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleModal = () => setModalType("manualEntry");

    const handleScheduleEvent = async () => {
        setIsProcessing(true);
        try {
            const success = await handleGoogleCalendarAuth();
            if (success) {
                setModalType(null);
                navigation.navigate("CalendarScreen");
            }
        } catch (error) {
            Alert.alert("Failed", "Could not authenticate Google Calendar.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleLogoutPress = () => {
        Alert.alert("Logout", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Yes",
                onPress: () => {
                    navigation.reset({ index: 0, routes: [{ name: SCREENS.SPLASH }] });
                    dispatch(logout());
                },
            },
        ]);
    };

    const handleViewEvents = async () => {
        setIsProcessing(true);
        try {
            const success = await handleGoogleCalendarAuth();
            if (success) {
                setModalType(null);
                navigation.navigate("EventListScreen");
            }
        } catch (error) {
            Alert.alert("Failed", "Could not authenticate Google Calendar.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleViewInvoices = () => {
        setModalType(null);
        navigation.navigate("InvoicesList");
    };

    const handleSignOut = () => {
        GoogleAuthService.signOut().then(() => {
            setIsAuthenticated(false);
            Alert.alert("Signed Out", "You have been signed out successfully");
            setModalType(null);
        });
    };

    const handleEventModify = () => {
        setModalType(null);
        setVoiceMode("response");
        speak(t.eventTitlePrompt, language);
        startVoiceListener();
    };

    const handleInvoiceModify = () => {
        setModalType(null);
        setConversationContext((prev) => ({
            ...prev,
            isModificationMode: true,
            requestedChangeField: null,
        }));
        setVoiceMode("response");
        speak(t.invoiceModifyPrompt, language);
        startVoiceListener();
        startVoiceListener();
    };

    const handleCancel = () => {
        setModalType(null);
        if (modalType === "eventConfirmation") {
            setVoiceMode("init");
            speak(t.eventError, language);
        } else if (modalType === "invoiceConfirmation") {
            setVoiceMode("init");
            resetConversation();
            speak(t.invoiceError, language);
        }
    };

    return (
        <View style={styles.background}>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleLogoutPress} style={styles.logoutIcon}>
                    <AntDesign name="logout" size={34} color={COLORS.WHITE} />
                </TouchableOpacity>

                <TouchableOpacity onPress={openSettingsModal} style={styles.moreIcon}>
                    <Entypo name="dots-three-horizontal" size={24} color={COLORS.WHITE} />
                </TouchableOpacity>


                <Modal visible={settingsModalVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Settings</Text>

                            <Picker
                                selectedValue={selectedMode}
                                style={styles.picker}
                                onValueChange={(itemValue) => handleModeChange(itemValue as "manual" | "auto" | "invoice" | "quote" | "")}
                            >
                                <Picker.Item label={t.selectMode} value="" />
                                <Picker.Item label={t.manual} value="manual" />
                                <Picker.Item label={t.auto} value="auto" />
                                <Picker.Item label={t.invoice} value="invoice" />
                                <Picker.Item label={t.quote} value="quote" />
                            </Picker>

                            <Picker
                                selectedValue={language}
                                style={styles.picker}
                                onValueChange={(itemValue) => handleLanguageChange(itemValue as "en-US" | "es-ES")}
                            >
                                <Picker.Item label={t.selectLanguage} value="" />
                                <Picker.Item label={t.english} value="en-US" />
                                <Picker.Item label={t.spanish} value="es-ES" />
                            </Picker>

                            <TouchableOpacity onPress={closeSettingsModal} style={styles.closeButton}>
                                <Text style={styles.closeText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>


                {isListening && (
                    <LottieView source={require("../../assets/loaders/loader.json")} autoPlay loop style={styles.lottie} />
                )}

                {!isListening && (
                    <LottieView source={require("../../assets/loaders/loader.json")} style={styles.lottie} />
                )}

                <TouchableOpacity style={styles.plusButton} onPress={toggleModal}>
                    <Icon name="add" size={100} color={COLORS.WHITE} />
                </TouchableOpacity>

                <ModalComponent
                    isVisible={!!modalType}
                    modalType={modalType}
                    onClose={handleCancel}
                    onConfirm={
                        modalType === "eventConfirmation"
                            ? saveEvent
                            : modalType === "invoiceConfirmation" || modalType === "quoteConfirmation" || modalType === "convertQuote"
                                ? saveInvoice // or convertQuoteToInvoice for convertQuote
                                : undefined
                    }
                    onModify={
                        modalType === "eventConfirmation"
                            ? handleEventModify
                            : modalType === "invoiceConfirmation" || modalType === "quoteConfirmation"
                                ? handleInvoiceModify
                                : undefined
                    }
                    onConvertQuote={modalType === "quoteConfirmation" ? handleConvertQuote : undefined}
                    handleConvertQuote={handleConvertQuote} // Add this prop
                    isProcessing={isProcessing}
                    eventTitle={eventTitle}
                    parsedDate={parsedDate}
                    invoiceDetails={invoiceDetails}
                    handleViewEvents={handleViewEvents}
                    handleScheduleEvent={handleScheduleEvent}
                    handleViewInvoices={handleViewInvoices}
                    handleSignOut={handleSignOut}
                    isAuthenticated={isAuthenticated}
                />
            </View>
        </View>
    );
};

export default MainScreen;