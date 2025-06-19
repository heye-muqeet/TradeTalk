import React from "react";
import { TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import LottieView from "lottie-react-native";
import styles from "../InvoiceScreen.styles";
import { THEME } from "../../../constants/constants";

interface VoiceButtonProps {
    isListening: boolean;
    onStartListening: () => void;
    onStopListening: () => void;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ 
    isListening, 
    onStartListening,
    onStopListening 
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.micButton, 
                { backgroundColor: isListening ? THEME.TRANSPARENT : THEME.PRIMARY }
            ]}
            onPress={onStartListening}
            disabled={isListening}
        >
            {isListening ? (
                <TouchableOpacity onPress={onStopListening} activeOpacity={0.7}>
                    <LottieView
                        source={require("../../../assets/loaders/loader.json")}
                        autoPlay
                        loop
                        style={styles.micAnimation}
                    />
                </TouchableOpacity>
            ) : (
                <Icon name="mic" size={30} color="white" />
            )}
        </TouchableOpacity>
    );
};

export default VoiceButton;
