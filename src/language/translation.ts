export const translations = {
  "en-US": {
    selectMode: "Select Mode",
    manual: "Manual",
    auto: "Auto",
    invoice: "Invoice",
    quote: "Quote",
    selectLanguage: "Select Language",
    english: "English",
    spanish: "Spanish",
    voiceCancel: "Voice mode canceled. Switching to manual mode.",
    voiceError: "Sorry, I didn't catch that. Please try again or say 'cancel'.",
    tooManyRetries: "Too many failed attempts. Returning to manual mode.",
    voiceStartError: "Error starting voice input. Please try again or say 'cancel'.",
    eventTitlePrompt: "What would you like to name your event?",
    eventDatePrompt: (title: string) => `When would you like to schedule "${title}"?`,
    eventDatePromptGeneric: "When would you like to schedule this event?",
    eventTimePrompt: (title: string, date: string, timePeriod: string) =>
      `What specific time in the ${timePeriod} would you like for "${title}" on ${date}?`,
    eventTimePromptGeneric: (date: string, timePeriod: string) =>
      `What exact time in the ${timePeriod} would you like for the event on ${date}?`,
    eventConfirm: (title: string, date: string, time: string) =>
      `I've scheduled "${title}" for ${date} at ${time}. Please review the details and confirm.`,
    eventSlotTaken: (title: string) => `That time slot is already taken. Would you like to choose another time for "${title}"?`,
    eventFreeSlot: (date: string) => `You have no events on ${date}. Would you like to schedule something?`,
    eventBusySlot: (date: string, events: string) =>
      `You have events on ${date}: ${events}. Would you like to check another date or create an event?`,
    eventError: "Event title and time are required. Let's start over.",
    invoiceClientPrompt: "Who is the invoice for?",
    invoiceJobPrompt: (client: string) => `What is the job or service for ${client}'s invoice?`,
    invoiceJobPromptGeneric: "What is the job or service for the invoice?",
    invoiceAmountPrompt: (client: string, job: string) =>
      `How much is the invoice for ${client}'s ${job}?`,
    invoiceAmountPromptGeneric: "What is the amount for the invoice?",
    invoiceContactPrompt: (client: string) =>
      `Please provide an email address or phone number for ${client}.`,
    invoiceContactPromptGeneric: "Please provide an email address or phone number for the client.",
    invoiceSendMethodPrompt: (client: string, email: string, phone: string) =>
      `Would you like to send the invoice to ${client} by email or SMS?`,
    invoiceSendMethodEmail: (client: string, email: string) =>
      `Would you like to send the invoice to ${client} by email to ${email}?`,
    invoiceSendMethodPhone: (client: string, phone: string) =>
      `Would you like to send the invoice to ${client} by SMS to ${phone}?`,
    invoiceConfirm: "Please review the details and confirm.",
    invoiceUpdateConfirm: "I've updated the invoice. Please review the details and confirm.",
    invoiceModifyPrompt: "What would you like to change in the invoice?",
    invoiceError: "Client name and job description are required. Amount is required for invoices. Let's start over.",
    invoiceMissingInfo: "I need more information. Please provide the client name and job description. For invoices, also provide the amount.",
    quotePrompt: "Which quote would you like to convert to an invoice?",
    quoteNotFound: (number: string) =>
      `No quote found with number ${number}. Please provide another quote number or say 'new invoice' to create a new one.`,
    quoteConversionConfirm: (id: string, client: string) =>
      `Is this quote #${id} for ${client} you want to convert to an invoice? Say 'yes' to confirm or 'no' to choose another.`,
    quoteNoQuotes: "No quotes found. Would you like to create a new invoice?",
    quoteRetry: "Which quote would you like to convert to an invoice?",
    quoteConfirmTitle: "Quote Confirmation",
    successQuote: "Quote created successfully!",
    failQuote: "Failed to create quote.",
    convertToInvoice: "Convert to Invoice",
    convertQuoteTitle: "Convert Quote to Invoice",
    convertAmountPrompt: (client: string, job: string) =>
      `Please provide the amount for converting the quote for ${client}'s ${job} to an invoice.`,
    convertAmountPromptGeneric: "Please provide the amount for converting the quote to an invoice.",
    successConvertQuote: "Quote successfully converted to invoice!",
    failConvertQuote: "Failed to convert quote to invoice. Please try again.",
    languageChange: (lang: string) => `Language changed to ${lang}.`,
    authError: "You need to log in first. Please authenticate.",
    successEvent: "Event added successfully. Switching back to manual mode.",
    successInvoice: "Invoice created successfully. Switching back to manual mode.",
    failEvent: "Sorry, I couldn't add the event. Let's try again.",
    failInvoice: "Sorry, I couldn't create the invoice. Let's try again.",
    speechError: "I'm having trouble understanding. Could you please try again?",
    quoteConfirm: (client: string) => `Is this the quote you want to convert to an invoice for ${client}? Say 'yes' to confirm or 'no' to choose another.`,
  },
  "es-ES": {
    selectMode: "Seleccionar Modo",
    manual: "Manual",
    auto: "Automático",
    invoice: "Factura",
    quote: "Cotización",
    selectLanguage: "Seleccionar Idioma",
    english: "Inglés",
    spanish: "Español",
    voiceCancel: "Modo de voz cancelado. Cambiando al modo manual.",
    voiceError: "Lo siento, no entendí. Por favor, intenta de nuevo o di 'cancelar'.",
    tooManyRetries: "Demasiados intentos fallidos. Volviendo al modo manual.",
    voiceStartError: "Error al iniciar la entrada de voz. Por favor, intenta de nuevo o di 'cancelar'.",
    eventTitlePrompt: "¿Cómo te gustaría nombrar tu evento?",
    eventDatePrompt: (title: string) => `¿Cuándo te gustaría programar "${title}"?`,
    eventDatePromptGeneric: "¿Cuándo te gustaría programar este evento?",
    eventTimePrompt: (title: string, date: string, timePeriod: string) =>
      `¿A qué hora específica en el ${timePeriod} deseas programar "${title}" el ${date}?`,
    eventTimePromptGeneric: (date: string, timePeriod: string) =>
      `¿A qué hora exacta en el ${timePeriod} deseas el evento el ${date}?`,
    eventConfirm: (title: string, date: string, time: string) =>
      `He programado "${title}" para el ${date} a las ${time}. Por favor, revisa los detalles y confirma.`,
    eventSlotTaken: (title: string) =>
      `Ese horario ya está ocupado. ¿Deseas elegir otra hora para "${title}"?`,
    eventFreeSlot: (date: string) => `No tienes eventos el ${date}. ¿Deseas programar algo?`,
    eventBusySlot: (date: string, events: string) =>
      `Tienes eventos el ${date}: ${events}. ¿Deseas verificar otra fecha o crear un evento?`,
    eventError: "El título y la hora del evento son requeridos. Vamos a empezar de nuevo.",
    invoiceClientPrompt: "¿Para quién es la factura?",
    invoiceJobPrompt: (client: string) => `¿Cuál es el trabajo o servicio para la factura de ${client}?`,
    invoiceJobPromptGeneric: "¿Cuál es el trabajo o servicio para la factura?",
    invoiceAmountPrompt: (client: string, job: string) =>
      `¿Cuánto es la factura para el ${job} de ${client}?`,
    invoiceAmountPromptGeneric: "¿Cuál es el monto de la factura?",
    invoiceContactPrompt: (client: string) =>
      `Por favor, proporciona una dirección de correo electrónico o un número de teléfono para ${client}.`,
    invoiceContactPromptGeneric: "Por favor, proporciona una dirección de correo electrónico o un número de teléfono para el cliente.",
    invoiceSendMethodPrompt: (client: string, email: string, phone: string) =>
      `¿Deseas enviar la factura a ${client} por correo electrónico o SMS?`,
    invoiceSendMethodEmail: (client: string, email: string) =>
      `¿Deseas enviar la factura a ${client} por correo a ${email}?`,
    invoiceSendMethodPhone: (client: string, phone: string) =>
      `¿Deseas enviar la factura a ${client} por SMS a ${phone}?`,
    invoiceConfirm: "Por favor, revisa los detalles y confirma.",
    invoiceUpdateConfirm: "He actualizado la factura. Por favor, revisa los detalles y confirma.",
    invoiceModifyPrompt: "¿Qué te gustaría cambiar en la factura?",
    invoiceError: "El nombre del cliente y la descripción del trabajo son requeridos. El monto es requerido para facturas. Vamos a empezar de nuevo.",
    invoiceMissingInfo: "Necesito más información. Por favor, proporciona el nombre del cliente y la descripción del trabajo. Para facturas, también proporciona el monto.",
    quotePrompt: "¿Qué cotización deseas convertir en factura?",
    quoteNotFound: (number: string) =>
      `No se encontró la cotización con el número ${number}. Por favor, proporciona otro número de cotización o di 'nueva factura' para crear una nueva.`,
    quoteConversionConfirm: (id: string, client: string) =>
      `¿Es esta la cotización #${id} para ${client} que deseas convertir en factura? Di 'sí' para confirmar o 'no' para elegir otra.`,
    quoteNoQuotes: "No se encontraron cotizaciones. ¿Deseas crear una nueva factura?",
    quoteRetry: "¿Qué cotización deseas convertir en factura?",
    quoteConfirmTitle: "Confirmación de Cotización",
    successQuote: "¡Cotización creada con éxito!",
    failQuote: "No se pudo crear la cotización.",
    convertToInvoice: "Convertir a Factura",
    convertQuoteTitle: "Convertir Cotización a Factura",
    convertAmountPrompt: (client: string, job: string) =>
      `Por favor, proporciona el monto para convertir la cotización del ${job} de ${client} en una factura.`,
    convertAmountPromptGeneric: "Por favor, proporciona el monto para convertir la cotización en una factura.",
    successConvertQuote: "¡Cotización convertida a factura con éxito!",
    failConvertQuote: "No se pudo convertir la cotización a factura. Por favor, intenta de nuevo.",
    languageChange: (lang: string) => `Idioma cambiado a ${lang}.`,
    authError: "Primero debes iniciar sesión. Por favor, autentícate.",
    successEvent: "Evento agregado exitosamente. Cambiando al modo manual.",
    successInvoice: "Factura creada exitosamente. Cambiando al modo manual.",
    failEvent: "Lo siento, no pude agregar el evento. Vamos a intentarlo de nuevo.",
    failInvoice: "Lo siento, no pude crear la factura. Vamos a intentarlo de nuevo.",
    speechError: "Tengo problemas para entender. ¿Podrías intentarlo de nuevo?",
    quoteConfirm: (client: string) => `¿Es esta la cotización que deseas convertir en una factura para ${client}? Di 'sí' para confirmar o 'no' para elegir otra.`,
  },
};