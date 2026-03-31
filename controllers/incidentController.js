const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const { analyzeIncidentText } = require('../services/aiService');
const { uploadEncryptedFile } = require('../services/storageService');
const { buildAndStoreInsight } = require('../services/aiInsightsService');
const { emitEvent } = require('../services/realtimeService');

const prisma = new PrismaClient();

exports.analyzeIncident = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const analysis = await analyzeIncidentText(text);
  res.json({ analysis });
});

exports.createIncident = asyncHandler(async (req, res) => {
  const {
    type,
    encryptedText,
    encryptedFileBase64,
    evidenceHash,
    evidenceMimeType,
    encryptionMeta,
    timestamp,
    aiResult,
    aiInputText,
    latitude,
    longitude
  } = req.body;

  let computedHash = evidenceHash;
  if (encryptedText) {
    computedHash = crypto.createHash('sha256').update(encryptedText).digest('hex');
  } else if (encryptedFileBase64) {
    computedHash = crypto.createHash('sha256').update(encryptedFileBase64).digest('hex');
  }

  if (computedHash !== evidenceHash) {
    res.status(400);
    throw new Error('Evidence hash mismatch');
  }

  const encryptedFileUrl = await uploadEncryptedFile(encryptedFileBase64, 'incident-evidence');

  const priorIncidents = await prisma.incident.findMany({
    where: { userId: req.user.id },
    orderBy: { timestamp: 'asc' },
    take: 20
  });

  const analysis = aiResult || (aiInputText ? await analyzeIncidentText(aiInputText) : null);

  const incident = await prisma.incident.create({
    data: {
      userId: req.user.id,
      type: type || analysis?.type || 'verbal',
      encryptedText,
      encryptedFileUrl,
      evidenceHash,
      evidenceMimeType,
      encryptionMeta,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      aiCategory: analysis?.category,
      aiWho: analysis?.who,
      aiWhen: analysis?.when,
      aiType: analysis?.type,
      aiSeverity: analysis?.severityScore,
      aiRaw: analysis?.raw || analysis || undefined,
      latitude,
      longitude
    }
  });

  const insightText = aiInputText || '[Encrypted evidence submitted by user]';
  const { insight } = await buildAndStoreInsight({
    userId: req.user.id,
    incidentId: incident.id,
    text: insightText,
    priorIncidents
  });

  emitEvent('incident:created', { incidentId: incident.id, type: incident.type, latitude, longitude, severity: incident.aiSeverity });

  res.status(201).json({ incident, insight });
});

exports.getIncidents = asyncHandler(async (req, res) => {
  const incidents = await prisma.incident.findMany({
    where: { userId: req.user.id },
    orderBy: { timestamp: 'desc' },
    include: {
      aiInsights: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  });

  res.json(incidents);
});

exports.getIncidentById = asyncHandler(async (req, res) => {
  const incident = await prisma.incident.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { aiInsights: true }
  });

  if (!incident) {
    res.status(404);
    throw new Error('Incident not found');
  }

  res.json(incident);
});

exports.getNearbyIncidents = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.query;
  const lat = Number(latitude);
  const lng = Number(longitude);

  let incidents = await prisma.incident.findMany({
    where: {
      userId: req.user.id,
      latitude: { not: null },
      longitude: { not: null }
    },
    orderBy: { timestamp: 'desc' },
    take: 200
  });

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    incidents = incidents.filter((incident) => {
      const dLat = (incident.latitude || 0) - lat;
      const dLng = (incident.longitude || 0) - lng;
      return Math.sqrt(dLat * dLat + dLng * dLng) <= 0.3;
    });
  }

  res.json({ incidents });
});
