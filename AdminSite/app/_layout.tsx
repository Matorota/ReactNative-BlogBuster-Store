// @ts-nocheck
import { Stack } from "expo-router";
import "./global.css";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="products" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="orders" />
    </Stack>
  );
}
