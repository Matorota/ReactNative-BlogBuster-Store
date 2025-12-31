// @ts-nocheck
import {
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { getUserByEmail } from "../services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const user = await getUserByEmail(email);

      if (!user) {
        Alert.alert(
          "Account Not Found",
          "No account exists with this email. Would you like to create one?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Register",
              onPress: () => router.push("/register"),
            },
          ]
        );
        setLoading(false);
        return;
      }

      // Save user session
      await AsyncStorage.setItem("userId", user.id);
      await AsyncStorage.setItem("userEmail", user.email);
      await AsyncStorage.setItem("userName", user.name);

      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to continue shopping</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="john@example.com"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={[styles.loginButton, loading && styles.buttonDisabled]}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Logging in..." : "Login"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/register")}
            disabled={loading}
            style={styles.registerLink}
          >
            <Text style={styles.registerLinkText}>
              Don't have an account? Register
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            disabled={loading}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 16,
    marginBottom: 32,
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#D1D5DB",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1F2937",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  loginButtonText: {
    color: "#111827",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerLink: {
    marginTop: 16,
    paddingVertical: 12,
  },
  registerLinkText: {
    color: "#9CA3AF",
    textAlign: "center",
    fontSize: 14,
  },
  backButton: {
    marginTop: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: "#6B7280",
    textAlign: "center",
    fontSize: 14,
  },
});
