import React from "react";
import { View, Text } from "react-native";
import styles from "../InvoiceScreen.styles";
import { Message } from "./types";

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    return (
        <View style={[
            styles.messageBubble, 
            message.sender === "user" ? styles.userBubble : styles.aiBubble
        ]}>
            <Text style={styles.messageText}>{message.text}</Text>
        </View>
    );
};

export default ChatMessage;