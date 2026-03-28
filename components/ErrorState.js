import React from "react";
import { View, Text } from "react-native";

export default function ErrorState({ message }) {
  if (!message) return null;
  return (
    <View style={{ backgroundColor: "#fee2e2", borderRadius: 8, padding: 10, marginBottom: 10 }}>
      <Text style={{ color: "#991b1b" }}>{message}</Text>
    </View>
  );
}
