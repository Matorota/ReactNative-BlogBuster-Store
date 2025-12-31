// @ts-nocheck
import {
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../services/firebase";
import { Product } from "../types";

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    barcode: "",
    ageRestriction: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await getAllProducts();
    setProducts(data);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.barcode) {
      Alert.alert("Error", "Fill all required fields");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Error", "Price must be greater than 0");
      return;
    }

    let ageRestriction: number | undefined;
    if (formData.ageRestriction) {
      ageRestriction = parseInt(formData.ageRestriction);
      if (isNaN(ageRestriction) || ageRestriction < 0) {
        Alert.alert("Error", "Age restriction must be a valid number");
        return;
      }
    }

    const productData = {
      name: formData.name,
      price,
      barcode: formData.barcode,
      ageRestriction,
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }

      resetForm();
      loadProducts();
    } catch (error) {
      Alert.alert("Error", "Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Product", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteProduct(id);
          loadProducts();
        },
      },
    ]);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      barcode: product.barcode,
      ageRestriction: product.ageRestriction?.toString() || "",
    });
    setShowForm(true);
  };

  const generateBarcode = () => {
    const randomBarcode = `BC${Date.now()}${Math.floor(Math.random() * 10000)}`;
    setFormData({ ...formData, barcode: randomBarcode });
  };

  const resetForm = () => {
    setFormData({ name: "", price: "", barcode: "", ageRestriction: "" });
    setEditingProduct(null);
    setShowForm(false);
  };

  if (showForm) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.formContainer}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            value={formData.name}
            onChangeText={(text: string) =>
              setFormData({ ...formData, name: text })
            }
            style={styles.input}
            placeholder="Enter product name"
            placeholderTextColor="#6B7280"
          />

          <Text style={styles.label}>Price</Text>
          <TextInput
            value={formData.price}
            onChangeText={(text: string) =>
              setFormData({ ...formData, price: text })
            }
            style={styles.input}
            placeholder="0.00"
            keyboardType="decimal-pad"
            placeholderTextColor="#6B7280"
          />

          <Text style={styles.label}>Barcode</Text>
          <View style={styles.barcodeRow}>
            <TextInput
              value={formData.barcode}
              onChangeText={(text: string) =>
                setFormData({ ...formData, barcode: text })
              }
              style={[styles.input, styles.barcodeInput]}
              placeholder="Enter barcode"
              placeholderTextColor="#6B7280"
            />
            <Pressable onPress={generateBarcode} style={styles.generateButton}>
              <Text style={styles.generateButtonText}>Generate</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Age Restriction (Optional)</Text>
          <TextInput
            value={formData.ageRestriction}
            onChangeText={(text: string) =>
              setFormData({ ...formData, ageRestriction: text })
            }
            style={styles.input}
            placeholder="18"
            keyboardType="number-pad"
            placeholderTextColor="#6B7280"
          />

          <Pressable onPress={handleSubmit} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>
              {editingProduct ? "Update Product" : "Add Product"}
            </Text>
          </Pressable>

          <Pressable onPress={resetForm} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.productList}>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>
                €{product.price.toFixed(2)}
              </Text>
              <Text style={styles.productBarcode}>
                Barcode: {product.barcode}
              </Text>
              {product.ageRestriction && (
                <Text style={styles.productAge}>
                  Age {product.ageRestriction}+
                </Text>
              )}
            </View>

            <View style={styles.productActions}>
              <Pressable
                onPress={() => handleEdit(product)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
              <Pressable
                onPress={() => handleDelete(product.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={() => setShowForm(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add New Product</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
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
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  label: {
    color: "#D1D5DB",
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#1F2937",
    color: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  barcodeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  barcodeInput: {
    flex: 1,
    marginBottom: 0,
  },
  generateButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 8,
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
  productList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
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
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  productPrice: {
    color: "#9CA3AF",
    marginBottom: 2,
  },
  productBarcode: {
    color: "#6B7280",
    fontSize: 12,
  },
  productAge: {
    color: "#FBBF24",
    fontSize: 12,
    marginTop: 4,
  },
  productActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  addButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  addButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  backButton: {
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
