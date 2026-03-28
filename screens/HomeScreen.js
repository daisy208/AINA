import React from "react";
import { View, Button } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ padding: 20 }}>
      <Button title="Add Incident" onPress={() => navigation.navigate("AddIncident")} />
      <Button title="View Incidents" onPress={() => navigation.navigate("Incidents")} />
      <Button title="SOS" onPress={() => navigation.navigate("SOS")} />
      <Button title="Contacts" onPress={() => navigation.navigate("Contacts")} />
      <Button title="Reports" onPress={() => navigation.navigate("Report")} />
    </View>
  );
}
