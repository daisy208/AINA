import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text } from "react-native";
import API from "../services/api";

export default function ContactsScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contacts, setContacts] = useState([]);

  const load = async () => {
    const res = await API.get("/contacts");
    setContacts(res.data);
  };

  const add = async () => {
    await API.post("/contacts", { name, phone, priority: 1 });
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View>
      <TextInput placeholder="Name" onChangeText={setName} />
      <TextInput placeholder="Phone" onChangeText={setPhone} />
      <Button title="Add" onPress={add} />
      {contacts.map(c => (
        <Text key={c.id}>{c.name} - {c.phone}</Text>
      ))}
    </View>
  );
}
