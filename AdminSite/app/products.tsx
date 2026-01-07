// @ts-nocheck
import {
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";
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
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState("");
  const [selectedProductName, setSelectedProductName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    ageRestriction: "",
    stock: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await getAllProducts();
    setProducts(data);
  };

  const generateQRCode = (productName: string): string => {
    // Generate unique QR code based on product name and timestamp
    const timestamp = Date.now();
    const normalized = productName.toLowerCase().replace(/\s+/g, "-");
    return `PRODUCT_${normalized}_${timestamp}`;
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
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

    let stock: number | undefined;
    if (formData.stock) {
      stock = parseInt(formData.stock);
      if (isNaN(stock) || stock < 0) {
        Alert.alert("Error", "Stock must be a valid number");
        return;
      }
    }

    // Generate QR code automatically
    const qrCode = editingProduct
      ? editingProduct.qrCode
      : generateQRCode(formData.name);

    const productData = {
      name: formData.name,
      price,
      qrCode,
      ageRestriction,
      stock,
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
      ageRestriction: product.ageRestriction?.toString() || "",
      stock: product.stock?.toString() || "",
    });
    setShowForm(true);
  };

  const handleViewQRCode = (product: Product) => {
    setSelectedQRCode(product.qrCode);
    setSelectedProductName(product.name);
    setShowQRModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      ageRestriction: "",
      stock: "",
    });
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

          <Text style={styles.label}>Stock (Optional)</Text>
          <TextInput
            value={formData.stock}
            onChangeText={(text: string) =>
              setFormData({ ...formData, stock: text })
            }
            style={styles.input}
            placeholder="0"
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
                QR Code: {product.qrCode}
              </Text>
              {product.ageRestriction && (
                <Text style={styles.productAge}>
                  Age {product.ageRestriction}+
                </Text>
              )}
              {product.stock !== undefined && (
                <Text
                  style={[
                    styles.productStock,
                    product.stock === 0 && styles.outOfStock,
                  ]}
                >
                  Stock: {product.stock}{" "}
                  {product.stock === 0 && "(Out of Stock)"}
                </Text>
              )}
            </View>

            <View style={styles.productActions}>
              <Pressable
                onPress={() => handleViewQRCode(product)}
                style={styles.viewQRButton}
              >
                <Text style={styles.viewQRButtonText}>View QR Code</Text>
              </Pressable>
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

      <Modal
        visible={showQRModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedProductName}</Text>
            <Text style={styles.modalQRText}>QR Code</Text>
            <View style={styles.qrCodeContainer}>
              <QRCode
                value={selectedQRCode}
                size={250}
                backgroundColor="white"
                color="black"
              />
            </View>
            <Text style={styles.qrCodeValue}>{selectedQRCode}</Text>
            <Pressable
              onPress={() => setShowQRModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
  productStock: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
  },
  outOfStock: {
    color: "#EF4444",
    fontWeight: "600",
  },
  productActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  viewQRButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewQRButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  modalQRText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 16,
  },
  qrCodeContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  qrCodeValue: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  modalCloseButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalCloseButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
