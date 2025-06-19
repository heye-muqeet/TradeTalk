import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import styles from "../InvoiceScreen.styles";
import { THEME } from "../../../constants/constants";
import { InvoiceDetails } from "./types";

interface InvoicePreviewProps {
    visible: boolean;
    invoiceDetails: InvoiceDetails;
    calculateTotal: () => string;
    onClose: () => void;
    onEdit: () => void;
    onSend: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
    visible,
    invoiceDetails,
    calculateTotal,
    onClose,
    onEdit,
    onSend
}) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Invoice Preview</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Icon name="close" size={24} color={THEME.PRIMARY} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.previewContainer}>
                    <View style={styles.invoiceHeader}>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <Text style={styles.invoiceDate}>
                            Date: {new Date().toLocaleDateString()}
                        </Text>
                    </View>

                    <View style={styles.clientSection}>
                        <Text style={styles.sectionTitle}>Bill To:</Text>
                        <Text style={styles.clientName}>{invoiceDetails.clientName}</Text>
                    </View>

                    <View style={styles.itemsTable}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.descriptionHeader}>Description</Text>
                            <Text style={styles.qtyHeader}>Qty</Text>
                            <Text style={styles.rateHeader}>Rate</Text>
                            <Text style={styles.amountHeader}>Amount</Text>
                        </View>

                        {invoiceDetails && (
                            <View style={styles.tableRow}>
                                <Text style={styles.descriptionCell}>Invoice Amount</Text>
                                <Text style={styles.qtyCell}>1</Text>
                                <Text style={styles.rateCell}>${invoiceDetails.amount}</Text>
                                <Text style={styles.amountCell}>${invoiceDetails.amount}</Text>
                            </View>
                        )}

                        {invoiceDetails ? <Text></Text>: <Text></Text>
                        }
                        {invoiceDetails.items.map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={styles.descriptionCell}>
                                    {item.description || "Item #" + (index + 1)}
                                </Text>
                                <Text style={styles.qtyCell}>{item.quantity}</Text>
                                <Text style={styles.rateCell}>${item.rate.toFixed(2)} </Text>
                                <Text style={styles.amountCell}>
                                    ${(item.quantity * item.rate).toFixed(2)}
                                </Text>
                            </View>
                        ))}

                        <View style={styles.tableTotalRow}>
                            <Text style={styles.totalCell}>Total:</Text>
                            <Text style={styles.totalValueCell}>${calculateTotal()}</Text>
                        </View>
                    </View>

                    {invoiceDetails.notes && (
                        <View style={styles.notesSection}>
                            <Text style={styles.sectionTitle}>Notes:</Text>
                            <Text style={styles.notesText}>{invoiceDetails.notes}</Text>
                        </View>
                    )}

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.editButton]}
                            onPress={onEdit}
                        >
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.sendButton]}
                            onPress={onSend}
                        >
                            <Text style={styles.sendButtonText}>Send Invoice</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

export default InvoicePreview;