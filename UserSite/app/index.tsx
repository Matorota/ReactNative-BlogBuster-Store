import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      <View className="w-64 h-40 bg-blue-500 rounded-lg shadow-lg border-2 border-blue-700 justify-center items-center mb-4">
        <Text className="text-white font-bold text-lg">NativeWind Box</Text>
        <Text className="text-blue-100 text-sm mt-2">Tailwind is working!</Text>
      </View>
    </View>
  );
}
