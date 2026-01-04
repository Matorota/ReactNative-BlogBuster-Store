// @ts-nocheck
import {
  Text,
  View,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  getCart,
  updateCart,
  listenToCart,
  createOrder,
} from "../services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ShoppingCart } from "../types";
import QRCode from "react-native-qrcode-svg";

export default function Cart() {
  const router = useRouter();
  const [cart, setCart] = useState<ShoppingCart | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    // Listen for order completion
    if (cart && cart.status === "completed" && showQR) {
      setOrderCompleted(true);
    }
  }, [cart?.status]);

  const loadCart = async () => {
    const cartId = await AsyncStorage.getItem("currentCartId");
    if (cartId) {
      const unsubscribe = listenToCart(cartId, (cartData) => {
        setCart(cartData);
      });
      return unsubscribe;
    }
  };

  const updateItemQuantity = async (itemIndex: number, delta: number) => {
    if (!cart) return;

    const newItems = [...cart.items];
    newItems[itemIndex].quantity += delta;

    if (newItems[itemIndex].quantity <= 0) {
      newItems.splice(itemIndex, 1);
    }

    const totalPrice = newItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    await updateCart(cart.id, { items: newItems, totalPrice });
  };

  const proceedToCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      Alert.alert("Empty Cart", "Add items to your cart first");
      return;
    }

    try {
      // Create order record
      await createOrder({
        userId: cart.userId,
        cartId: cart.id,
        items: cart.items,
        totalPrice: cart.totalPrice,
        status: "pending",
      });

      // Update cart status
      await updateCart(cart.id, { status: "pending", qrCode: cart.id });
      setShowQR(true);
    } catch (error) {
      Alert.alert("Error", "Failed to create order");
    }
  };

  if (showQR && cart) {
    // Show order completion message when admin scans
    if (orderCompleted) {
      return (
        <View style={styles.completionContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <Text style={styles.completionTitle}>Order Complete!</Text>
          <Text style={styles.completionMessage}>
            Thanks for shopping with us!
          </Text>
          <Text style={styles.completionTotal}>
            Total Paid: €{cart.totalPrice.toFixed(2)}
          </Text>
          <Pressable
            onPress={async () => {
              setShowQR(false);
              setOrderCompleted(false);
              await AsyncStorage.removeItem("currentCartId");
              router.push("/");
            }}
            style={styles.doneButton}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
      );
    }

    // Show QR code while waiting for admin to scan
    return (
      <View style={styles.qrContainer}>
        <Text style={styles.qrTitle}>Show to Cashier</Text>
        <View style={styles.qrCodeWrapper}>
          <QRCode value={cart.id} size={250} />
        </View>
        <Text style={styles.qrTotal}>Total: €{cart.totalPrice.toFixed(2)}</Text>
        <Text style={styles.waitingText}>Waiting for checkout...</Text>
        <Pressable
          onPress={async () => {
            setShowQR(false);
            await updateCart(cart.id, { status: "active" });
          }}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancel Checkout</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Pressable onPress={() => router.back()} style={styles.headerClose}>
          <Text style={styles.headerCloseText}>X</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.cartList}>
        {!cart || cart.items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        ) : (
          cart.items.map((item, index) => (
            <View key={index} style={styles.cartItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemPrice}>
                  €{item.product.price.toFixed(2)} each
                </Text>
              </View>

              <View style={styles.quantityContainer}>
                <Pressable
                  onPress={() => updateItemQuantity(index, -1)}
                  style={styles.quantityButtonMinus}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </Pressable>

                <Text style={styles.quantityText}>{item.quantity}</Text>

                <Pressable
                  onPress={() => updateItemQuantity(index, 1)}
                  style={styles.quantityButtonPlus}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </Pressable>
              </View>

              <Text style={styles.itemTotal}>
                €{(item.product.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {cart && cart.items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>
              €{cart.totalPrice.toFixed(2)}
            </Text>
          </View>

          <Pressable onPress={proceedToCheckout} style={styles.checkoutButton}>
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
    backgroundColor: "#1F2937",
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCloseText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  cartList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
  },
  cartItem: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  itemInfo: {
    marginBottom: 12,
  },
  itemName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemPrice: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quantityButtonMinus: {
    backgroundColor: "#EF4444",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonPlus: {
    backgroundColor: "#10B981",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  quantityText: {
    color: "#FFFFFF",
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  itemTotal: {
    color: "#FFFFFF",
    textAlign: "right",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  totalLabel: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  totalAmount: {
    color: "#10B981",
    fontSize: 20,
    fontWeight: "bold",
  },
  checkoutButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: "#111827",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  qrContainer: {
    flex: 1,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  qrTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  qrCodeWrapper: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
  },
  qrTotal: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 24,
  },
  waitingText: {
    color: "#9CA3AF",
    fontSize: 16,
    marginTop: 16,
    fontStyle: "italic",
  },
  closeButton: {
    backgroundColor: "#4B5563",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 32,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  completionContainer: {
    flex: 1,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 64,
    fontWeight: "bold",
  },
  completionTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  completionMessage: {
    color: "#9CA3AF",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
  },
  completionTotal: {
    color: "#10B981",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 8,
  },
  doneButtonText: {
    color: "#111827",
    fontWeight: "bold",
    fontSize: 18,
  },
});
