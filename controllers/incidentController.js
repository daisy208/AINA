const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createIncident = async (req, res) => {
  const data = req.body;
  const incident = await prisma.incident.create({
    data: { ...data, userId: req.user.id }
  });
  res.json(incident);
};

exports.getIncidents = async (req, res) => {
  const incidents = await prisma.incident.findMany({
    where: { userId: req.user.id }
  });
  res.json(incidents);
};