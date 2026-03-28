async function notifyTrustedContacts({ contacts, location, userId }) {
  // Simulated provider integration (SMS/WhatsApp).
  const deliveredTo = contacts.map((contact) => ({
    contactId: contact.id,
    phone: contact.phone,
    status: 'simulated_sent',
    channel: 'sms_whatsapp_sim',
    message: `SOS ALERT for user ${userId}. Last location: ${location}`
  }));

  return {
    provider: 'simulated',
    deliveredTo,
    count: deliveredTo.length
  };
}

module.exports = { notifyTrustedContacts };
