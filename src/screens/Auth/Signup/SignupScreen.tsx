import React, { useState, useEffect } from "react";
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
import { API, THEME } from "../../../constants/constants";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import LottieView from "lottie-react-native";
import styles from "./SignupScreen.styles";

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [values, setValues] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    emailError: "",
    passwordError: "",
    confirmPasswordError: "",
  });

  const [loader, setLoader] = useState<boolean>(false);

  // Handle input changes
  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  // Validate email
  useEffect(() => {
    if (!values.email) {
      setErrors((prev) => ({ ...prev, emailError: "" }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setErrors((prev) => ({
      ...prev,
      emailError: emailRegex.test(values.email) ? "" : "Enter a valid email address.",
    }));
  }, [values.email]);

  // Validate password
  useEffect(() => {
    if (!values.password) {
      setErrors((prev) => ({ ...prev, passwordError: "" }));
      return;
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).+$/;
    if (values.password.length < 8) {
      setErrors((prev) => ({ ...prev, passwordError: "Password must be at least 8 characters long." }));
    } else if (!passwordRegex.test(values.password)) {
      setErrors((prev) => ({ ...prev, passwordError: "Password must contain both letters and numbers." }));
    } else {
      setErrors((prev) => ({ ...prev, passwordError: "" }));
    }
  }, [values.password]);

  // Validate confirm password
  useEffect(() => {
    if (!values.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPasswordError: "" }));
      return;
    }

    setErrors((prev) => ({
      ...prev,
      confirmPasswordError: values.confirmPassword === values.password ? "" : "Passwords do not match.",
    }));
  }, [values.confirmPassword, values.password]);

  const handleSubmit = async () => {
    if (!values.email) return Alert.alert("REQUIRED", "Please enter an email.");
    if (errors.emailError) return Alert.alert("INVALID EMAIL", errors.emailError);
    if (!values.password) return Alert.alert("REQUIRED", "Please enter a password.");
    if (errors.passwordError) return Alert.alert("WEAK PASSWORD", errors.passwordError);
    if (errors.confirmPasswordError) return Alert.alert("PASSWORD MISMATCH", errors.confirmPasswordError);

    setLoader(true);

    try {
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.SIGN_UP}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (response.ok) {
        Alert.alert(
          "Signup Successful!",
          "A verification code has been sent to your email. Please verify your account."
        );

        // Navigate to verification screen
        navigation.navigate("Verification", { email: values.email, fromSignup: true });

        // Reset form
        setValues({ email: "", password: "", confirmPassword: "" });
        setErrors({ emailError: "", passwordError: "", confirmPasswordError: "" });
      } else {
        Alert.alert("Signup Failed", result.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      Alert.alert("Network Error", "Unable to connect to the server. Please check your internet connection.");
    }

    setLoader(false);
  };

  const isSignupEnabled =
    values.email && values.password && values.confirmPassword && !errors.emailError && !errors.passwordError && !errors.confirmPasswordError;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? undefined : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.uperContainer}>
              <LottieView source={require("../../../assets/loaders/loader.json")} autoPlay loop style={styles.logoIconContainer} />
              <Text style={styles.upperText}>TradeTalk</Text>
            </View>

            <View style={styles.lowerContainer}>
              <LinearGradient colors={["#176b87", "#008c9b"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientBackground}>
                <Text style={styles.mainHeading}>Create New Account</Text>

                <View style={styles.lowerLowerContainer}>
                  <Text style={styles.label}>EMAIL</Text>
                  <TextInput
                    style={[styles.textInput, errors.emailError ? styles.inputError : null]}
                    placeholder="Enter Your Email"
                    placeholderTextColor={"#89C2D6"}
                    onChangeText={(text) => handleChange("email", text)}
                    value={values.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {errors.emailError ? <Text style={styles.errorText}>{errors.emailError}</Text> : null}

                  <Text style={styles.label}>PASSWORD</Text>
                  <TextInput
                    style={[styles.textInput, errors.passwordError ? styles.inputError : null]}
                    secureTextEntry={true}
                    placeholder="Enter Password"
                    placeholderTextColor={"#89C2D6"}
                    onChangeText={(text) => handleChange("password", text)}
                    value={values.password}
                  />
                  {errors.passwordError ? <Text style={styles.errorText}>{errors.passwordError}</Text> : null}

                  <Text style={styles.label}>CONFIRM PASSWORD</Text>
                  <TextInput
                    style={[styles.textInput, errors.confirmPasswordError ? styles.inputError : null]}
                    secureTextEntry={true}
                    placeholder="Re-enter Password"
                    placeholderTextColor={"#89C2D6"}
                    onChangeText={(text) => handleChange("confirmPassword", text)}
                    value={values.confirmPassword}
                  />
                  {errors.confirmPasswordError ? <Text style={styles.errorText}>{errors.confirmPasswordError}</Text> : null}

                  <TouchableOpacity
                    style={[styles.signupBtn, { opacity: isSignupEnabled ? 1 : 0.5 }]}
                    disabled={!isSignupEnabled || loader}
                    onPress={handleSubmit}
                  >
                    {loader ? <ActivityIndicator size={47} color={THEME.WHITE} /> : <Text style={styles.btnTxt}>Sign Up</Text>}
                  </TouchableOpacity>
                </View>

                <Text style={styles.footerTxt}>Already Have an Account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
                  <Text style={[styles.footerTxt, styles.txtDecoration]}>Login!</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignupScreen;
