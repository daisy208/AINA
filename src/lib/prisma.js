const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

prisma.$on('query', (e) => {
  // optional query logging
  // logger.debug('prisma_query', { query: e.query, params: e.params, duration: e.duration });
});

module.exports = prisma;
