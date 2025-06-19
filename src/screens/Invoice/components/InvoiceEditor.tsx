import React from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import styles from "../InvoiceScreen.styles";
import { THEME } from "../../../constants/constants";
import { InvoiceDetails, Template } from "./types";
import InvoiceItemEditor from "./InvoiceItemEditor";

interface InvoiceEditorProps {
    visible: boolean;
    invoiceDetails: InvoiceDetails;
    setInvoiceDetails: React.Dispatch<React.SetStateAction<InvoiceDetails>>;
    templates: Template[];
    selectedTemplate: string;
    setSelectedTemplate: React.Dispatch<React.SetStateAction<string>>;
    onClose: () => void;
    onPreview: () => void;
}

const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
    visible,
    invoiceDetails,
    setInvoiceDetails,
    templates,
    selectedTemplate,
    setSelectedTemplate,
    onClose,
    onPreview
}) => {
    const addInvoiceItem = () => {
        setInvoiceDetails(prev => ({
            ...prev,
            items: [...prev.items, { description: "", quantity: 1, rate: 0 }]
        }));
    };

    const updateInvoiceItem = (index: number, field: string, value: string | number) => {
        const updatedItems = [...invoiceDetails.items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: field === 'description' ? value : Number(value)
        };
        
        setInvoiceDetails(prev => ({
            ...prev,
            items: updatedItems
        }));
    };

    const calculateTotal = () => {
        return invoiceDetails.items.reduce((sum, item) => {
            return sum + (item.quantity * item.rate);
        }, 0).toFixed(2);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Create Invoice</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Icon name="close" size={24} color={THEME.PRIMARY} />
                    </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.editorContainer}>
                    <Text style={styles.sectionTitle}>Select Template</Text>
                    <View style={styles.templateContainer}>
                        {templates.map(template => (
                            <TouchableOpacity 
                                key={template.id}
                                style={[
                                    styles.templateItem,
                                    selectedTemplate === template.id && styles.selectedTemplate
                                ]}
                                onPress={() => setSelectedTemplate(template.id)}
                            >
                                <Text style={styles.templateText}>{template.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    
                    <Text style={styles.sectionTitle}>Client Information</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Client Name</Text>
                        <TextInput
                            style={styles.textInput}
                            value={invoiceDetails.clientName}
                            onChangeText={(text) => setInvoiceDetails(prev => ({ 
                                ...prev, clientName: text 
                            }))}
                            placeholder="Enter client name"
                        />
                    </View>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Amount</Text>
                        <TextInput
                            style={styles.textInput}
                            value={invoiceDetails.amount}
                            onChangeText={(text) => setInvoiceDetails(prev => ({ 
                                ...prev, amount: text 
                            }))}
                            placeholder="Enter total amount"
                            keyboardType="numeric"
                        />
                    </View>
                    
                    <Text style={styles.sectionTitle}>Invoice Items</Text>
                    {invoiceDetails.items.map((item, index) => (
                        <InvoiceItemEditor
                            key={index}
                            item={item}
                            index={index}
                            updateItem={updateInvoiceItem}
                        />
                    ))}
                    
                    <TouchableOpacity style={styles.addItemButton} onPress={addInvoiceItem}>
                        <Icon name="add-circle" size={20} color={THEME.PRIMARY} />
                        <Text style={styles.addItemText}>Add Item</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.totalSection}>
                        <Text style={styles.totalLabel}>Total Amount:</Text>
                        <Text style={styles.totalAmount}>${calculateTotal()}</Text>
                    </View>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Notes</Text>
                        <TextInput
                            style={[styles.textInput, styles.notesInput]}
                            value={invoiceDetails.notes}
                            onChangeText={(text) => setInvoiceDetails(prev => ({ 
                                ...prev, notes: text 
                            }))}
                            placeholder="Additional notes"
                            multiline
                        />
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.previewButton}
                        onPress={onPreview}
                    >
                        <Text style={styles.previewButtonText}>Preview Invoice</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
    );
};

export default InvoiceEditor;