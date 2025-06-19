export interface EventInfo {
    title: string;
    date: Date | null;
    time: string | null;
    hasGeneralTimeOnly: boolean;
    timePeriod: string | null;
    isFreeSlotCheck: boolean;
    containsTitle: boolean;
    containsDate: boolean;
    containsTime: boolean;
}

export interface ClientData {
    clientName: string;
    email?: string;
    phoneNumber?: string;
}

export interface ConversationContext {
    title: string;
    date: Date | null;
    time: string | null;
    timePeriod: string | null;
    clientName: string;
    jobDescription: string;
    amount: number | null;
    salesTax: number | null;
    type: "invoice" | "quote" | null;
    invoiceDate: string | null;
    paymentTerms: string | null;
    email: string | null;
    phoneNumber: string | null;
    sendMethod: "email" | "sms" | null; // Added
    fullText: string;
    needsTitle: boolean;
    needsDate: boolean;
    needsTime: boolean;
    needsExactTime: boolean;
    needsClientName: boolean;
    needsJobDescription: boolean;
    needsAmount: boolean;
    needsSalesTax: boolean;
    needsType: boolean;
    needsInvoiceDate: boolean;
    needsPaymentTerms: boolean;
    needsEmail: boolean;
    needsPhoneNumber: boolean;
    needsApproval: boolean;
    needsDeliveryMethod: boolean; // Consider renaming to needsSendMethod
    lastQuestion: string;
    lastAskedFor: string;
    processedInputs: string[];
    isComplete: boolean;
    isInvoiceMode: boolean;
    isQuoteMode: boolean; // Added
    isConvertQuoteMode: boolean; // Added
    isModificationMode: boolean;
    requestedChangeField: string | null;
    selectedQuoteId: number | null; // Added
    status: "Pending" | "Accepted" | "Draft" | null; // Added
}


export interface persistentEventInfo {
    title: string;
    date: Date | null;
    time: string | null;
    timePeriod: string | null;
}

export interface InvoiceInfo {
    clientName: string;
    jobDescription: string;
    amount: number | null;
    salesTax: number | null;
    type: "invoice" | "quote" | null;
    date: string | null;
    paymentTerms: string | null;
    email: string | null;
    phoneNumber: string | null;
    sendMethod: "email" | "sms" | null;
    status: "Pending" | "Accepted" | "Draft" | null; // Updated to include Draft
    containsClientName: boolean;
    containsJobDescription: boolean;
    containsAmount: boolean;
    containsSalesTax: boolean;
    containsType: boolean;
    containsDate: boolean;
    containsPaymentTerms: boolean;
    containsEmail: boolean;
    containsPhoneNumber: boolean;
}

export interface persistentInvoiceInfo {
    clientName: string;
    jobDescription: string;
    amount: number | null;
    salesTax: number | null;
    type: "invoice" | "quote" | null;
    date: string | null;
    paymentTerms: string | null;
    email: string | null;
    phoneNumber: string | null;
    sendMethod: "email" | "sms" | null;
    status: "Pending" | "Accepted" | "Draft" | null; // Updated to include Draft
}