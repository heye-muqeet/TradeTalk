import React from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { InvoiceInfo } from "../types/types";
import styles from "../MainScreen.styles";
import { COLORS, THEME } from "../../../constants/constants";

interface ModalComponentProps {
  isVisible: boolean;
  modalType: "eventConfirmation" | "invoiceConfirmation" | "quoteConfirmation" | "convertQuote" | "manualEntry" | null;
  onClose: () => void;
  onConfirm?: () => void;
  onModify?: () => void;
  onConvertQuote?: () => void;
  isProcessing?: boolean;
  eventTitle?: string;
  parsedDate?: Date | null;
  invoiceDetails?: InvoiceInfo;
  handleViewEvents?: () => void;
  handleScheduleEvent?: () => void;
  handleViewInvoices?: () => void;
  handleSignOut?: () => void;
  handleConvertQuote?: () => void;
  isAuthenticated?: boolean;
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  isVisible,
  modalType,
  onClose,
  onConfirm,
  onModify,
  onConvertQuote,
  isProcessing,
  eventTitle,
  parsedDate,
  invoiceDetails,
  handleViewEvents,
  handleScheduleEvent,
  handleViewInvoices,
  handleSignOut,
  handleConvertQuote,
  isAuthenticated,
}) => {
  const renderContent = () => {
    switch (modalType) {
      case "eventConfirmation":
        return (
          <>
            <Text style={styles.modalTitle}>Confirm Event Details</Text>
            <View style={styles.confirmationDetails}>
              <Text style={styles.detailText}>Title: {eventTitle}</Text>
              <Text style={styles.detailText}>Date: {parsedDate?.toDateString()}</Text>
              <Text style={styles.detailText}>Time: {parsedDate?.toLocaleTimeString()}</Text>
              <Text style={styles.detailText}>Duration: 1 hour</Text>
            </View>
            {isProcessing ? (
              <View style={styles.processingIndicator}>
                <ActivityIndicator size="large" color={THEME.PRIMARY} />
                <Text style={styles.processingText}>Saving...</Text>
              </View>
            ) : (
              <View style={styles.confirmationButtons}>
                <TouchableOpacity
                  style={[styles.optionButton, { backgroundColor: THEME.PRIMARY }]}
                  onPress={onConfirm}
                >
                  <Text style={[styles.optionText, { color: COLORS.WHITE }]}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, { backgroundColor: COLORS.GRAY }]}
                  onPress={onModify}
                >
                  <Text style={styles.optionText}>Modify</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        );
      case "invoiceConfirmation":
      case "quoteConfirmation":
        return (
          <>
            <Text style={styles.modalTitle}>
              {modalType === "quoteConfirmation" ? "Confirm Quote Details" : "Confirm Invoice Details"}
            </Text>
            <View style={styles.confirmationDetails}>
              <Text style={styles.detailText}>Client: {invoiceDetails?.clientName}</Text>
              <Text style={styles.detailText}>Job: {invoiceDetails?.jobDescription}</Text>
              {modalType === "invoiceConfirmation" && (
                <Text style={styles.detailText}>Amount: ${invoiceDetails?.amount}</Text>
              )}
              {invoiceDetails?.salesTax !== null && (
                <Text style={styles.detailText}>Sales Tax: ${invoiceDetails?.salesTax}</Text>
              )}
              {invoiceDetails?.type && (
                <Text style={styles.detailText}>Type: {invoiceDetails?.type}</Text>
              )}
              {invoiceDetails?.date && (
                <Text style={styles.detailText}>
                  Date: {new Date(invoiceDetails.date).toDateString()}
                </Text>
              )}
              <Text style={styles.detailText}>
                Payment Terms: {invoiceDetails?.paymentTerms || "Due upon receipt"}
              </Text>
              {invoiceDetails?.email && (
                <Text style={styles.detailText}>Email: {invoiceDetails?.email}</Text>
              )}
              {invoiceDetails?.phoneNumber && (
                <Text style={styles.detailText}>Phone: {invoiceDetails?.phoneNumber}</Text>
              )}
              {invoiceDetails?.sendMethod && (
                <Text style={styles.detailText}>Send Method: {invoiceDetails?.sendMethod}</Text>
              )}
              {invoiceDetails?.status && (
                <Text style={styles.detailText}>Status: {invoiceDetails?.status}</Text>
              )}
            </View>
            {isProcessing ? (
              <View style={styles.processingIndicator}>
                <ActivityIndicator size="large" color={THEME.PRIMARY} />
                <Text style={styles.processingText}>
                  {modalType === "quoteConfirmation" ? "Saving..." : "Saving and Sending..."}
                </Text>
              </View>
            ) : (
              <View style={styles.confirmationButtons}>
                <TouchableOpacity
                  style={[styles.optionButton, { backgroundColor: THEME.PRIMARY }]}
                  onPress={onConfirm}
                >
                  <Text style={[styles.optionText, { color: COLORS.WHITE }]}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, { backgroundColor: COLORS.GRAY }]}
                  onPress={onModify}
                >
                  <Text style={styles.optionText}>Modify</Text>
                </TouchableOpacity>
                {modalType === "quoteConfirmation" && (
                  <TouchableOpacity
                    style={[styles.optionButton, { backgroundColor: THEME.SECONDARY }]}
                    onPress={onConvertQuote}
                  >
                    <Text style={[styles.optionText, { color: COLORS.WHITE }]}>Convert to Invoice</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        );
      case "convertQuote":
        return (
          <>
            <Text style={styles.modalTitle}>Convert Quote to Invoice</Text>
            <View style={styles.confirmationDetails}>
              <Text style={styles.detailText}>Client: {invoiceDetails?.clientName}</Text>
              <Text style={styles.detailText}>Job: {invoiceDetails?.jobDescription}</Text>
              <Text style={styles.detailText}>
                Amount: {invoiceDetails?.amount ? `$${invoiceDetails.amount}` : "Pending"}
              </Text>
              {invoiceDetails?.salesTax !== null && (
                <Text style={styles.detailText}>Sales Tax: ${invoiceDetails?.salesTax}</Text>
              )}
              {invoiceDetails?.type && (
                <Text style={styles.detailText}>Type: {invoiceDetails?.type}</Text>
              )}
              {invoiceDetails?.date && (
                <Text style={styles.detailText}>
                  Date: {new Date(invoiceDetails.date).toDateString()}
                </Text>
              )}
              <Text style={styles.detailText}>
                Payment Terms: {invoiceDetails?.paymentTerms || "Due upon receipt"}
              </Text>
              {invoiceDetails?.email && (
                <Text style={styles.detailText}>Email: {invoiceDetails?.email}</Text>
              )}
              {invoiceDetails?.phoneNumber && (
                <Text style={styles.detailText}>Phone: {invoiceDetails?.phoneNumber}</Text>
              )}
              {invoiceDetails?.sendMethod && (
                <Text style={styles.detailText}>Send Method: {invoiceDetails?.sendMethod}</Text>
              )}
              {invoiceDetails?.status && (
                <Text style={styles.detailText}>Status: {invoiceDetails?.status}</Text>
              )}
            </View>
            {isProcessing ? (
              <View style={styles.processingIndicator}>
                <ActivityIndicator size="large" color={THEME.PRIMARY} />
                <Text style={styles.processingText}>Converting...</Text>
              </View>
            ) : (
              <View style={styles.confirmationButtons}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: invoiceDetails?.amount ? THEME.PRIMARY : COLORS.GRAY,
                    },
                  ]}
                  onPress={onConfirm}
                  disabled={!invoiceDetails?.amount}
                >
                  <Text style={[styles.optionText, { color: COLORS.WHITE }]}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        );
      case "manualEntry":
        return (
          <>
            <Text style={styles.modalTitle}>Manual Entry Options</Text>
            {isProcessing ? (
              <View style={styles.processingIndicator}>
                <ActivityIndicator size="large" color={THEME.PRIMARY} />
                <Text style={styles.processingText}>Processing...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity style={styles.optionButton} onPress={handleViewEvents}>
                  <Icon name="list" size={30} color={THEME.PRIMARY} />
                  <Text style={styles.optionText}>Event List</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton} onPress={handleScheduleEvent}>
                  <Icon name="calendar-outline" size={30} color={THEME.PRIMARY} />
                  <Text style={styles.optionText}>Schedule Event</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton} onPress={handleViewInvoices}>
                  <Icon name="document-text-outline" size={30} color={THEME.PRIMARY} />
                  <Text style={styles.optionText}>View Invoices</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton} onPress={handleConvertQuote}>
                  <Icon name="swap-horizontal-outline" size={30} color={THEME.PRIMARY} />
                  <Text style={styles.optionText}>Convert to Invoice</Text>
                </TouchableOpacity>
                {isAuthenticated && (
                  <TouchableOpacity style={styles.optionButton} onPress={handleSignOut}>
                    <Icon name="log-out-outline" size={30} color={THEME.PRIMARY} />
                    <Text style={styles.optionText}>Sign Out</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>{renderContent()}</View>
      </View>
    </Modal>
  );
};

export default ModalComponent;