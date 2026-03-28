import React, { useEffect, useState } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import API from "../services/api";
import { encryptEvidence } from "../mobile/encryption";
import { buildReplayHeaders } from "../mobile/requestSecurity";
import { enqueueIncident, syncOfflineQueues } from "../mobile/offlineQueue";
import PrimaryButton from "../components/PrimaryButton";
import ErrorState from "../components/ErrorState";

export default function AddIncident() {
  const [desc, setDesc] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    syncOfflineQueues();
  }, []);

  const submit = async () => {
    try {
      setLoading(true);
      setError("");
      setStatus("Encrypting evidence...");

      if (!desc || !passphrase) {
        throw new Error("Description and passphrase are required");
      }

      const encrypted = await encryptEvidence(desc, passphrase);
      const analysisRes = await API.post("/incident/analyze", { text: desc });
      const payload = {
        type: analysisRes.data.analysis?.type || "verbal",
        encryptedText: encrypted.encrypted,
        evidenceHash: encrypted.hash,
        encryptionMeta: encrypted.meta,
        timestamp: new Date().toISOString(),
        aiResult: analysisRes.data.analysis,
      };

      const network = await NetInfo.fetch();
      if (!network.isConnected) {
        await enqueueIncident(payload);
        setStatus("Saved offline. Will sync when internet returns.");
        setDesc("");
        return;
      }

      const headers = await buildReplayHeaders();
      await API.post("/incident", payload, { headers });

      setDesc("");
      setStatus("Incident uploaded securely");
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      setStatus("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Incident Details (encrypted before upload)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Describe what happened"
        multiline
        value={desc}
        onChangeText={setDesc}
      />

      <Text style={styles.label}>Your passphrase (only you can decrypt)</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={passphrase}
        onChangeText={setPassphrase}
        placeholder="Enter evidence passphrase"
      />

      <Text style={styles.status}>Status: {status}</Text>
      <ErrorState message={error} />
      <PrimaryButton title={loading ? "Processing..." : "Submit Secure Incident"} onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, padding: 10, marginBottom: 12 },
  multiline: { minHeight: 120, textAlignVertical: "top" },
  status: { color: "#374151", marginBottom: 8 },
});
