// @ts-nocheck
import {
  Text,
  View,
  Pressable,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { useRouter } from "expo-router";
import { getCart, updateCart } from "../services/firebase";
import { ShoppingCart } from "../types";

export default function Checkout() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [cart, setCart] = useState<ShoppingCart | null>(null);
  const [customerAge, setCustomerAge] = useState("");
  const [showAgeVerification, setShowAgeVerification] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera permission required</Text>
          <Pressable onPress={requestPermission} style={styles.grantButton}>
            <Text style={styles.grantButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const cartData = await getCart(data);

      if (!cartData) {
        Alert.alert("Error", "Cart not found");
        setTimeout(() => setScanned(false), 2000);
        return;
      }

      if (cartData.status !== "pending") {
        Alert.alert("Error", "This cart is not ready for checkout");
        setTimeout(() => setScanned(false), 2000);
        return;
      }

      const hasAgeRestricted = cartData.items.some(
        (item) => item.product.ageRestriction
      );

      if (hasAgeRestricted) {
        setCart(cartData);
        setShowAgeVerification(true);
      } else {
        await completeCheckout(cartData);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to process checkout");
      setTimeout(() => setScanned(false), 2000);
    }
  };

  const completeCheckout = async (cartData: ShoppingCart) => {
    await updateCart(cartData.id, { status: "completed" });
    Alert.alert(
      "Checkout Complete",
      `Total: €${cartData.totalPrice.toFixed(2)}`,
      [
        {
          text: "OK",
          onPress: () => {
            setScanned(false);
            setCart(null);
            setCustomerAge("");
            setShowAgeVerification(false);
          },
        },
      ]
    );
  };

  const verifyAge = () => {
    if (!cart) return;

    const age = parseInt(customerAge);
    if (isNaN(age)) {
      Alert.alert("Error", "Enter valid age");
      return;
    }

    const maxAgeRestriction = Math.max(
      ...cart.items
        .filter((item) => item.product.ageRestriction)
        .map((item) => item.product.ageRestriction || 0)
    );

    if (age < maxAgeRestriction) {
      Alert.alert(
        "Age Verification Failed",
        `Customer must be at least ${maxAgeRestriction} years old`,
        [
          {
            text: "Cancel Order",
            onPress: async () => {
              await updateCart(cart.id, { status: "cancelled" });
              setScanned(false);
              setCart(null);
              setCustomerAge("");
              setShowAgeVerification(false);
            },
          },
        ]
      );
    } else {
      completeCheckout(cart);
    }
  };

  if (showAgeVerification && cart) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.verificationContainer}>
          <View style={styles.restrictedCard}>
            <Text style={styles.restrictedTitle}>Restricted Items:</Text>
            {cart.items
              .filter((item) => item.product.ageRestriction)
              .map((item, index) => (
                <Text key={index} style={styles.restrictedItem}>
                  {item.product.name} - Age {item.product.ageRestriction}+
                </Text>
              ))}
          </View>

          <Text style={styles.label}>Customer Age:</Text>
          <TextInput
            value={customerAge}
            onChangeText={setCustomerAge}
            style={styles.input}
            placeholder="Enter customer age"
            keyboardType="number-pad"
            placeholderTextColor="#6B7280"
          />

          <Pressable onPress={verifyAge} style={styles.verifyButton}>
            <Text style={styles.verifyButtonText}>Verify & Complete</Text>
          </Pressable>

          <Pressable
            onPress={async () => {
              await updateCart(cart.id, { status: "cancelled" });
              setScanned(false);
              setCart(null);
              setCustomerAge("");
              setShowAgeVerification(false);
            }}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      <View style={styles.overlay}>
        <View style={styles.scannerLabel}>
          <Text style={styles.scannerText}>Scan Customer QR Code</Text>
        </View>
      </View>

      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  permissionText: {
    color: "#D1D5DB",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  grantButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  grantButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  verificationContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  restrictedCard: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  restrictedTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  restrictedItem: {
    color: "#D1D5DB",
    marginBottom: 8,
  },
  label: {
    color: "#D1D5DB",
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1F2937",
    color: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  overlay: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  scannerLabel: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  scannerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    position: "absolute",
    bottom: 48,
    left: 24,
    right: 24,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 20,
  },
  backButtonText: {
    color: "#000000",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});
