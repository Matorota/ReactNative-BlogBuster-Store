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
import {
  getAllProducts,
  getCart,
  updateCart,
  createCart,
  getActiveCartsForUser,
} from "../services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product, CartItem } from "../types";

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    initCart();
  }, []);

  const initCart = async () => {
    let storedCartId = await AsyncStorage.getItem("currentCartId");

    if (!storedCartId) {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "Please login first");
        router.push("/welcome");
        return;
      }

      const activeCarts = await getActiveCartsForUser(userId);
      if (activeCarts.length > 0) {
        storedCartId = activeCarts[0].id;
      } else {
        storedCartId = await createCart(userId);
      }
      await AsyncStorage.setItem("currentCartId", storedCartId);
    }

    setCartId(storedCartId);
  };

  const loadProducts = async () => {
    try {
      const allProducts = await getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const addToCart = async (product: Product) => {
    if (!cartId) {
      Alert.alert("Error", "Cart not initialized");
      return;
    }

    // Check if product is in stock
    if (product.stock !== undefined && product.stock <= 0) {
      Alert.alert("Out of Stock", `${product.name} is currently out of stock`);
      return;
    }

    try {
      const cart = await getCart(cartId);
      if (!cart) {
        Alert.alert("Error", "Cart not found");
        return;
      }

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
        `${product.name} has been added to your cart`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Products</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.productList}
        contentContainerStyle={styles.productListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#9CA3AF"
          />
        }
      >
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products available</Text>
          </View>
        ) : (
          products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productBarcode}>
                  Barcode: {product.barcode}
                </Text>
                {product.ageRestriction && (
                  <Text style={styles.productAge}>
                    Age {product.ageRestriction}+
                  </Text>
                )}
                {product.stock !== undefined && product.stock <= 0 && (
                  <Text style={styles.outOfStock}>OUT OF STOCK</Text>
                )}
              </View>

              <View style={styles.productActions}>
                <Text style={styles.productPrice}>
                  €{product.price.toFixed(2)}
                </Text>
                <Pressable
                  onPress={() => addToCart(product)}
                  style={[
                    styles.addButton,
                    product.stock !== undefined &&
                      product.stock <= 0 &&
                      styles.addButtonDisabled,
                  ]}
                  disabled={product.stock !== undefined && product.stock <= 0}
                >
                  <Text style={styles.addButtonText}>
                    {product.stock !== undefined && product.stock <= 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
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
  productList: {
    flex: 1,
  },
  productListContent: {
    padding: 16,
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: "center",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
  },
  productCard: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  productInfo: {
    marginBottom: 12,
  },
  productName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  productBarcode: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 2,
  },
  productAge: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "600",
  },
  outOfStock: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },
  productActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    color: "#10B981",
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addButtonDisabled: {
    backgroundColor: "#4B5563",
    opacity: 0.6,
  },
  addButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  cartButton: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 8,
  },
  cartButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
