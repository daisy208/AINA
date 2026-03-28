const PDFDocument = require('pdfkit');

function buildLegalTimeline(incidents = []) {
  return incidents
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map((item) => ({
      timestamp: item.timestamp,
      type: item.type,
      severity: item.aiSeverity,
      who: item.aiWho,
      when: item.aiWhen,
      hash: item.evidenceHash
    }));
}

function createPdfBuffer({ userEmail, summary, timeline, legalNarrative }) {
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];

  return new Promise((resolve) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(20).text('AINA Legal Evidence Report');
    doc.moveDown();
    doc.fontSize(12).text(`Generated for: ${userEmail}`);
    doc.text(`Generated at: ${new Date().toISOString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Summary');
    doc.fontSize(11).text(`Total incidents: ${summary.totalIncidents}`);
    doc.text(`Most frequent type: ${summary.mostFrequentType || 'N/A'}`);
    doc.text(`Escalation detected: ${summary.escalationDetected ? 'Yes' : 'No'}`);
    doc.text(`Risk level: ${summary.riskLevel}`);
    doc.moveDown();

    doc.fontSize(14).text('AI Legal Narrative');
    doc.fontSize(11).text(legalNarrative || 'No narrative available.');
    doc.moveDown();

    doc.fontSize(14).text('Incident Timeline');
    timeline.forEach((t, idx) => {
      doc.fontSize(10).text(`${idx + 1}. ${new Date(t.timestamp).toISOString()} | ${t.type} | severity ${t.severity || 'N/A'} | who: ${t.who || 'unknown'} | hash: ${t.hash}`);
    });

    doc.end();
  });
}

module.exports = { buildLegalTimeline, createPdfBuffer };
