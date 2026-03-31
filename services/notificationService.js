async function sendViaTwilio(contacts, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) return null;

  const twilio = require('twilio')(accountSid, authToken);

  const deliveredTo = [];
  for (const contact of contacts) {
    try {
      await twilio.messages.create({ body: message, from: fromNumber, to: contact.phone });

      if (process.env.TWILIO_ENABLE_CALLS === 'true') {
        await twilio.calls.create({
          twiml: `<Response><Say voice="alice">Emergency alert from AINA. Please check your messages now.</Say></Response>`,
          from: fromNumber,
          to: contact.phone
        });
      }

      deliveredTo.push({ contactId: contact.id, phone: contact.phone, status: 'sent', channel: 'twilio' });
    } catch {
      deliveredTo.push({ contactId: contact.id, phone: contact.phone, status: 'failed', channel: 'twilio' });
    }
  }

  return {
    provider: 'twilio',
    deliveredTo,
    count: deliveredTo.filter((x) => x.status === 'sent').length
  };
}

async function notifyTrustedContacts({ contacts, location, userId }) {
  const message = `SOS ALERT for user ${userId}. Last location: ${location}`;

  const twilioResult = await sendViaTwilio(contacts, message);
  if (twilioResult) return twilioResult;

  const deliveredTo = contacts.map((contact) => ({
    contactId: contact.id,
    phone: contact.phone,
    status: 'simulated_sent',
    channel: 'sms_whatsapp_sim',
    message
  }));

  return {
    provider: 'simulated',
    deliveredTo,
    count: deliveredTo.length
  };
}

module.exports = { notifyTrustedContacts };
