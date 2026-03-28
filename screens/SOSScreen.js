import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import API from "../services/api";
import { captureCurrentLocation, recordEmergencyAudio } from "../mobile/sos";
import { encryptEvidence } from "../mobile/encryption";
import { enqueueSOS, syncOfflineQueues } from "../mobile/offlineQueue";
import { buildReplayHeaders } from "../mobile/requestSecurity";
import ErrorState from "../components/ErrorState";

export default function SOSScreen() {
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");
  const [silentMode, setSilentMode] = useState(false);

  useEffect(() => {
    syncOfflineQueues();
  }, []);

  const postSOSWithRetry = async (payload) => {
    let attempt = 0;
    while (attempt < 3) {
      try {
        const headers = await buildReplayHeaders();
        await API.post("/sos/trigger", { ...payload, retryCount: attempt }, { headers });
        return;
      } catch {
        attempt += 1;
      }
    }
    throw new Error("Network retry exhausted");
  };

  const triggerSOS = async () => {
    try {
      setError("");
      setStatus("Capturing location...");
      const location = await captureCurrentLocation();

      setStatus("Recording emergency audio...");
      const audio = await recordEmergencyAudio(30);

      setStatus("Encrypting audio...");
      const encryptedAudio = await encryptEvidence(audio.base64, "sos-default-passphrase");

      const payload = {
        location,
        encryptedAudioBase64: encryptedAudio.encrypted,
        encryptionMeta: encryptedAudio.meta,
      };

      const network = await NetInfo.fetch();
      if (!network.isConnected) {
        await enqueueSOS(payload);
        setStatus("SOS queued offline. Will auto-send once online.");
        return;
      }

      setStatus("Sending SOS with retry...");
      await postSOSWithRetry(payload);

      setStatus("SOS sent to trusted contacts");
      if (!silentMode) alert("SOS sent successfully");
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      setStatus("Failed to send SOS");
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.hiddenToggle} onLongPress={() => setSilentMode((prev) => !prev)}>
        <Text style={styles.hiddenText}>Long press to toggle discreet mode</Text>
      </Pressable>

      <Pressable style={styles.sosButton} onPress={triggerSOS}>
        <Text style={styles.sosLabel}>🚨 EMERGENCY SOS</Text>
      </Pressable>

      <Text style={styles.status}>Status: {status}</Text>
      <Text style={styles.mode}>Discreet mode: {silentMode ? "ON" : "OFF"}</Text>
      <ErrorState message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  hiddenToggle: { marginBottom: 20 },
  hiddenText: { color: "#6b7280" },
  sosButton: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  sosLabel: { color: "white", fontWeight: "800", fontSize: 26, textAlign: "center", paddingHorizontal: 16 },
  status: { marginTop: 20 },
  mode: { marginTop: 6, color: "#4b5563" },
});
