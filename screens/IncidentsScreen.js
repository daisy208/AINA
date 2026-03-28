import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import API from "../services/api";
import { decryptEvidence } from "../mobile/encryption";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function IncidentsScreen() {
  const [data, setData] = useState([]);
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/incident")
      .then((res) => setData(res.data))
      .catch((e) => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, []);

  const decryptItem = (item) => {
    try {
      if (!passphrase) {
        throw new Error("Enter passphrase to decrypt");
      }
      return decryptEvidence(item.encryptedText, passphrase, item.encryptionMeta);
    } catch {
      return "Unable to decrypt (wrong passphrase or corrupted data).";
    }
  };

  if (loading) return <LoadingState label="Loading encrypted incidents..." />;

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        value={passphrase}
        onChangeText={setPassphrase}
        secureTextEntry
        placeholder="Enter your passphrase to decrypt"
      />
      <ErrorState message={error} />

      {data.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.type}>Type: {item.type}</Text>
          <Text>Severity: {item.aiSeverity || "N/A"}</Text>
          <Text>Detected who: {item.aiWho || "N/A"}</Text>
          <Text>When: {item.aiWhen || "N/A"}</Text>
          <Text style={styles.mono}>Hash: {item.evidenceHash.slice(0, 16)}...</Text>

          <Pressable style={styles.decryptButton}>
            <Text>{decryptItem(item)}</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, padding: 10, marginBottom: 12 },
  card: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, marginBottom: 12 },
  type: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  mono: { fontFamily: "monospace", fontSize: 12, marginVertical: 8 },
  decryptButton: { backgroundColor: "#f3f4f6", borderRadius: 8, padding: 10, marginTop: 8 },
});
