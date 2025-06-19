import { StyleSheet } from "react-native";
import { THEME, COLORS, FONTS } from "../../constants/constants";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.SECONDARY,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: THEME.PRIMARY,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: THEME.WHITE,
    },
    chatContainer: {
        padding: 16,
        paddingBottom: 80,
    },
    messageBubble: {
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        maxWidth: "80%",
    },
    userBubble: {
        backgroundColor: THEME.PRIMARY,
        alignSelf: "flex-end",
    },
    aiBubble: {
        backgroundColor: THEME.DARK,
        alignSelf: "flex-start",
    },
    messageText: {
        color: THEME.WHITE,
        fontSize: 16,
    },
    micButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: THEME.PRIMARY,
    },
    micAnimation: {
        width: 60,
        height: 60,
    },

    // Options container
    optionsContainer: {
        position: "absolute",
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    optionButton: {
        backgroundColor: THEME.PRIMARY,
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 20,
        paddingHorizontal: 20,
    },
    optionText: {
        color: THEME.WHITE,
        marginLeft: 8,
        fontFamily: FONTS.BOLD,
    },

    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: THEME.SECONDARY,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: THEME.WHITE,
        borderBottomWidth: 1,
        borderBottomColor: THEME.LIGHT,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: FONTS.BOLD,
        color: THEME.PRIMARY,
    },

    // Manual editor styles
    editorContainer: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: FONTS.SEMIBOLD,
        marginVertical: 12,
        color: THEME.BLACK,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontFamily: FONTS.MEDIUM,
        marginBottom: 8,
        color: THEME.BLACK_DARK,
    },
    textInput: {
        backgroundColor: THEME.WHITE,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: THEME.LIGHT,
        fontSize: 16,
        fontFamily: FONTS.REGULAR,
        color: THEME.BLACK_DARK,
    },
    notesInput: {
        height: 100,
        textAlignVertical: "top",
    },

    // Template selection
    templateContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 16,
    },
    templateItem: {
        backgroundColor: THEME.WHITE,
        padding: 12,
        borderRadius: 8,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: THEME.LIGHT,
    },
    selectedTemplate: {
        backgroundColor: THEME.PRIMARY_LIGHT,
        borderColor: THEME.PRIMARY,
    },
    templateText: {
        color: THEME.BLACK,
        fontSize: 13,
        fontFamily: FONTS.REGULAR
    },

    // Invoice items
    invoiceItem: {
        backgroundColor: THEME.WHITE,
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: THEME.LIGHT,
    },
    itemDescription: {
        fontSize: 16,
        fontFamily: FONTS.REGULAR,
        marginBottom: 8,
        color: THEME.BLACK_DARK,
    },
    itemDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    itemQuantity: {
        width: "20%",
        padding: 8,
        borderWidth: 1,
        borderColor: THEME.LIGHT,
        borderRadius: 4,
        textAlign: "center",
        fontFamily: FONTS.MEDIUM,
        color: THEME.BLACK,
    },
    itemRate: {
        width: "30%",
        padding: 8,
        borderWidth: 1,
        borderColor: THEME.LIGHT,
        borderRadius: 4,
        textAlign: "center",
        fontFamily: FONTS.MEDIUM,
        color: THEME.BLACK,
    },
    itemAmount: {
        width: "30%",
        padding: 8,
        backgroundColor: THEME.LIGHT,
        borderRadius: 4,
        textAlign: "right",
        fontFamily: FONTS.BOLD,
        color: THEME.PRIMARY,
    },

    // Add item button
    addItemButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: THEME.PRIMARY,
        borderRadius: 8,
        marginBottom: 20,
    },
    addItemText: {
        color: THEME.PRIMARY,
        fontFamily: FONTS.BOLD,
        marginLeft: 8,
    },

    // Total section
    totalSection: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderColor: THEME.LIGHT,
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 18,
        fontFamily: FONTS.BOLD,
        marginRight: 12,
        color: THEME.BLACK,
    },
    totalAmount: {
        fontSize: 20,
        fontFamily: FONTS.BOLD,
        color: THEME.PRIMARY,
    },

    // Preview button
    previewButton: {
        backgroundColor: THEME.PRIMARY,
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 12,
        marginBottom: 40,
    },
    previewButtonText: {
        color: THEME.WHITE,
        fontSize: 18,
        fontFamily: FONTS.BOLD,
    },

    // Invoice preview styles
    previewContainer: {
        padding: 16,
        backgroundColor: THEME.LIGHT,
    },
    invoiceHeader: {
        backgroundColor: THEME.WHITE,
        padding: 20,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: "center",
    },
    invoiceTitle: {
        fontSize: 24,
        fontFamily: FONTS.BOLD,
        color: THEME.PRIMARY,
        marginBottom: 8,
    },
    invoiceDate: {
        fontSize: 16,
        fontFamily: FONTS.MEDIUM,
        color: THEME.BLACK_LIGHT,
    },
    clientSection: {
        backgroundColor: THEME.WHITE,
        padding: 20,
        borderRadius: 8,
        marginBottom: 16,
    },
    clientName: {
        fontSize: 18,
        fontWeight: "500",
        color: THEME.BLACK,
    },

    // Items table
    itemsTable: {
        backgroundColor: THEME.WHITE,
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 16,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: THEME.PRIMARY,
        padding: 12,
    },
    descriptionHeader: {
        flex: 3,
        color: THEME.WHITE,
        fontFamily: FONTS.SEMIBOLD,
    },
    qtyHeader: {
        flex: 1,
        color: THEME.WHITE,
        fontFamily: FONTS.SEMIBOLD,
        textAlign: "center",
    },
    rateHeader: {
        flex: 1,
        color: THEME.WHITE,
        fontFamily: FONTS.SEMIBOLD,
        textAlign: "right",
    },
    amountHeader: {
        flex: 2,
        color: THEME.WHITE,
        fontFamily: FONTS.SEMIBOLD,
        textAlign: "right",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: THEME.LIGHT,
        padding: 12,
    },
    descriptionCell: {
        flex: 3,
        color: THEME.BLACK,

    },
    qtyCell: {
        flex: 1,
        textAlign: "center",
        color: THEME.BLACK,
    },
    rateCell: {
        flex: 1,
        textAlign: "right",
        color: THEME.BLACK,
    },
    amountCell: {
        flex: 2,
        textAlign: "right",
        color: THEME.BLACK,
    },
    tableTotalRow: {
        flexDirection: "row",
        padding: 12,
        backgroundColor: THEME.LIGHT,
        justifyContent: "flex-end",
    },
    totalCell: {
        // flex: 1,
        textAlign: "right",
        fontFamily: FONTS.BOLD,
        fontSize: 16,
        color: THEME.BLACK,
    },
    totalValueCell: {
        flex: 1,
        textAlign: "right",
        fontFamily: FONTS.BOLD,
        fontSize: 16,
        color: THEME.PRIMARY,
    },

    // Notes section
    notesSection: {
        backgroundColor: THEME.WHITE,
        padding: 20,
        borderRadius: 8,
        marginBottom: 16,
    },
    notesText: {
        color: THEME.BLACK_LIGHT,
        fontSize: 16,
        fontFamily: FONTS.REGULAR,
        lineHeight: 22,
    },

    // Action buttons
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
        marginBottom: 40,
    },
    actionButton: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    editButton: {
        backgroundColor: THEME.WHITE,
        marginRight: 8,
        borderWidth: 1,
        borderColor: THEME.PRIMARY,
    },
    editButtonText: {
        color: THEME.PRIMARY,
        fontSize: 16,
        fontFamily: FONTS.BOLD,
    },
    sendButton: {
        backgroundColor: THEME.PRIMARY,
        marginLeft: 8,
    },
    sendButtonText: {
        color: THEME.WHITE,
        fontSize: 16,
        fontFamily: FONTS.BOLD,
    },
});

export default styles;