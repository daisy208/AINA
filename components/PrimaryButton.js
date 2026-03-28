import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

export default function PrimaryButton({ title, onPress, danger = false }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, danger ? styles.danger : styles.normal, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  normal: {
    backgroundColor: "#4f46e5",
  },
  danger: {
    backgroundColor: "#dc2626",
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
