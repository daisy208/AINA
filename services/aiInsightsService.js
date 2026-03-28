const { PrismaClient } = require('@prisma/client');
const { analyzeIncidentText } = require('./aiService');

const prisma = new PrismaClient();

function riskFromSignals({ severity = 1, escalation = false, repeatedOffender = false }) {
  if (severity >= 8 || escalation) return 'high';
  if (severity >= 5 || repeatedOffender) return 'medium';
  return 'low';
}

async function buildAndStoreInsight({ userId, incidentId, text, priorIncidents = [] }) {
  const ai = await analyzeIncidentText(text);
  const repeatedOffender = priorIncidents.some((i) => i.aiWho && i.aiWho === ai.who);
  const escalation = priorIncidents.slice(-3).some((i) => (i.aiSeverity || 0) < ai.severityScore);
  const riskLevel = riskFromSignals({
    severity: ai.severityScore,
    escalation,
    repeatedOffender
  });

  const legalSummary = `Incident categorized as ${ai.type} with severity ${ai.severityScore}/10. Reported actor: ${ai.who}. Time context: ${ai.when}. Risk level assessed as ${riskLevel}.`;

  const insight = await prisma.aIInsight.create({
    data: {
      userId,
      incidentId,
      riskLevel,
      legalSummary,
      repeatedOffender: repeatedOffender ? ai.who : null,
      escalation,
      confidenceScore: 0.72
    }
  });

  return { ai, insight };
}

module.exports = { buildAndStoreInsight, riskFromSignals };
