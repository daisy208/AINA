import React, { useState } from "react";
import { View, TextInput, Button } from "react-native";
import API from "../services/api";

export default function AddIncident() {
  const [desc, setDesc] = useState("");

  const submit = async () => {
    await API.post("/incident", {
      type: "verbal",
      description: desc,
      timestamp: new Date(),
      evidenceHash: "dummyhash"
    });
    alert("Incident added");
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Describe incident" onChangeText={setDesc} />
      <Button title="Submit" onPress={submit} />
    </View>
  );
}
