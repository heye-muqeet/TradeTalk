import { useRef, useState } from "react";
import { conversation, eventInfo, invoiceInfo } from "../states/initialStates";
import { ConversationContext, persistentEventInfo, persistentInvoiceInfo } from "../types/types";

const persistentEventInfoRef = useRef<persistentEventInfo>(eventInfo);
const persistentInvoiceInfoRef = useRef<persistentInvoiceInfo>(invoiceInfo);
const [conversationContext, setConversationContext] = useState<ConversationContext>(conversation);


export const resetConversation = (
    setVoiceMode: any
) => {
    setConversationContext(conversation);

    persistentEventInfoRef.current = eventInfo;

    persistentInvoiceInfoRef.current = invoiceInfo;

    setVoiceMode("init");
};