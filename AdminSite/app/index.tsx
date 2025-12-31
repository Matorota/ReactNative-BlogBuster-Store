// @ts-nocheck
import { Text, View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

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
});
