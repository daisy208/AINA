const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSummary = async (req, res) => {
  const incidents = await prisma.incident.findMany({
    where: { userId: req.user.id }
  });

  const total = incidents.length;
  const byType = {};

  incidents.forEach(i => {
    byType[i.type] = (byType[i.type] || 0) + 1;
  });

  res.json({ total, byType });
};