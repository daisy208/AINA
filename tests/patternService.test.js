const { buildIncidentSummary } = require('../services/patternService');

describe('buildIncidentSummary', () => {
  it('detects repeated offenders and high risk', () => {
    const incidents = [
      { type: 'verbal', timestamp: '2026-03-01T00:00:00.000Z', aiWho: 'X', aiSeverity: 4 },
      { type: 'threat', timestamp: '2026-03-02T00:00:00.000Z', aiWho: 'X', aiSeverity: 8 },
      { type: 'physical', timestamp: '2026-03-03T00:00:00.000Z', aiWho: 'X', aiSeverity: 9 }
    ];

    const summary = buildIncidentSummary(incidents);
    expect(summary.riskLevel).toBe('high');
    expect(summary.repeatedOffenders.length).toBe(1);
  });
});
