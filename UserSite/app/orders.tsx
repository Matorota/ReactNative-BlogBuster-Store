// @ts-nocheck
import {
  Text,
  View,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { getUserOrders } from "../services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Order } from "../types";

export default function OrderHistory() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "Please login first");
        router.push("/welcome");
        return;
      }

      console.log("Loading orders for user:", userId);
      const userOrders = await getUserOrders(userId);
      console.log("Orders loaded:", userOrders.length);
      setOrders(userOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      Alert.alert("Error", "Failed to load order history: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading order history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.orderList}
        contentContainerStyle={styles.orderListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#9CA3AF"
          />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>
              Start shopping to see your orders here
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{order.id.slice(-6)}</Text>
                <Text
                  style={[
                    styles.orderStatus,
                    { color: getStatusColor(order.status) },
                  ]}
                >
                  {order.status.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.orderDate}>
                {formatDate(order.createdAt)}
              </Text>

              <View style={styles.orderItems}>
                {order.items.map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <Text style={styles.itemName}>
                      {item.quantity}x {item.product.name}
                    </Text>
                    <Text style={styles.itemPrice}>
                      €{(item.product.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.orderTotal}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>
                  €{order.totalPrice.toFixed(2)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  header: {
    backgroundColor: "#1F2937",
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSpacer: {
    width: 40,
  },
  orderList: {
    flex: 1,
  },
  orderListContent: {
    padding: 16,
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: "center",
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#6B7280",
    fontSize: 14,
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
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: "bold",
  },
  orderDate: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 12,
  },
  orderItems: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemName: {
    color: "#D1D5DB",
    fontSize: 14,
    flex: 1,
  },
  itemPrice: {
    color: "#D1D5DB",
    fontSize: 14,
    fontWeight: "600",
  },
  orderTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  totalLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  totalAmount: {
    color: "#10B981",
    fontSize: 16,
    fontWeight: "bold",
  },
});
