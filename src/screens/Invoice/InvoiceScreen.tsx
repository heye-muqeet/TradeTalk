// import React, { useState, useEffect, useCallback } from "react";
// import { View, Text, TouchableOpacity, FlatList, TextInput, ScrollView, Modal } from "react-native";
// import LottieView from "lottie-react-native";
// import Icon from "react-native-vector-icons/Ionicons";
// import Voice from "@react-native-voice/voice";
// import { useFocusEffect, useNavigation } from "@react-navigation/native";
// import styles from "./InvoiceScreen.styles";
// import { THEME } from "../../constants/constants";

// interface InvoiceDetails {
//     clientName: string;
//     amount: string;
//     items: Array<{ description: string; quantity: number; rate: number }>;
//     notes: string;
// }

// const InvoiceScreen: React.FC = () => {
//     const navigation = useNavigation<any>();
//     const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
//         { sender: "ai", text: "Do you want to create an invoice?" }
//     ]);
//     const [isListening, setIsListening] = useState(false);
//     const [showManualEditor, setShowManualEditor] = useState(false);
//     const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
//         clientName: "",
//         amount: "",
//         items: [{ description: "", quantity: 1, rate: 0 }],
//         notes: ""
//     });
//     const [templates, setTemplates] = useState([
//         { id: '1', name: 'Standard Invoice' },
//         { id: '2', name: 'Professional Services' },
//         { id: '3', name: 'Product Sales' }
//     ]);
//     const [selectedTemplate, setSelectedTemplate] = useState("1");
//     const [showPreview, setShowPreview] = useState(false);

//     useEffect(() => {
//         // Set up listeners
//         Voice.onSpeechResults = (e) => {
//             const command = e.value?.[0] || "";
//             handleVoiceCommand(command);
//         };

//         Voice.onSpeechStart = () => setIsListening(true);
//         Voice.onSpeechEnd = () => setIsListening(false);

//         // Properly clean up on component unmount
//         return () => {
//             cleanup();
//         };
//     }, []);

//     useFocusEffect(
//         useCallback(() => {
//             return () => {
//                 cleanup();
//             };
//         }, [])
//     );

//     const cleanup = () => {
//         Voice.stop();
//         Voice.removeAllListeners();
//         setIsListening(false);
//     };

//     const startListening = async () => {
//         try {
//             if (!isListening) {
//                 setIsListening(true);
//                 await Voice.start("en-US");
//             }
//         } catch (e) {
//             console.error("Voice recognition error:", e);
//         }
//     };

//     const stopListening = async () => {
//         try {
//             setIsListening(false);
//             await Voice.stop();
//         } catch (e) {
//             console.error("Error stopping voice recognition:", e);
//         }
//     };

//     const parseVoiceInput = (input: string) => {
//         console.log("Parsing voice input:", input); // For debugging

//         // Simplify to extract any text after "for" as the client name
//         const clientNameRegex = /for\s+([a-zA-Z0-9\s]+)/i;
//         const clientNameMatch = input.match(clientNameRegex);
//         let clientName = clientNameMatch ? clientNameMatch[1].trim() : "";

//         // Extract amount - look for numbers with or without dollar signs
//         const amountRegex = /(\d+(?:\.\d+)?)\s*(?:dollars|dollar|\$)|(?:\$\s*(\d+(?:\.\d+)?))/i;
//         const amountMatch = input.match(amountRegex);
//         let amount = "";

//         if (amountMatch) {
//             // The amount could be in group 1 or 2 depending on the pattern matched
//             amount = amountMatch[1] || amountMatch[2] || "";
//         }

//         console.log("Extracted client:", clientName); // For debugging
//         console.log("Extracted amount:", amount); // For debugging

//         return { clientName, amount };
//     };

//     const handleVoiceCommand = (command: string) => {
//         stopListening();
//         console.log("Voice command received:", command); // For debugging

//         setMessages((prev) => [...prev, { sender: "user", text: command }]);

//         if (command.toLowerCase().includes("yes")) {
//             setMessages((prev) => [...prev, {
//                 sender: "ai",
//                 text: "Great! Please specify the client name and amount. For example, say 'for ABC Company for $500'."
//             }]);
//         }
//         // Change this condition to be more flexible
//         else if (command.toLowerCase().includes("for")) {
//             // Parse client name and amount from voice input
//             const { clientName, amount } = parseVoiceInput(command);

