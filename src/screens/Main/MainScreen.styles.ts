import { StyleSheet } from 'react-native';
import { responsiveHorizontal, responsiveModerateScale, responsiveVertical } from '../../components/responsive';
import { COLORS, FONTS, THEME } from '../../constants/constants';


const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center",
        backgroundColor: THEME.BLACK
    },
    container: {
        flex: 1,
        alignItems: "center",
        padding: responsiveModerateScale(20),
        backgroundColor: "rgba(0, 0, 0, 0.3)", // Optional: Overlay for readability
    },
    logoutIcon: {
        position: "absolute",
        zIndex: 1,
        top: responsiveVertical(40), // Adjust as needed
        right: responsiveHorizontal(20), // Align to the right
    },
    moreIcon: {
        position: "absolute",
        top: responsiveVertical(40),
        left: responsiveHorizontal(30), // Adjust as needed
        zIndex: 10,
    },
    // lottie: {
    //     width: 300,
    //     height: 300,
    //     justifyContent: 'center',
    //     alignContent: 'center',
    //     alignSelf: 'center',
    //     alignItems: 'center',
    // },
    lottie: {
        position: "absolute", // Use absolute positioning
        top: "50%", // Center vertically
        left: "50%", // Center horizontally
        width: 300,
        height: 300,
        transform: [
            { translateX: responsiveHorizontal(-120) }, // Offset by half the width
            { translateY: responsiveVertical(-120) }, // Offset by half the height
        ], // Center the Lottie perfectly
    },
    plusButton: {
        position: "absolute",
        bottom: responsiveVertical(50),
        alignSelf: "center",
        zIndex: 200,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark background overlay
        justifyContent: "center",
        alignItems: "center",
    },

    modalContent: {
        width: "90%",
        backgroundColor: COLORS.WHITE,
        padding: responsiveModerateScale(20),
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: responsiveModerateScale(18),
        fontFamily: FONTS.BOLD,
        color: COLORS.BLACK,
        marginBottom: 15,
    },
    listeningIndicator: {
        alignItems: "center",
        marginBottom: responsiveVertical(15),
    },
    micAnimation: {
        width: responsiveHorizontal(150),
        height: responsiveVertical(150),
    },
    listeningText: {
        fontSize: responsiveModerateScale(16),
        fontFamily: FONTS.MEDIUM,
        color: THEME.PRIMARY,
        marginTop: responsiveVertical(5),
    },
    processingIndicator: {
        alignItems: "center",
        marginBottom: responsiveVertical(15),
    },
    processingText: {
        fontSize: responsiveModerateScale(16),
        fontFamily: FONTS.MEDIUM,
        color: THEME.PRIMARY,
    },
    optionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: responsiveVertical(15),
        paddingHorizontal: responsiveHorizontal(20),
        width: "100%",
        borderRadius: 20,
        // justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BACKGROUND.BLACK,
    },
    optionText: {
        fontSize: responsiveModerateScale(16),
        fontFamily: FONTS.MEDIUM,
        marginLeft: responsiveHorizontal(10),
        color: COLORS.BLACK,
    },
    closeButton: {
        marginTop: responsiveVertical(15),
        paddingVertical: responsiveModerateScale(10),
        width: '100%',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.BACKGROUND.PRIMARY,
    },
    closeText: {
        fontSize: responsiveModerateScale(16),
        fontFamily: FONTS.BOLD,
        color: COLORS.WHITE,
    },
    modePicker: {
        height: 50,
        width: "100%",
        color: COLORS.BLACK,
    },
    formLabel: {
        fontSize: 16,
        color: COLORS.BLACK,
        marginVertical: 5,
    },
    entryModeToggle: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: THEME.PRIMARY,
        padding: 10,
        borderRadius: 10,
        zIndex: 1000
    },
    entryModeText: {
        color: COLORS.WHITE,
        fontFamily: FONTS.MEDIUM
    },

    // Styles for the event details form
    formTitle: {
        fontSize: 18,
        fontFamily: FONTS.BOLD,
        textAlign: 'center',
        marginBottom: 20,
        color: THEME.PRIMARY
    },
    input: {
        borderWidth: 1,
        borderColor: THEME.BORDER,
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        backgroundColor: COLORS.WHITE
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top'
    },
    submitButton: {
        backgroundColor: THEME.PRIMARY,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10
    },
    submitButtonText: {
        color: COLORS.WHITE,
        fontFamily: FONTS.MEDIUM,
        fontSize: 16
    },
    confirmationDetails: {
        padding: 15,
        backgroundColor: COLORS.WHITE,
        borderRadius: 8,
        marginBottom: 20,
    },
    detailText: {
        fontSize: 16,
        color: COLORS.BLACK,
        marginBottom: 8,
        fontFamily: FONTS.REGULAR,
    },
    confirmationButtons: {
        width: '100%',
        gap: 10,
    },
    // confirmationButtons: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-around',
    //     width: '100%',
    //     marginTop: 20
    // },
    confirmButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 5,
        minWidth: 120
    },
    modifyButton: {
        backgroundColor: '#FFC107',
        padding: 15,
        borderRadius: 5,
        minWidth: 120
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    dropdownContainer: {
        width: "60%",
        alignSelf: "center",
        marginTop: 20,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: 8,
    },
    picker: {
        height: 50,
        width: "100%",
        color: COLORS.BLACK,
    },

});


export default styles;
