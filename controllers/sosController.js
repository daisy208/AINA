const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../utils/asyncHandler');
const { notifyTrustedContacts } = require('../services/notificationService');
const { uploadEncryptedFile } = require('../services/storageService');

const prisma = new PrismaClient();

exports.triggerSOS = asyncHandler(async (req, res) => {
  const { location, encryptedAudioBase64, encryptionMeta, retryCount = 0 } = req.body;

  const contacts = await prisma.contact.findMany({
    where: { userId: req.user.id },
    orderBy: { priority: 'asc' }
  });

  let alertStatus = 'simulated';
  let notifications = [];

  try {
    const notification = await notifyTrustedContacts({ contacts, location, userId: req.user.id });
    alertStatus = notification.provider;
    notifications = notification.deliveredTo;
  } catch {
    alertStatus = 'fallback_sms';
    notifications = contacts.map((c) => ({ contactId: c.id, status: 'queued_sms_fallback' }));
  }

  const encryptedAudioUrl = await uploadEncryptedFile(encryptedAudioBase64, 'sos-audio');

  const log = await prisma.sOSLog.create({
    data: {
      userId: req.user.id,
      location,
      encryptedAudioUrl,
      encryptionMeta,
      alertStatus,
      contactsNotified: notifications.length,
      retryCount
    }
  });

  res.json({ message: 'SOS triggered', log, notifications });
});