//             // Proceed if we at least have a client name
//             if (clientName) {
//                 // Update invoice details
//                 setInvoiceDetails(prev => ({
//                     ...prev,
//                     clientName,
//                     amount: amount || "" // Use empty string if no amount found
//                 }));

//                 if (amount) {
//                     setMessages((prev) => [...prev, {
//                         sender: "ai",
//                         text: `I've prepared an invoice for ${clientName} for $${amount}. Would you like to preview it?`
//                     }]);
//                 } else {
//                     setMessages((prev) => [...prev, {
//                         sender: "ai",
//                         text: `I've started an invoice for ${clientName}. How much is this invoice for?`
//                     }]);
//                 }
//             } else {
//                 setMessages((prev) => [...prev, {
//                     sender: "ai",
//                     text: "I heard you mention 'for', but couldn't catch the client name. Could you repeat it more clearly?"
//                 }]);
//             }
//         } else if (command.toLowerCase().includes("preview") || command.toLowerCase().includes("show me")) {
//             setShowPreview(true);
//             setMessages((prev) => [...prev, {
//                 sender: "ai",
//                 text: "Here's your invoice preview. Say 'send it' to send the invoice or 'edit' to make changes."
//             }]);
//         } else if (command.toLowerCase().includes("send it") || command.toLowerCase().includes("approve")) {
//             sendInvoice();
//         } else if (command.toLowerCase().includes("edit") || command.toLowerCase().includes("change")) {
//             setShowManualEditor(true);
//             setMessages((prev) => [...prev, {
//                 sender: "ai",
//                 text: "You can now edit the invoice manually."
//             }]);
//         } else if (command.toLowerCase().includes("no")) {
//             setMessages((prev) => [...prev, {
//                 sender: "ai",
//                 text: "Okay, would you like to create an invoice manually instead?"
//             }]);
//         } else if (command.toLowerCase().includes("manually")) {
//             setShowManualEditor(true);
//         } else {
//             setMessages((prev) => [...prev, {
//                 sender: "ai",
//                 text: "I didn't understand that. Would you like to create an invoice? Say 'yes' or 'no'."
//             }]);
//         }
//     };

//     const sendInvoice = () => {
//         // Logic to send the invoice would go here
//         setMessages((prev) => [...prev, {
//             sender: "ai",
//             text: `Invoice sent to ${invoiceDetails.clientName} for $${invoiceDetails.amount}. It has been saved to your records.`
//         }]);
//         setShowPreview(false);

//         // Reset invoice details
//         setInvoiceDetails({
//             clientName: "",
//             amount: "",
//             items: [{ description: "", quantity: 1, rate: 0 }],
//             notes: ""
//         });
//     };

//     const addInvoiceItem = () => {
//         setInvoiceDetails(prev => ({
//             ...prev,
//             items: [...prev.items, { description: "", quantity: 1, rate: 0 }]
//         }));
//     };

//     const updateInvoiceItem = (index: number, field: string, value: string | number) => {
//         const updatedItems = [...invoiceDetails.items];
//         updatedItems[index] = {
//             ...updatedItems[index],
//             [field]: field === 'description' ? value : Number(value)
//         };

//         setInvoiceDetails(prev => ({
//             ...prev,
//             items: updatedItems
//         }));
//     };

//     const calculateTotal = () => {
//         return invoiceDetails.items.reduce((sum, item) => {
//             return sum + (item.quantity * item.rate);
//         }, 0).toFixed(2);
//     };

//     const renderManualEditor = () => {
//         return (
//             <Modal
//                 visible={showManualEditor}
//                 animationType="slide"
//                 transparent={false}
//                 onRequestClose={() => setShowManualEditor(false)}
//             >
//                 <View style={styles.modalContainer}>
//                     <View style={styles.modalHeader}>
//                         <Text style={styles.modalTitle}>Create Invoice</Text>
//                         <TouchableOpacity onPress={() => setShowManualEditor(false)}>
//                             <Icon name="close" size={24} color={THEME.PRIMARY} />
//                         </TouchableOpacity>
//                     </View>

