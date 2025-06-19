import { PermissionsAndroid, Alert } from "react-native";

export const requestMicPermission = async (
    setHasMicPermission: (value: boolean) => void
): Promise<boolean> => {
    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
            title: "Microphone Permission",
            message: "This app needs access to your microphone for voice input.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
        }
    );
    setHasMicPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
};