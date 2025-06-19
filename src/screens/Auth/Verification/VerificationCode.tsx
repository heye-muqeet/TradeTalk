import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { API, SCREENS, THEME } from "../../../constants/constants";
import { useNavigation, useRoute } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import styles from "./VerificationCode.styles";
import { setToken, setUser } from "../../../redux/app/appAction";
import { useAppDispatch } from "../../../redux/hooks";

const VerificationCode: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const route = useRoute<any>();
  const { email, fromSignup } = route.params || {};
  const dispatch = useAppDispatch();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loader, setLoader] = useState<boolean>(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Automatically focus on the next field when typing
  const handleChangeText = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;
    let newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (text === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Auto-submit if all fields are filled
    // if (index === 5 && text) {
    //   handleSubmit();
    // }
  };

  // Handle verification
  const handleSubmit = async () => {
    if (!email) {
      return Alert.alert("ERROR", "No email found. Please try again.");
    }
    if (code.some((num) => num === "")) {
      return Alert.alert("REQUIRED", "Please enter the verification code.");
    }

    const verificationCode = code.join("");
    setLoader(true);
    setError("");

    try {
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.VERIFY_VERIFICATION_CODE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, verificationCode }),
      });

      const result = await response.json();
      console.log("Verification API Response:", result);

      if (response.ok) {
        Alert.alert("Verification Successful!", "Your account has been verified.");
        const { user, token } = result;
        const { accessToken, refreshToken } = token;
        if (fromSignup) {
          // User signed up → Navigate to main screen as logged-in user
          dispatch(setUser(user));
          dispatch(setToken({ accessToken, refreshToken }));
          navigation.reset({
            index: 0,
            routes: [{ name: "MainScreen" }], // Replace "MainScreen" with your main app screen
          });
        } else {
          dispatch(setUser(user));
          dispatch(setToken({ accessToken, refreshToken }));
          // User logged in → Navigate to main screen
          console.log("I am here")
          navigation.reset({
            index: 0,
            routes: [{ name: SCREENS.MAIN }], // Replace "MainScreen" with your main app screen
          });
        }
      } else {
        setError(result.message || "Invalid code. Please try again.");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error("Verification Error:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    }

    setLoader(false);
  };

  // Resend Code Logic
  const handleResendCode = () => {
    setResendDisabled(true);
    setResendTimer(30);

    Alert.alert("Code Resent", "A new code has been sent to your email.");

    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          setResendDisabled(false);
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "padding"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.uperContainer}>
              <LottieView source={require("../../../assets/loaders/loader.json")} autoPlay loop style={styles.logoIconContainer} />
              <Text style={styles.upperText}>TradeTalk</Text>
            </View>

            <View style={styles.lowerContainer}>
              <LinearGradient colors={["#176b87", "#008c9b"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientBackground}>
                <Text style={styles.mainHeading}>Enter Verification Code</Text>

                <View style={styles.lowerLowerContainer}>
                  <Text style={styles.label}>VERIFICATION CODE</Text>
                  <View style={styles.codeInputContainer}>
                    {code.map((num, index) => (
                      <TextInput
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        style={[styles.codeInput, error ? styles.inputError : null]}
                        keyboardType="numeric"
                        maxLength={1}
                        value={num}
                        onChangeText={(text) => handleChangeText(text, index)}
                      />
                    ))}
                  </View>
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}

                  <TouchableOpacity
                    style={[styles.signupBtn, { opacity: code.every((num) => num !== "") ? 1 : 0.5 }]}
                    disabled={code.some((num) => num === "") || loader}
                    onPress={handleSubmit}
                  >
                    {loader ? <ActivityIndicator size={47} color={THEME.WHITE} /> : <Text style={styles.btnTxt}>Verify</Text>}
                  </TouchableOpacity>
                </View>

                <Text style={styles.footerTxt}>Didn’t receive a code?</Text>
                <TouchableOpacity onPress={handleResendCode} disabled={resendDisabled}>
                  <Text style={[styles.footerTxt, styles.txtDecoration, { opacity: resendDisabled ? 0.5 : 1 }]}>
                    {resendDisabled ? `Resend Code in ${resendTimer}s` : "Resend Code"}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default VerificationCode;
