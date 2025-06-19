import React from "react";
import { View, TextInput, Text } from "react-native";
import styles from "../InvoiceScreen.styles";
import { InvoiceItem } from "./types";

interface InvoiceItemEditorProps {
    item: InvoiceItem;
    index: number;
    updateItem: (index: number, field: string, value: string | number) => void;
}

const InvoiceItemEditor: React.FC<InvoiceItemEditorProps> = ({ 
    item, 
    index, 
    updateItem 
}) => {
    return (
        <View style={styles.invoiceItem}>
            <TextInput
                style={styles.itemDescription}
                value={item.description}
                onChangeText={(text) => updateItem(index, 'description', text)}
                placeholder="Item description"
            />
            <View style={styles.itemDetails}>
                <TextInput
                    style={styles.itemQuantity}
                    value={String(item.quantity)}
                    onChangeText={(text) => updateItem(index, 'quantity', text)}
                    keyboardType="numeric"
                    placeholder="Qty"
                />
                <TextInput
                    style={styles.itemRate}
                    value={String(item.rate)}
                    onChangeText={(text) => updateItem(index, 'rate', text)}
                    keyboardType="numeric"
                    placeholder="Rate"
                />
                <Text style={styles.itemAmount}>
                    ${(item.quantity * item.rate).toFixed(2)}
                </Text>
            </View>
        </View>
    );
};

export default InvoiceItemEditor;