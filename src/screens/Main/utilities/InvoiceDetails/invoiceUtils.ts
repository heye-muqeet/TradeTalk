import { useRef, useState } from "react";
import { ConversationContext, InvoiceInfo, persistentInvoiceInfo } from "../../types/types";
import { conversation, invoiceInfo } from "../../states/initialStates";
import axios from "axios";
import { translations } from "../../../../language/translation";

export const InvoiceUtils = () => {
  const persistentInvoiceInfoRef = useRef<persistentInvoiceInfo>(invoiceInfo);
  const OPENAI_API_KEY = "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";
  const [conversationContext, setConversationContext] = useState<ConversationContext>(conversation);

  const parseInvoiceDetails = async (input: string): Promise<InvoiceInfo> => {
    console.log("Parse");

    const updatedFullText = conversationContext.fullText + " " + input;
    setConversationContext((prev) => ({
      ...prev,
      fullText: updatedFullText,
      processedInputs: [...prev.processedInputs, input],
    }));

    const currentInvoiceInfo = {
      clientName: persistentInvoiceInfoRef.current.clientName || conversationContext.clientName,
      jobDescription: persistentInvoiceInfoRef.current.jobDescription || conversationContext.jobDescription,
      amount: persistentInvoiceInfoRef.current.amount || conversationContext.amount,
      salesTax: persistentInvoiceInfoRef.current.salesTax || conversationContext.salesTax,
      type: persistentInvoiceInfoRef.current.type || conversationContext.type,
      date: persistentInvoiceInfoRef.current.date || conversationContext.invoiceDate,
      paymentTerms: persistentInvoiceInfoRef.current.paymentTerms || conversationContext.paymentTerms,
      email: persistentInvoiceInfoRef.current.email || conversationContext.email,
      phoneNumber: persistentInvoiceInfoRef.current.phoneNumber || conversationContext.phoneNumber,
      sendMethod: persistentInvoiceInfoRef.current.sendMethod || conversationContext.sendMethod,
    };

    const language = conversationContext.language || "en-US";
    const t = translations[language];

    const context = `
      You are an invoice parser. Extract invoice or quote information from the conversation.
      Language: ${language === "es-ES" ? "Spanish" : "English"}

      Current conversation: "${updatedFullText}"

      What we already know:
      - Client Name: ${currentInvoiceInfo.clientName || "None"}
      - Job Description: ${currentInvoiceInfo.jobDescription || "None"}
      - Amount: ${currentInvoiceInfo.amount || "None"}
      - Sales Tax: ${currentInvoiceInfo.salesTax || "None"}
      - Type: ${currentInvoiceInfo.type || "None"}
      - Date: ${currentInvoiceInfo.date || "None"}
      - Payment Terms: ${currentInvoiceInfo.paymentTerms || "None"}
      - Email: ${currentInvoiceInfo.email || "None"}
      - Phone Number: ${currentInvoiceInfo.phoneNumber || "None"}
      - Send Method: ${currentInvoiceInfo.sendMethod || "None"}

      Special Instructions:
      - If the input indicates a specific change request (e.g., "${language === "es-ES" ? "cambiar el nombre del cliente a John Doe" : "change client name to John Doe"}", "${language === "es-ES" ? "actualizar monto a 500" : "update amount to 500"}"),
        identify the field to change and extract only that field's new value.
      - For phone numbers: Return in E.164 format (e.g., "+12345678901").
      - For email addresses: Normalize to lowercase, remove spaces, validate format.
      - For amount and sales tax: Extract numeric value, ignore currency symbols. For quotes, amount can be null.
      - For sendMethod: Recognize "${language === "es-ES" ? "correo" : "email"}" or "${language === "es-ES" ? "sms" : "sms"}" explicitly.
      - For type: Recognize "${language === "es-ES" ? "cotización" : "quote"}" or "${language === "es-ES" ? "factura" : "invoice"}" explicitly.
      - For status: Set to "Pending" for quotes unless explicitly changed.
      - If in quote mode (type is "quote"), do not require amount.

      Return a JSON object with these fields:
      {
          "clientName": "extracted client name or null",
          "jobDescription": "extracted job description or null",
          "amount": "extracted amount as number or null",
          "salesTax": "extracted sales tax as number or null",
          "type": "quote or invoice or null",
          "date": "extracted date as ISO string or null",
          "paymentTerms": "extracted payment terms or null",
          "email": "extracted and formatted email or null",
          "phoneNumber": "extracted and formatted phone number or null",
          "sendMethod": "email or sms or null",
          "status": "Pending or Accepted or null",
          "containsClientName": boolean,
          "containsJobDescription": boolean,
          "containsAmount": boolean,
          "containsSalesTax": boolean,
          "containsType": boolean,
          "containsDate": boolean,
          "containsPaymentTerms": boolean,
          "containsEmail": boolean,
          "containsPhoneNumber": boolean,
          "changeRequestField": "field name if a change was requested (e.g., 'clientName'), null otherwise"
      }

      Only extract information from the CURRENT input: "${input}"
    `;

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: context },
            { role: "user", content: "Parse this input." },
          ],
          temperature: 0.2,
          max_tokens: 300,
        },
        { headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" } }
      );

      const responseText = response.data.choices[0].message.content.trim();
      console.log("AI Parser Response (Invoice):", responseText);

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid response format");

      let result = JSON.parse(jsonMatch[0]);

      // Post-process phone number
      let formattedPhoneNumber = result.phoneNumber;
      if (result.containsPhoneNumber && result.phoneNumber) {
        let cleanedNumber = result.phoneNumber.replace(/[^+\d]/g, "");
        if (!cleanedNumber.startsWith("+")) {
          cleanedNumber = `+1${cleanedNumber}`;
        }
        const digitCount = cleanedNumber.replace("+", "").length;
        formattedPhoneNumber = digitCount >= 10 && digitCount <= 15 ? cleanedNumber : null;
      }

      // Post-process email
      let formattedEmail = result.email;
      if (result.containsEmail && result.email) {
        formattedEmail = result.email.replace(/\s+/g, "").toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formattedEmail)) {
          formattedEmail = null;
        }
      }

      // In modification mode, only update the requested field
      if (conversationContext.isModificationMode && result.changeRequestField) {
        const field = result.changeRequestField;
        persistentInvoiceInfoRef.current[field] =
          result[field] !== null ? result[field] : persistentInvoiceInfoRef.current[field];
        setConversationContext((prev) => ({
          ...prev,
          [field]: result[field] !== null ? result[field] : prev[field],
          needsClientName: !persistentInvoiceInfoRef.current.clientName,
          needsJobDescription: !persistentInvoiceInfoRef.current.jobDescription,
          needsAmount: conversationContext.isQuoteMode ? false : persistentInvoiceInfoRef.current.amount === null,
          needsContactInfo: !persistentInvoiceInfoRef.current.email && !persistentInvoiceInfoRef.current.phoneNumber,
          needsSendMethod: !persistentInvoiceInfoRef.current.sendMethod,
          requestedChangeField: field,
        }));
      } else {
        // Normal parsing: update all provided fields
        const newClientName = result.containsClientName && result.clientName ? result.clientName : currentInvoiceInfo.clientName;
        const newJobDescription = result.containsJobDescription && result.jobDescription ? result.jobDescription : currentInvoiceInfo.jobDescription;
        const newAmount = result.containsAmount && result.amount !== null ? parseFloat(result.amount) : currentInvoiceInfo.amount;
        const newSalesTax = result.containsSalesTax && result.salesTax !== null ? parseFloat(result.salesTax) : currentInvoiceInfo.salesTax;
        const newType = result.containsType && result.type ? result.type : currentInvoiceInfo.type;
        const newDate = result.containsDate && result.date ? result.date : currentInvoiceInfo.date;
        const newPaymentTerms = result.containsPaymentTerms && result.paymentTerms ? result.paymentTerms : currentInvoiceInfo.paymentTerms;
        const newEmail = formattedEmail || currentInvoiceInfo.email;
        const newPhoneNumber = formattedPhoneNumber || currentInvoiceInfo.phoneNumber;
        const newSendMethod = result.sendMethod ? result.sendMethod.toLowerCase() : currentInvoiceInfo.sendMethod;
        const newStatus = result.containsStatus && result.status ? result.status : (newType === "quote" ? "Pending" : currentInvoiceInfo.status);

        persistentInvoiceInfoRef.current = {
          clientName: newClientName,
          jobDescription: newJobDescription,
          amount: newAmount,
          salesTax: newSalesTax,
          type: newType,
          date: newDate,
          paymentTerms: newPaymentTerms,
          email: newEmail,
          phoneNumber: newPhoneNumber,
          sendMethod: newSendMethod,
          status: newStatus,
        };

        setConversationContext((prev) => ({
          ...prev,
          clientName: newClientName,
          jobDescription: newJobDescription,
          amount: newAmount,
          salesTax: newSalesTax,
          type: newType,
          invoiceDate: newDate,
          paymentTerms: newPaymentTerms,
          email: newEmail,
          phoneNumber: newPhoneNumber,
          sendMethod: newSendMethod,
          status: newStatus,
          needsClientName: !newClientName,
          needsJobDescription: !newJobDescription,
          needsAmount: newType === "quote" ? false : newAmount === null,
          needsContactInfo: !newEmail && !newPhoneNumber,
          needsSendMethod: !newSendMethod,
        }));
      }

      const invoiceInfo: InvoiceInfo = {
        clientName: persistentInvoiceInfoRef.current.clientName,
        jobDescription: persistentInvoiceInfoRef.current.jobDescription,
        amount: persistentInvoiceInfoRef.current.amount,
        salesTax: persistentInvoiceInfoRef.current.salesTax,
        type: persistentInvoiceInfoRef.current.type,
        date: persistentInvoiceInfoRef.current.date,
        paymentTerms: persistentInvoiceInfoRef.current.paymentTerms,
        email: persistentInvoiceInfoRef.current.email,
        phoneNumber: persistentInvoiceInfoRef.current.phoneNumber,
        sendMethod: persistentInvoiceInfoRef.current.sendMethod,
        status: persistentInvoiceInfoRef.current.status,
        containsClientName: result.containsClientName,
        containsJobDescription: result.containsJobDescription,
        containsAmount: result.containsAmount,
        containsSalesTax: result.containsSalesTax,
        containsType: result.containsType,
        containsDate: result.containsDate,
        containsPaymentTerms: result.containsPaymentTerms,
        containsEmail: result.containsEmail,
        containsPhoneNumber: result.containsPhoneNumber,
      };

      console.log("Parsed Invoice Info:", invoiceInfo);
      return invoiceInfo;
    } catch (error) {
      console.error("Error parsing invoice details:", error);
      return {
        clientName: persistentInvoiceInfoRef.current.clientName,
        jobDescription: persistentInvoiceInfoRef.current.jobDescription,
        amount: persistentInvoiceInfoRef.current.amount,
        salesTax: persistentInvoiceInfoRef.current.salesTax,
        type: persistentInvoiceInfoRef.current.type,
        date: persistentInvoiceInfoRef.current.date,
        paymentTerms: persistentInvoiceInfoRef.current.paymentTerms,
        email: persistentInvoiceInfoRef.current.email,
        phoneNumber: persistentInvoiceInfoRef.current.phoneNumber,
        sendMethod: persistentInvoiceInfoRef.current.sendMethod,
        status: persistentInvoiceInfoRef.current.status,
        containsClientName: false,
        containsJobDescription: false,
        containsAmount: false,
        containsSalesTax: false,
        containsType: false,
        containsDate: false,
        containsPaymentTerms: false,
        containsEmail: false,
        containsPhoneNumber: false,
      };
    }
  };

  const determineNextInvoiceQuestion = async (invoiceInfo: InvoiceInfo) => {
    const { clientName, jobDescription, amount, sendMethod, email, phoneNumber, type } = invoiceInfo;
    const language = conversationContext.language || "en-US";
    const t = translations[language];

    if (conversationContext.isModificationMode) {
      return t.invoiceModifyPrompt;
    }

    const needsClientName = !clientName;
    const needsJobDescription = !jobDescription;
    const needsAmount = type === "invoice" && amount === null;
    const needsSendMethod = !sendMethod;
    const needsContactInfo = !email && !phoneNumber;

    setConversationContext((prev) => ({
      ...prev,
      needsClientName,
      needsJobDescription,
      needsAmount,
      needsSendMethod,
      needsContactInfo,
    }));

    let nextField = "";

    if (needsClientName) {
      nextField = "clientName";
    } else if (needsJobDescription) {
      nextField = "jobDescription";
    } else if (needsAmount) {
      nextField = "amount";
    } else if (needsContactInfo) {
      nextField = "contactInfo";
    } else if (needsSendMethod) {
      nextField = "sendMethod";
    }

    if (nextField === conversationContext.lastAskedFor && conversationContext.processedInputs.length > 1) {
      if (nextField === "clientName") {
        nextField = jobDescription ? (type === "invoice" ? "amount" : "contactInfo") : "jobDescription";
      } else if (nextField === "jobDescription") {
        nextField = clientName ? (type === "invoice" ? "amount" : "contactInfo") : "clientName";
      } else if (nextField === "amount") {
        nextField = clientName ? "clientName" : "jobDescription";
      } else if (nextField === "contactInfo") {
        nextField = "sendMethod";
      } else if (nextField === "sendMethod") {
        nextField = "contactInfo";
      }
    }

    let question = "";

    if (nextField === "clientName") {
      question = t.invoiceClientPrompt;
      setConversationContext((prev) => ({ ...prev, lastAskedFor: "clientName" }));
    } else if (nextField === "jobDescription") {
      question = clientName ? t.invoiceJobPrompt(clientName) : t.invoiceJobPromptGeneric;
      setConversationContext((prev) => ({ ...prev, lastAskedFor: "jobDescription" }));
    } else if (nextField === "amount") {
      question = clientName && jobDescription ? t.invoiceAmountPrompt(clientName, jobDescription) : t.invoiceAmountPromptGeneric;
      setConversationContext((prev) => ({ ...prev, lastAskedFor: "amount" }));
    } else if (nextField === "contactInfo") {
      question = clientName ? t.invoiceContactPrompt(clientName) : t.invoiceContactPromptGeneric;
      setConversationContext((prev) => ({ ...prev, lastAskedFor: "contactInfo" }));
    } else if (nextField === "sendMethod") {
      question = email && phoneNumber
        ? t.invoiceSendMethodPrompt(clientName, email, phoneNumber)
        : email
          ? t.invoiceSendMethodEmail(clientName, email)
          : t.invoiceSendMethodPhone(clientName, phoneNumber);
      setConversationContext((prev) => ({ ...prev, lastAskedFor: "sendMethod" }));
    } else {
      return null;
    }

    return question;
  };

  return { parseInvoiceDetails, determineNextInvoiceQuestion };
};
