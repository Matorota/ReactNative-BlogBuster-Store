// @ts-nocheck
import { Text, View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Shop Smart</Text>
        <Text style={styles.subtitle}>
          Scan products, manage your cart, and checkout with ease
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>SCAN</Text>
            <Text style={styles.featureText}>Scan Barcodes</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>BROWSE</Text>
            <Text style={styles.featureText}>Browse Products</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>PAY</Text>
            <Text style={styles.featureText}>Quick Checkout</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            onPress={() => router.push("/login")}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Login</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/register")}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </Pressable>
        </View>
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
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 16,
    marginBottom: 48,
    textAlign: "center",
    maxWidth: 320,
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 48,
  },
  feature: {
    alignItems: "center",
    flex: 1,
  },
  featureIcon: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#FFFFFF",
    backgroundColor: "#1F2937",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  featureText: {
    color: "#D1D5DB",
    fontSize: 12,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 320,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
