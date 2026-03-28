import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

export default function LoadingState({ label = "Loading..." }) {
  return (
    <View style={{ padding: 20, alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 8 }}>{label}</Text>
    </View>
  );
}
