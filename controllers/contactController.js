const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addContact = async (req, res) => {
  const contact = await prisma.contact.create({
    data: { ...req.body, userId: req.user.id }
  });
  res.json(contact);
};

exports.getContacts = async (req, res) => {
  const contacts = await prisma.contact.findMany({
    where: { userId: req.user.id }
  });
  res.json(contacts);
};