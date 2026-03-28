import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import API from "../services/api";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import PrimaryButton from "../components/PrimaryButton";

export default function ReportScreen() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/report/summary")
      .then((res) => setReport(res.data))
      .catch((e) => setError(e.response?.data?.message || e.message));
  }, []);

  const exportJson = async () => {
    const res = await API.get("/report/export/json");
    alert(`JSON report generated with ${res.data.timeline.length} timeline events`);
  };

  const exportPdf = async () => {
    const base = API.defaults.baseURL;
    Linking.openURL(`${base}/report/export/pdf`);
  };

  if (!report && !error) return <LoadingState label="Building legal-grade report..." />;

  return (
    <ScrollView style={styles.container}>
      <ErrorState message={error} />
      {report && (
        <>
          <Text style={styles.title}>Pattern Detection Summary</Text>
          <Text>Total Incidents: {report.totalIncidents}</Text>
          <Text>Most Frequent Abuse Type: {report.mostFrequentType || "N/A"}</Text>
          <Text>Escalation Trend: {report.escalationDetected ? "Detected" : "Not detected"}</Text>
          <Text>Risk Level: {report.riskLevel}</Text>
          <Text>Repeated Offenders: {(report.repeatedOffenders || []).map((x) => x.who).join(", ") || "None"}</Text>

          <Text style={styles.section}>AI Legal Narrative</Text>
          <Text>{report.legalNarrative || "No narrative available"}</Text>

          <Text style={styles.section}>Daily Trend</Text>
          {Object.keys(report.byDaily || {}).map((key) => (
            <Text key={key}>{key}: {report.byDaily[key]}</Text>
          ))}

          <PrimaryButton title="Export JSON" onPress={exportJson} />
          <PrimaryButton title="Export PDF" onPress={exportPdf} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  section: { marginTop: 14, fontWeight: "700", marginBottom: 6 },
});
