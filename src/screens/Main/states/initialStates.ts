
import { ConversationContext, InvoiceInfo, persistentEventInfo, persistentInvoiceInfo } from "../types/types";

export const conversation: ConversationContext = {
    title: "",
    date: null,
    time: null,
    timePeriod: null,
    clientName: "",
    jobDescription: "",
    amount: null,
    salesTax: null,
    type: "quote",
    invoiceDate: null,
    paymentTerms: null,
    email: null,
    phoneNumber: null,
    sendMethod: null, // Add sendMethod to align with InvoiceInfo
    fullText: "",
    needsTitle: false,
    needsDate: false,
    needsTime: false,
    needsExactTime: false,
    needsClientName: false,
    needsJobDescription: false,
    needsAmount: false,
    needsSalesTax: false,
    needsType: false,
    needsInvoiceDate: false,
    needsPaymentTerms: false,
    needsEmail: false,
    needsPhoneNumber: false,
    needsApproval: false,
    needsDeliveryMethod: false, // Consider renaming to needsSendMethod for clarity
    lastQuestion: "",
    lastAskedFor: "",
    processedInputs: [],
    isComplete: false,
    isInvoiceMode: false,
    isQuoteMode: false, // Add to support quote mode
    isConvertQuoteMode: false, // Add to support quote-to-invoice conversion
    isModificationMode: false,
    requestedChangeField: null,
    selectedQuoteId: null, // Add to track selected quote for conversion
    status: "Pending", // Add to align with InvoiceInfo
}

export const invoiceDetail: InvoiceInfo = {
    clientName: "",
    jobDescription: "",
    amount: null,
    salesTax: null,
    type: null, // Changed to null to allow flexibility between invoice and quote
    date: null,
    paymentTerms: null,
    email: null,
    phoneNumber: null,
    sendMethod: null,
    status: null, // Changed to null to allow dynamic status
    containsClientName: false,
    containsJobDescription: false,
    containsAmount: false,
    containsSalesTax: false,
    containsType: false,
    containsDate: false,
    containsPaymentTerms: false,
    containsEmail: false,
    containsPhoneNumber: false,
}

export const invoiceInfo: persistentInvoiceInfo = {
    clientName: "",
    jobDescription: "",
    amount: null,
    salesTax: null,
    type: null, // Changed to null to allow flexibility
    date: null,
    paymentTerms: null,
    email: null,
    phoneNumber: null,
    sendMethod: null,
    status: null, // Changed to null to allow dynamic status
}

export const eventInfo: persistentEventInfo = {
    title: "",
    date: null,
    time: null,
    timePeriod: null
}
