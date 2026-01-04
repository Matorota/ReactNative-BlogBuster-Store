// @ts-nocheck
import {
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { createUser, getUserByEmail } from "../services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dateOfBirth: "",
  });
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateDate = (date: string) => {
    // Format: YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) return false;

    const [year, month, day] = date.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);

    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getDate() !== day
    ) {
      return false;
    }

    // Check if user is at least 13 years old
    const today = new Date();
    const age = today.getFullYear() - year;
    return age >= 13;
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (!validateDate(formData.dateOfBirth)) {
      Alert.alert(
        "Error",
        "Please enter a valid date of birth (YYYY-MM-DD). You must be at least 13 years old."
      );
      return;
    }

    setLoading(true);
    try {
      // Check if user already exists
      const existingUser = await getUserByEmail(formData.email);
      if (existingUser) {
        Alert.alert("Error", "An account with this email already exists");
        setLoading(false);
        return;
      }

      // Create user
      const [year, month, day] = formData.dateOfBirth.split("-").map(Number);
      const userId = await createUser({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        dateOfBirth: new Date(year, month - 1, day),
      });

      // Save user session
      await AsyncStorage.setItem("userId", userId);
      await AsyncStorage.setItem(
        "userEmail",
        formData.email.toLowerCase().trim()
      );
      await AsyncStorage.setItem("userName", formData.name.trim());

      Alert.alert("Success", "Account created successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/"),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join us and start shopping</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="John Doe"
              placeholderTextColor="#6B7280"
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="john@example.com"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              placeholder="******"
              placeholderTextColor="#6B7280"
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={formData.dateOfBirth}
              onChangeText={(text) =>
                setFormData({ ...formData, dateOfBirth: text })
              }
              placeholder="1990-01-31"
              placeholderTextColor="#6B7280"
              keyboardType="numbers-and-punctuation"
              editable={!loading}
            />
            <Text style={styles.hint}>You must be at least 13 years old</Text>
          </View>

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            style={[styles.registerButton, loading && styles.buttonDisabled]}
          >
            <Text style={styles.registerButtonText}>
              {loading ? "Creating Account..." : "Register"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            disabled={loading}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>
              Already have an account? Login
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
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
  hint: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4,
  },
  registerButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  registerButtonText: {
    color: "#111827",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    color: "#9CA3AF",
    textAlign: "center",
    fontSize: 14,
  },
});
