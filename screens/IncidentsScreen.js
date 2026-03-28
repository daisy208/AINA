import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import API from "../services/api";

export default function IncidentsScreen() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/incident").then(res => setData(res.data));
  }, []);

  return (
    <View>
      {data.map((item) => (
        <Text key={item.id}>{item.description}</Text>
      ))}
    </View>
  );
}
