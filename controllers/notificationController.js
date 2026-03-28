const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../utils/asyncHandler');

const prisma = new PrismaClient();

exports.registerDeviceToken = asyncHandler(async (req, res) => {
  const { token, platform } = req.body;

  const saved = await prisma.deviceToken.upsert({
    where: { token },
    update: { platform },
    create: { token, platform, userId: req.user.id }
  });

  res.status(201).json(saved);
});
