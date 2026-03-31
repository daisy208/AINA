const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

const TYPES = ['verbal', 'physical', 'financial', 'threat'];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

async function run() {
  let user = await prisma.user.findUnique({ where: { email: 'demo@aina.app' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'demo@aina.app',
        password: '$2b$12$wBVdmYfFnv/JnE.0B96xOOk3iOI97x7X2s4rknDn4B2e7I27Qg9XW' // demo12345
      }
    });
  }

  const incidents = Array.from({ length: 40 }).map((_, idx) => {
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    const severity = Math.floor(randomBetween(2, 10));
    const lat = randomBetween(12.85, 13.10);
    const lng = randomBetween(77.45, 77.75);
    const encryptedText = `seeded-encrypted-payload-${idx}`;

    return {
      userId: user.id,
      type,
      encryptedText,
      evidenceHash: crypto.createHash('sha256').update(encryptedText).digest('hex'),
      timestamp: new Date(Date.now() - Math.floor(randomBetween(1, 14)) * 24 * 60 * 60 * 1000),
      latitude: lat,
      longitude: lng,
      aiCategory: type,
      aiType: type,
      aiSeverity: severity,
      aiWho: `Person-${Math.floor(randomBetween(1, 8))}`,
      aiWhen: 'evening',
      aiRaw: { seeded: true }
    };
  });

  await prisma.incident.createMany({ data: incidents });

  console.log(`Seeded ${incidents.length} incidents for ${user.email}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
