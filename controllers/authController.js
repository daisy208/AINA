const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../utils/asyncHandler');

const prisma = new PrismaClient();

function buildToken(userId) {
  return jwt.sign(
    { sub: userId, type: 'access' },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: process.env.JWT_ISSUER || 'aina-api',
      audience: process.env.JWT_AUDIENCE || 'aina-mobile'
    }
  );
}

exports.register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409);
    throw new Error('User already exists');
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, password: hash } });

  res.status(201).json({ id: user.id, email: user.email, createdAt: user.createdAt });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = buildToken(user.id);
  res.json({ token, tokenType: 'Bearer', expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
});
