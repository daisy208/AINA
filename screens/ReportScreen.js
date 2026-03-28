import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import API from "../services/api";

export default function ReportScreen() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    API.get("/report/summary").then(res => setReport(res.data));
  }, []);

  if (!report) return <Text>Loading...</Text>;

  return (
    <View>
      <Text>Total Incidents: {report.total}</Text>
      {Object.keys(report.byType).map(key => (
        <Text key={key}>{key}: {report.byType[key]}</Text>
      ))}
    </View>
  );
}
