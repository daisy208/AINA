import React, { useEffect, useState } from "react";
import { registerPushToken } from "../mobile/notifications";
import { View, Text, StyleSheet, Switch } from "react-native";
import PrimaryButton from "../components/PrimaryButton";

export default function HomeScreen({ navigation }) {
  const [discreet, setDiscreet] = useState(false);

  useEffect(() => {
    registerPushToken().catch(() => null);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{discreet ? "Notes" : "AINA Safety Hub"}</Text>
      <Text style={styles.subtitle}>
        {discreet ? "Your personal notes dashboard." : "Capture legal evidence securely and trigger emergency help fast."}
      </Text>

      <View style={styles.row}>
        <Text>Discreet mode</Text>
        <Switch value={discreet} onValueChange={setDiscreet} />
      </View>

      <PrimaryButton title="Add Incident" onPress={() => navigation.navigate("AddIncident")} />
      <PrimaryButton title="View Incidents" onPress={() => navigation.navigate("Incidents")} />
      <PrimaryButton title="Emergency SOS" danger onPress={() => navigation.navigate("SOS")} />
      <PrimaryButton title="Trusted Contacts" onPress={() => navigation.navigate("Contacts")} />
      <PrimaryButton title="Smart Reports" onPress={() => navigation.navigate("Report")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    color: "#6b7280",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
});
