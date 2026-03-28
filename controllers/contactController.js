const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../utils/asyncHandler');

const prisma = new PrismaClient();

exports.addContact = asyncHandler(async (req, res) => {
  const { name, phone, priority = 1 } = req.body;

  if (!name || !phone) {
    res.status(400);
    throw new Error('name and phone are required');
  }

  const contact = await prisma.contact.create({
    data: { name, phone, priority, userId: req.user.id }
  });

  res.status(201).json(contact);
});

exports.getContacts = asyncHandler(async (req, res) => {
  const contacts = await prisma.contact.findMany({
    where: { userId: req.user.id },
    orderBy: { priority: 'asc' }
  });

  res.json(contacts);
});
