// @ts-nocheck
import {
  Text,
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { listenToCarts, updateCart } from "../services/firebase";
import { ShoppingCart } from "../types";

export default function Orders() {
  const router = useRouter();
  const [carts, setCarts] = useState<ShoppingCart[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [editingCart, setEditingCart] = useState<ShoppingCart | null>(null);

  useEffect(() => {
    const unsubscribe = listenToCarts((data) => {
      setCarts(data);
    });
    return unsubscribe;
  }, []);

  const filteredCarts = carts.filter((cart) => {
    if (filter === "all") return true;
    return cart.status === filter;
  });

  const handleUpdateQuantity = (itemIndex: number, delta: number) => {
    if (!editingCart) return;

    const newItems = [...editingCart.items];
    newItems[itemIndex].quantity += delta;

    if (newItems[itemIndex].quantity <= 0) {
      newItems.splice(itemIndex, 1);
    }

    const totalPrice = newItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    setEditingCart({ ...editingCart, items: newItems, totalPrice });
  };

  const handleRemoveItem = (itemIndex: number) => {
    if (!editingCart) return;

    const newItems = [...editingCart.items];
    newItems.splice(itemIndex, 1);

    const totalPrice = newItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    setEditingCart({ ...editingCart, items: newItems, totalPrice });
  };

  const saveChanges = async () => {
    if (!editingCart) return;

    if (editingCart.items.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Cannot save an order with no items. Would you like to cancel this order?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Cancel Order",
            style: "destructive",
            onPress: async () => {
              await updateCart(editingCart.id, { status: "cancelled" });
              setEditingCart(null);
            },
          },
        ]
      );
      return;
    }

    try {
      await updateCart(editingCart.id, {
        items: editingCart.items,
        totalPrice: editingCart.totalPrice,
      });
      Alert.alert("Success", "Order updated");
      setEditingCart(null);
    } catch (error) {
      Alert.alert("Error", "Failed to update order");
    }
  };

  if (editingCart) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.editList}>
          {editingCart.items.map((item, index) => (
            <View key={index} style={styles.editCard}>
              <View style={styles.editCardHeader}>
                <View style={styles.editCardInfo}>
                  <Text style={styles.editCardName}>{item.product.name}</Text>
                  <Text style={styles.editCardPrice}>
                    €{item.product.price.toFixed(2)} each
                  </Text>
                </View>

                <Pressable
                  onPress={() => handleRemoveItem(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </Pressable>
              </View>

              <View style={styles.editCardFooter}>
                <View style={styles.quantityControls}>
                  <Pressable
                    onPress={() => handleUpdateQuantity(index, -1)}
                    style={styles.quantityButton}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </Pressable>

                  <Text style={styles.quantityText}>{item.quantity}</Text>

                  <Pressable
                    onPress={() => handleUpdateQuantity(index, 1)}
                    style={[styles.quantityButton, styles.quantityButtonPlus]}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </Pressable>
                </View>

                <Text style={styles.itemTotal}>
                  €{(item.product.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>
              €{editingCart.totalPrice.toFixed(2)}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={saveChanges} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>

          <Pressable
            onPress={() => setEditingCart(null)}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setFilter("all")}
          style={[
            styles.filterButton,
            filter === "all" && styles.filterButtonActive,
          ]}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilter("pending")}
          style={[
            styles.filterButton,
            filter === "pending" && styles.filterButtonActive,
          ]}
        >
          <Text
            style={[
              styles.filterText,
              filter === "pending" && styles.filterTextActive,
            ]}
          >
            Pending
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilter("completed")}
          style={[
            styles.filterButton,
            filter === "completed" && styles.filterButtonActive,
          ]}
        >
          <Text
            style={[
              styles.filterText,
              filter === "completed" && styles.filterTextActive,
            ]}
          >
            Completed
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.orderList}>
        {filteredCarts.length === 0 ? (
          <Text style={styles.emptyText}>No orders</Text>
        ) : (
          filteredCarts.map((cart) => (
            <View key={cart.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>
                    Order ID: {cart.id.slice(0, 8)}
                  </Text>
                  <Text style={styles.userId}>
                    User: {cart.userId.slice(0, 12)}
                  </Text>
                  <Text
                    style={[
                      styles.status,
                      cart.status === "completed" && styles.statusCompleted,
                      cart.status === "pending" && styles.statusPending,
                      cart.status === "active" && styles.statusActive,
                    ]}
                  >
                    {cart.status.toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.orderTotal}>
                  €{cart.totalPrice.toFixed(2)}
                </Text>
              </View>

              <View style={styles.orderItems}>
                {cart.items.map((item, idx) => (
                  <Text key={idx} style={styles.orderItem}>
                    {item.quantity}x {item.product.name}
                  </Text>
                ))}
              </View>

              {cart.status === "pending" && (
                <Pressable
                  onPress={() => setEditingCart(cart)}
                  style={styles.editOrderButton}
                >
                  <Text style={styles.editOrderButtonText}>Edit Order</Text>
                </Pressable>
              )}
            </View>
          ))
        )}
      </ScrollView>

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
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: "#1F2937",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#374151",
  },
  filterButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  filterText: {
    fontWeight: "600",
    color: "#FFFFFF",
  },
  filterTextActive: {
    color: "#1F2937",
  },
  orderList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  emptyText: {
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 40,
  },
  orderCard: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderId: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  userId: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 2,
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  statusCompleted: {
    color: "#10B981",
  },
  statusPending: {
    color: "#FBBF24",
  },
  statusActive: {
    color: "#3B82F6",
  },
  orderTotal: {
    color: "#10B981",
    fontSize: 18,
    fontWeight: "bold",
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingTop: 8,
    marginBottom: 8,
  },
  orderItem: {
    color: "#D1D5DB",
    fontSize: 14,
    marginBottom: 4,
  },
  editOrderButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  editOrderButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
  },
  editList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  editCard: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  editCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  editCardInfo: {
    flex: 1,
  },
  editCardName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  editCardPrice: {
    color: "#9CA3AF",
  },
  removeButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  editCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quantityButton: {
    backgroundColor: "#EF4444",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonPlus: {
    backgroundColor: "#10B981",
  },
  quantityButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  quantityText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  itemTotal: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  totalCard: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  totalLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  totalAmount: {
    color: "#10B981",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  saveButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  saveButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#4B5563",
    paddingVertical: 16,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  backButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: "#4B5563",
    paddingVertical: 16,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});
