function getRiskLevel(total, escalationDetected, maxSeverity = 1, repeatedOffenderCount = 0) {
  if (maxSeverity >= 8 || escalationDetected || repeatedOffenderCount >= 3 || total >= 10) return 'high';
  if (maxSeverity >= 5 || total >= 4 || repeatedOffenderCount >= 2) return 'medium';
  return 'low';
}

function buildIncidentSummary(incidents = []) {
  const total = incidents.length;
  const byType = {};
  const daily = {};
  const weekly = {};
  const offenderCounts = {};
  let maxSeverity = 1;

  incidents.forEach((incident) => {
    byType[incident.type] = (byType[incident.type] || 0) + 1;

    const date = new Date(incident.timestamp);
    const dayKey = date.toISOString().slice(0, 10);
    daily[dayKey] = (daily[dayKey] || 0) + 1;

    const weekKey = `${date.getUTCFullYear()}-W${String(Math.ceil((date.getUTCDate() + 6 - date.getUTCDay()) / 7)).padStart(2, '0')}`;
    weekly[weekKey] = (weekly[weekKey] || 0) + 1;

    if (incident.aiWho && incident.aiWho !== 'unknown') {
      offenderCounts[incident.aiWho] = (offenderCounts[incident.aiWho] || 0) + 1;
    }

    maxSeverity = Math.max(maxSeverity, incident.aiSeverity || 1);
  });

  const sortedDays = Object.entries(daily).sort((a, b) => a[0].localeCompare(b[0]));
  let escalationDetected = false;

  for (let i = 1; i < sortedDays.length; i += 1) {
    if (sortedDays[i][1] > sortedDays[i - 1][1]) {
      escalationDetected = true;
      break;
    }
  }

  const mostFrequentType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const repeatedOffenders = Object.entries(offenderCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([who, count]) => ({ who, count }));

  return {
    totalIncidents: total,
    byType,
    byDaily: daily,
    byWeekly: weekly,
    escalationDetected,
    mostFrequentType,
    repeatedOffenders,
    maxSeverity,
    riskLevel: getRiskLevel(total, escalationDetected, maxSeverity, repeatedOffenders.length)
  };
}

module.exports = { buildIncidentSummary };
