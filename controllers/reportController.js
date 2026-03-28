const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../utils/asyncHandler');
const { buildIncidentSummary } = require('../services/patternService');
const { buildLegalTimeline, createPdfBuffer } = require('../services/legalReportService');

const prisma = new PrismaClient();

exports.getSummary = asyncHandler(async (req, res) => {
  const incidents = await prisma.incident.findMany({
    where: { userId: req.user.id },
    orderBy: { timestamp: 'asc' }
  });

  const insights = await prisma.aIInsight.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });

  const summary = buildIncidentSummary(incidents);
  const legalNarrative = insights.slice(0, 5).map((i) => i.legalSummary).join(' ');

  res.json({ ...summary, insights, legalNarrative });
});

exports.exportJsonReport = asyncHandler(async (req, res) => {
  const incidents = await prisma.incident.findMany({ where: { userId: req.user.id }, orderBy: { timestamp: 'asc' } });
  const insights = await prisma.aIInsight.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
  const summary = buildIncidentSummary(incidents);
  const timeline = buildLegalTimeline(incidents);

  res.json({ summary, timeline, insights });
});

exports.exportPdfReport = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const incidents = await prisma.incident.findMany({ where: { userId: req.user.id }, orderBy: { timestamp: 'asc' } });
  const insights = await prisma.aIInsight.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
  const summary = buildIncidentSummary(incidents);
  const timeline = buildLegalTimeline(incidents);
  const legalNarrative = insights.slice(0, 5).map((i) => i.legalSummary).join(' ');

  const buffer = await createPdfBuffer({
    userEmail: user?.email || 'unknown',
    summary,
    timeline,
    legalNarrative
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="aina-legal-report.pdf"');
  res.send(buffer);
});