//                     <ScrollView style={styles.editorContainer}>
//                         <Text style={styles.sectionTitle}>Select Template</Text>
//                         <View style={styles.templateContainer}>
//                             {templates.map(template => (
//                                 <TouchableOpacity
//                                     key={template.id}
//                                     style={[
//                                         styles.templateItem,
//                                         selectedTemplate === template.id && styles.selectedTemplate
//                                     ]}
//                                     onPress={() => setSelectedTemplate(template.id)}
//                                 >
//                                     <Text style={styles.templateText}>{template.name}</Text>
//                                 </TouchableOpacity>
//                             ))}
//                         </View>

//                         <Text style={styles.sectionTitle}>Client Information</Text>
//                         <View style={styles.inputGroup}>
//                             <Text style={styles.inputLabel}>Client Name</Text>
//                             <TextInput
//                                 style={styles.textInput}
//                                 value={invoiceDetails.clientName}
//                                 onChangeText={(text) => setInvoiceDetails(prev => ({ ...prev, clientName: text }))}
//                                 placeholder="Enter client name"
//                             />
//                         </View>

//                         <Text style={styles.sectionTitle}>Invoice Items</Text>
//                         {invoiceDetails.items.map((item, index) => (
//                             <View key={index} style={styles.invoiceItem}>
//                                 <TextInput
//                                     style={styles.itemDescription}
//                                     value={item.description}
//                                     onChangeText={(text) => updateInvoiceItem(index, 'description', text)}
//                                     placeholder="Item description"
//                                 />
//                                 <View style={styles.itemDetails}>
//                                     <TextInput
//                                         style={styles.itemQuantity}
//                                         value={String(item.quantity)}
//                                         onChangeText={(text) => updateInvoiceItem(index, 'quantity', text)}
//                                         keyboardType="numeric"
//                                         placeholder="Qty"
//                                     />
//                                     <TextInput
//                                         style={styles.itemRate}
//                                         value={String(item.rate)}
//                                         onChangeText={(text) => updateInvoiceItem(index, 'rate', text)}
//                                         keyboardType="numeric"
//                                         placeholder="Rate"
//                                     />
//                                     <Text style={styles.itemAmount}>
//                                         ${(item.quantity * item.rate).toFixed(2)}
//                                     </Text>
//                                 </View>
//                             </View>
//                         ))}

//                         <TouchableOpacity style={styles.addItemButton} onPress={addInvoiceItem}>
//                             <Icon name="add-circle" size={20} color={THEME.PRIMARY} />
//                             <Text style={styles.addItemText}>Add Item</Text>
//                         </TouchableOpacity>

//                         <View style={styles.totalSection}>
//                             <Text style={styles.totalLabel}>Total Amount:</Text>
//                             <Text style={styles.totalAmount}>${calculateTotal()}</Text>
//                         </View>

//                         <View style={styles.inputGroup}>
//                             <Text style={styles.inputLabel}>Notes</Text>
//                             <TextInput
//                                 style={[styles.textInput, styles.notesInput]}
//                                 value={invoiceDetails.notes}
//                                 onChangeText={(text) => setInvoiceDetails(prev => ({ ...prev, notes: text }))}
//                                 placeholder="Additional notes"
//                                 multiline
//                             />
//                         </View>

//                         <TouchableOpacity
//                             style={styles.previewButton}
//                             onPress={() => {
//                                 setShowManualEditor(false);
//                                 setShowPreview(true);
//                             }}
//                         >
//                             <Text style={styles.previewButtonText}>Preview Invoice</Text>
//                         </TouchableOpacity>
//                     </ScrollView>
//                 </View>
//             </Modal>
//         );
//     };

//     const renderInvoicePreview = () => {
//         return (
//             <Modal
//                 visible={showPreview}
//                 animationType="slide"
//                 transparent={false}
//                 onRequestClose={() => setShowPreview(false)}
//             >
//                 <View style={styles.modalContainer}>
//                     <View style={styles.modalHeader}>
//                         <Text style={styles.modalTitle}>Invoice Preview</Text>
//                         <TouchableOpacity onPress={() => setShowPreview(false)}>
//                             <Icon name="close" size={24} color={THEME.PRIMARY} />
//                         </TouchableOpacity>
//                     </View>

//                     <ScrollView style={styles.previewContainer}>
//                         <View style={styles.invoiceHeader}>
//                             <Text style={styles.invoiceTitle}>INVOICE</Text>
//                             <Text style={styles.invoiceDate}>Date: {new Date().toLocaleDateString()}</Text>
//                         </View>

