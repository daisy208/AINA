import React from "react";
import { View, Button } from "react-native";
import API from "../services/api";

export default function SOSScreen() {
  const triggerSOS = async () => {
    await API.post("/sos/trigger", {
      location: "user-location"
    });
    alert("SOS sent!");
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="🚨 EMERGENCY SOS" onPress={triggerSOS} />
    </View>
  );
}
