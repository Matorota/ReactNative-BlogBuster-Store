// @ts-nocheck
import { Text, View, Pressable, StyleSheet, Alert } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { createCart, getActiveCartsForUser } from "../services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const id = await AsyncStorage.getItem("userId");
    const name = await AsyncStorage.getItem("userName");

    if (!id) {
      router.replace("/welcome");
      return;
    }

    setUserId(id);
    setUserName(name || "User");
    setLoading(false);
  };

  const startShopping = async () => {
    setLoading(true);
    try {
      const activeCarts = await getActiveCartsForUser(userId);
      let cartId;

      if (activeCarts.length > 0) {
        cartId = activeCarts[0].id;
      } else {
        cartId = await createCart(userId);
      }

      await AsyncStorage.setItem("currentCartId", cartId);
      router.push("/scanner");
    } catch (error) {
      Alert.alert("Error", "Failed to start shopping");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove([
            "userId",
            "userEmail",
            "userName",
            "currentCartId",
          ]);
          router.replace("/welcome");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Hello,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>

        <Text style={styles.title}>Shop Smart</Text>
        <Text style={styles.subtitle}>Scan products or browse our catalog</Text>

        <View style={styles.buttonGroup}>
          <Pressable
            onPress={startShopping}
            disabled={loading}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Loading..." : "Scan Products"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/products")}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Browse Products</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/cart")}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>View Cart</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/orders")}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Order History</Text>
          </Pressable>
        </View>

        <Pressable onPress={logout} style={styles.logoutButton}>
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
  greeting: {
    alignSelf: "flex-start",
    marginBottom: 32,
  },
  greetingText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 16,
    marginBottom: 32,
    alignSelf: "flex-start",
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  buttonGroup: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#111827",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#1F2937",
    borderWidth: 2,
    borderColor: "#374151",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 24,
    paddingVertical: 12,
  },
  logoutButtonText: {
    color: "#EF4444",
    fontSize: 14,
  },
});
