// @ts-nocheck
import { Text, View, Pressable, Alert, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { getProductByBarcode, getCart, updateCart } from "../services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ShoppingCart, CartItem } from "../types";

export default function Scanner() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [cart, setCart] = useState<ShoppingCart | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const cartId = await AsyncStorage.getItem("currentCartId");
    if (cartId) {
      const cartData = await getCart(cartId);
      setCart(cartData);
    }
  };

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
      const product = await getProductByBarcode(data);

      if (!product) {
        Alert.alert("Product Not Found", "This product is not in our database");
        setTimeout(() => setScanned(false), 2000);
        return;
      }

      // Check if product is in stock
      if (product.stock !== undefined && product.stock <= 0) {
        Alert.alert(
          "Out of Stock",
          `${product.name} is currently out of stock`
        );
        setTimeout(() => setScanned(false), 2000);
        return;
      }

      if (cart) {
        const existingItemIndex = cart.items.findIndex(
          (item) => item.product.id === product.id
        );

        let newItems: CartItem[];
        if (existingItemIndex >= 0) {
          const currentQuantity = cart.items[existingItemIndex].quantity;

          // Check if adding one more would exceed stock
          if (
            product.stock !== undefined &&
            currentQuantity + 1 > product.stock
          ) {
            Alert.alert(
              "Stock Limit Reached",
              `Only ${product.stock} units of ${product.name} available`
            );
            setTimeout(() => setScanned(false), 2000);
            return;
          }

          newItems = [...cart.items];
          newItems[existingItemIndex].quantity += 1;
        } else {
          newItems = [...cart.items, { product, quantity: 1 }];
        }

        const totalPrice = newItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );

        await updateCart(cart.id, { items: newItems, totalPrice });

        Alert.alert(
          "Added to Cart",
          `${product.name} - €${product.price.toFixed(2)}`,
          [
            {
              text: "OK",
              onPress: () => setTimeout(() => setScanned(false), 500),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add product");
      setTimeout(() => setScanned(false), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            "qr",
            "ean13",
            "ean8",
            "code128",
            "code39",
            "code93",
            "upc_a",
            "upc_e",
          ],
        }}
      />

      <View style={styles.overlay}>
        <View style={styles.scannerLabel}>
          <Text style={styles.scannerText}>Scan Product Barcode</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/cart")}
          style={styles.cartButton}
        >
          <Text style={styles.cartButtonText}>View Cart</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
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
  buttonContainer: {
    position: "absolute",
    bottom: 48,
    left: 24,
    right: 24,
  },
  backButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  backButtonText: {
    color: "#000000",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  cartButton: {
    backgroundColor: "#1F2937",
    paddingVertical: 16,
    borderRadius: 12,
  },
  cartButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});
