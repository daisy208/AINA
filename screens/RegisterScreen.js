import React, { useState } from "react";
import { View, TextInput, Button } from "react-native";
import API from "../services/api";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    await API.post("/auth/register", { email, password });
    navigation.navigate("Login");
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />
      <Button title="Register" onPress={register} />
    </View>
  );
}
