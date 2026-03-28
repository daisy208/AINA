const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../utils/asyncHandler');

const prisma = new PrismaClient();

exports.replayProtection = asyncHandler(async (req, res, next) => {
  if (!req.user) return next();

  const nonce = req.headers['x-request-nonce'];
  const timestampHeader = req.headers['x-request-timestamp'];

  if (!nonce || !timestampHeader) {
    res.status(400);
    throw new Error('Missing replay-protection headers');
  }

  const timestamp = Number(timestampHeader);
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() - timestamp) > 5 * 60 * 1000) {
    res.status(400);
    throw new Error('Stale request timestamp');
  }

  const existing = await prisma.requestNonce.findUnique({ where: { nonce } });
  if (existing) {
    res.status(409);
    throw new Error('Replay attack detected');
  }

  await prisma.requestNonce.create({
    data: { nonce, userId: req.user.id }
  });

  next();
});
