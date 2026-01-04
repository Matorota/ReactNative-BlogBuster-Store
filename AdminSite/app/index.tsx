// @ts-nocheck
import { Text, View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const isLoggedIn = await AsyncStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      router.replace("/login");
    } else {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("isAdminLoggedIn");
    router.replace("/login");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Admin Panel</Text>

        <Pressable
          onPress={() => router.push("/products")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Manage Products</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/checkout")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Checkout Scanner</Text>
        </Pressable>

        <Pressable onPress={() => router.push("/orders")} style={styles.button}>
          <Text style={styles.buttonText}>View Orders</Text>
        </Pressable>

        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </View>
    </View>
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
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 48,
  },
  button: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: 256,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  logoutButton: {
    marginTop: 24,
    paddingVertical: 12,
  },
  logoutButtonText: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
  },
});