//                         <View style={styles.clientSection}>
//                             <Text style={styles.sectionTitle}>Bill To: {invoiceDetails.clientName}</Text>
//                             {/* <Text style={styles.clientName}>{invoiceDetails.clientName}</Text> */}
//                         </View>

//                         <View style={styles.itemsTable}>
//                             <View style={styles.tableHeader}>
//                                 <Text style={styles.descriptionHeader}>Description</Text>
//                                 <Text style={styles.qtyHeader}>Qty</Text>
//                                 <Text style={styles.rateHeader}>Rate</Text>
//                                 <Text style={styles.amountHeader}>Amount</Text>
//                             </View>

//                             {invoiceDetails.items.map((item, index) => (
//                                 <View key={index} style={styles.tableRow}>
//                                     <Text style={styles.descriptionCell}>{item.description || "Item #" + (index + 1)}</Text>
//                                     <Text style={styles.qtyCell}>{item.quantity}</Text>
//                                     <Text style={styles.rateCell}>${item.rate.toFixed(2)}</Text>
//                                     <Text style={styles.amountCell}>${(item.quantity * item.rate).toFixed(2)}</Text>
//                                 </View>
//                             ))}

//                             <View style={styles.tableTotalRow}>
//                                 <Text style={styles.totalCell}>Total:</Text>
//                                 <Text style={styles.totalValueCell}>${calculateTotal()}</Text>
//                             </View>
//                         </View>

//                         {invoiceDetails.notes && (
//                             <View style={styles.notesSection}>
//                                 <Text style={styles.sectionTitle}>Notes:</Text>
//                                 <Text style={styles.notesText}>{invoiceDetails.notes}</Text>
//                             </View>
//                         )}

//                         <View style={styles.actionButtons}>
//                             <TouchableOpacity
//                                 style={[styles.actionButton, styles.editButton]}
//                                 onPress={() => {
//                                     setShowPreview(false);
//                                     setShowManualEditor(true);
//                                 }}
//                             >
//                                 <Text style={styles.editButtonText}>Edit</Text>
//                             </TouchableOpacity>

//                             <TouchableOpacity
//                                 style={[styles.actionButton, styles.sendButton]}
//                                 onPress={() => {
//                                     setShowPreview(false);
//                                     sendInvoice();
//                                 }}
//                             >
//                                 <Text style={styles.sendButtonText}>Send Invoice</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </ScrollView>
//                 </View>
//             </Modal>
//         );
//     };

//     return (
//         <View style={styles.container}>
//             {/* Header */}
//             <View style={styles.header}>
//                 <TouchableOpacity onPress={() => navigation.goBack()}>
//                     <Icon name="arrow-back" size={25} color="white" />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}>TradeTalk</Text>
//                 <TouchableOpacity onPress={() => navigation.navigate("SettingsScreen")}>
//                     <Icon name="settings-outline" size={25} color="white" />
//                 </TouchableOpacity>
//             </View>

//             <FlatList
//                 data={messages}
//                 keyExtractor={(_, index) => index.toString()}
//                 renderItem={({ item }) => (
//                     <View style={[styles.messageBubble, item.sender === "user" ? styles.userBubble : styles.aiBubble]}>
//                         <Text style={styles.messageText}>{item.text}</Text>
//                     </View>
//                 )}
//                 contentContainerStyle={styles.chatContainer}
//             />

//             <View style={styles.optionsContainer}>
//                 <TouchableOpacity
//                     style={styles.optionButton}
//                     onPress={() => setShowManualEditor(true)}
//                 >
//                     <Icon name="document-text-outline" size={20} color="white" />
//                     <Text style={styles.optionText}>Manual Invoice</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                     style={[styles.micButton, { backgroundColor: isListening ? THEME.TRANSPARENT : THEME.PRIMARY }]}
//                     onPress={startListening}
//                     disabled={isListening}
//                 >
//                     {isListening ? (
//                         <TouchableOpacity onPress={stopListening} activeOpacity={0.7}>
//                             <LottieView
//                                 source={require("../../assets/loaders/loader.json")}
//                                 autoPlay
//                                 loop
//                                 style={styles.micAnimation}
//                             />
//                         </TouchableOpacity>
//                     ) : (
//                         <Icon name="mic" size={30} color="white" />
//                     )}
//                 </TouchableOpacity>
//             </View>

//             {renderManualEditor()}
//             {renderInvoicePreview()}
//         </View>
//     );
// };

// export default InvoiceScreen;