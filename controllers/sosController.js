const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.triggerSOS = async (req, res) => {
  const { location } = req.body;
  const log = await prisma.sOSLog.create({
    data: { userId: req.user.id, location }
  });
  res.json({ message: "SOS triggered", log });
};