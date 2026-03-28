import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import API, { setAuthToken } from "../services/api";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await API.post("/auth/login", { email, password });
    setAuthToken(res.data.token);
    navigation.navigate("Home");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Email</Text>
      <TextInput onChangeText={setEmail} style={{ borderWidth: 1 }} />
      <Text>Password</Text>
      <TextInput secureTextEntry onChangeText={setPassword} style={{ borderWidth: 1 }} />
      <Button title="Login" onPress={login} />
      <Button title="Register" onPress={() => navigation.navigate("Register")} />
    </View>
  );
}
