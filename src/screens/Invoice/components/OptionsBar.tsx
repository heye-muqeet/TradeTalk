import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import styles from "../InvoiceScreen.styles";

interface OptionsBarProps {
    onManualInvoice: () => void;
}

const OptionsBar: React.FC<OptionsBarProps> = ({ onManualInvoice }) => {
    return (
        <View style={styles.optionsContainer}>
            <TouchableOpacity 
                style={styles.optionButton}
                onPress={onManualInvoice}
            >
                <Icon name="document-text-outline" size={20} color="white" />
                <Text style={styles.optionText}>Manual Invoice</Text>
            </TouchableOpacity>
        </View>
    );
};

export default OptionsBar;