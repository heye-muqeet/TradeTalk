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
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import LottieView from "lottie-react-native";
import styles from "./LoginScreen.styles";
import { API } from "../../../constants/constants";

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    emailError: "",
    passwordError: "",
  });

  const [loader, setLoader] = useState<boolean>(false);

  // Handle input changes
  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  // Validate email
  useEffect(() => {
    if (values.email.length === 0) {
      setErrors((prev) => ({ ...prev, emailError: "" }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      setErrors((prev) => ({ ...prev, emailError: "Invalid email address" }));
    } else {
      setErrors((prev) => ({ ...prev, emailError: "" }));
    }
  }, [values.email]);

  // Validate password
  useEffect(() => {
    if (values.password.length === 0) {
      setErrors((prev) => ({ ...prev, passwordError: "" }));
      return;
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).+$/;
    if (values.password.length < 8) {
      setErrors((prev) => ({ ...prev, passwordError: "Password must be at least 8 characters long" }));
    } else if (!passwordRegex.test(values.password)) {
      setErrors((prev) => ({ ...prev, passwordError: "Password must contain letters and numbers" }));
    } else {
      setErrors((prev) => ({ ...prev, passwordError: "" }));
    }
  }, [values.password]);

  // Handle login submission
  const handleSubmit = async () => {
    if (!values.email) return Alert.alert("Required", "Please enter your email.");
    if (errors.emailError) return Alert.alert("Invalid Email", "Enter a valid email address.");
    if (!values.password) return Alert.alert("Required", "Please enter your password.");
    if (errors.passwordError) return Alert.alert("Weak Password", "Password should be at least 8 characters and contain letters & numbers.");

    setLoader(true);
    const apiUrl = `${API.BASE_URL}${API.ENDPOINTS.LOGIN}`;
    console.log("API URL:", apiUrl);

    try {

      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const result = await response.json();

      console.log("Login API Response:", result);

      if (response.ok) {
        Alert.alert("Success", "A verification code has been sent to your email.");
        navigation.navigate("Verification", { email: values.email, fromSignup: false }); // Navigate to verification screen
      } else {
        Alert.alert("Login Failed", "Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("Network Error", "Unable to connect to the server. Please check your internet connection.");
    }

    setLoader(false);
  };

  // Enable login button only if there are no errors
  const isLoginEnabled = values.email && values.password && !errors.emailError && !errors.passwordError;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? undefined : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.uperContainer}>
              <LottieView
                source={require("../../../assets/loaders/loader.json")}
                autoPlay
                loop
                style={styles.logoIconContainer}
              />
              <Text style={styles.upperText}>TradeTalk</Text>
            </View>

            <View style={styles.lowerContainer}>
              <LinearGradient
                colors={["#176b87", "#008c9b"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
              >
                <Text style={styles.mainHeading}>Login</Text>

                <View style={styles.LowerinnerContainer}>
                  {/* EMAIL */}
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

                  {/* PASSWORD */}
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

                  {/* LOGIN BUTTON */}
                  <TouchableOpacity
                    style={[styles.signupBtn, { opacity: isLoginEnabled ? 1 : 0.5 }]}
                    disabled={!isLoginEnabled || loader}
                    onPress={handleSubmit}
                  >
                    {loader ? <ActivityIndicator size={47} color={"#FFF"} /> : <Text style={styles.btnTxt}>Sign In</Text>}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity>
                  <Text style={styles.footerTxt}>Forgot Password?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("SignupScreen")}>
                  <Text style={styles.footerTxt}>Signup!</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;