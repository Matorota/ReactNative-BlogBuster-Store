// @ts-nocheck
import { Stack } from "expo-router";
import "./global.css";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="index" />
      <Stack.Screen name="scanner" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="products" />
      <Stack.Screen name="orders" />
    </Stack>
  );
}
