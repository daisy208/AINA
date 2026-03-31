const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../utils/asyncHandler');

const prisma = new PrismaClient();

exports.getInsights = asyncHandler(async (req, res) => {
  const incidents = await prisma.incident.findMany({
    where: { userId: req.user.id },
    orderBy: { timestamp: 'desc' },
    take: 500
  });

  const byType = {};
  const byHour = {};
  const byArea = {};

  incidents.forEach((incident) => {
    byType[incident.type] = (byType[incident.type] || 0) + 1;

    const hour = new Date(incident.timestamp).getHours();
    byHour[hour] = (byHour[hour] || 0) + 1;

    if (incident.latitude && incident.longitude) {
      const key = `${incident.latitude.toFixed(2)},${incident.longitude.toFixed(2)}`;
      byArea[key] = (byArea[key] || 0) + 1;
    }
  });

  const topIncidentType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const peakHours = Object.entries(byHour)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour, count]) => ({ hour: Number(hour), count }));

  const riskyAreas = Object.entries(byArea)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([coord, count]) => ({ coord, count }));

  const safetyTips = [
    'Avoid traveling alone during peak risk hours.',
    'Share live location with trusted contacts when moving through risky zones.',
    'Use quick SOS trigger if you feel unsafe and preserve encrypted evidence.'
  ];

  res.json({ topIncidentType, peakHours, riskyAreas, safetyTips });
});
